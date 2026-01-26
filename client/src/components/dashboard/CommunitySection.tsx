import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { ImageUpload } from "@/components/ui/image-upload";
import type { SocialAccount, CommunityPost } from "@shared/schema";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 24;

function getPageFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('communityPage') || '1', 10);
    return page > 0 ? page : 1;
}

export function CommunitySection() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
    const [currentPage, setCurrentPage] = useState(getPageFromUrl);

    const { data: accounts } = useQuery<SocialAccount[]>({
        queryKey: ["/api/admin/social-accounts"],
    });

    const { data, isLoading } = useQuery<{ posts: CommunityPost[], total: number }>({
        queryKey: ["/api/admin/community-posts", currentPage],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/admin/community-posts?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
            return res.json();
        }
    });

    const posts = data?.posts || [];
    const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('communityPage', page.toString());
        window.history.pushState({}, '', url.toString());
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages: (number | 'ellipsis')[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (showEllipsisStart) pages.push('ellipsis');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (showEllipsisEnd) pages.push('ellipsis');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                    {pages.map((page, idx) =>
                        page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/community-posts", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/community-posts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "포스트가 생성되었습니다." });
            setIsDialogOpen(false);
            setEditingPost(null);
            setImages([]);
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const { id, ...rest } = data;
            await apiRequest("PUT", `/api/admin/community-posts/${id}`, rest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/community-posts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "포스트가 수정되었습니다." });
            setIsDialogOpen(false);
            setEditingPost(null);
            setImages([]);
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/community-posts/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/community-posts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "포스트가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    // handleScan function removed


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const hashtagsInput = formData.get("hashtags") as string || "";
        const hashtags = hashtagsInput
            .split(",")
            .map((tag) => tag.trim().replace(/^#/, ""))
            .filter(Boolean);
        const accountId = formData.get("accountId") as string;

        const data = {
            imageUrl: images.filter(Boolean)[0] || null, // First valid image as thumbnail
            images: images.filter(Boolean).length > 0 ? images.filter(Boolean) : null,
            caption: formData.get("caption") as string,
            location: formData.get("location") as string,
            sourceUrl: (formData.get("sourceUrl") as string) || null,
            accountId: accountId && accountId !== "none" ? accountId : null,
            hashtags: hashtags.length > 0 ? hashtags : null,
            embedCode: (formData.get("embedCode") as string) || null,
            postedAt: formData.get("postedAt") ? new Date(formData.get("postedAt") as string).toISOString() : new Date().toISOString(),
        };

        if (editingPost) {
            updateMutation.mutate({ ...data, id: editingPost.id });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (post: CommunityPost) => {
        setEditingPost(post);
        setImages(post.images || (post.imageUrl ? [post.imageUrl] : []));
        setIsDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingPost(null);
            setImages([]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">소셜 스트림 관리</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        인스타그램/블로그 게시물을 등록하세요. 해시태그로 필터링됩니다.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-add-community-post">
                            <Plus className="w-4 h-4 mr-2" />
                            새 포스트
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPost ? "포스트 수정" : "새 소셜 포스트"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="accountId">소셜 계정 (선택)</Label>
                                    <Select name="accountId" defaultValue={editingPost?.accountId || "none"}>
                                        <SelectTrigger data-testid="select-community-account">
                                            <SelectValue placeholder="계정 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">계정 없음</SelectItem>
                                            {accounts?.map(account => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.name} ({account.platform})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postedAt">게시 날짜</Label>
                                    <Input
                                        id="postedAt"
                                        name="postedAt"
                                        type="date"
                                        defaultValue={
                                            editingPost?.postedAt
                                                ? format(new Date(editingPost.postedAt), 'yyyy-MM-dd')
                                                : format(new Date(), 'yyyy-MM-dd')
                                        }
                                        data-testid="input-community-date"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>이미지 (여러 장 선택 가능)</Label>
                                <Input
                                    type="hidden"
                                    name="images"
                                    value={JSON.stringify(images)}
                                    readOnly
                                />
                                <ImageUpload
                                    value={images}
                                    onChange={(val) => setImages(Array.isArray(val) ? val : [val])}
                                    maxFiles={10}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="embedCode">임베드 코드 (Instagram/Youtube 등)</Label>
                                <Textarea
                                    id="embedCode"
                                    name="embedCode"
                                    defaultValue={editingPost?.embedCode || ""}
                                    placeholder="<blockquote... 또는 <iframe..."
                                    className="font-mono text-xs"
                                    rows={4}
                                    data-testid="input-community-embed-code"
                                />
                                <p className="text-xs text-muted-foreground">
                                    이미지 대신 소셜 미디어 게시물을 직접 표시하려면 여기에 코드를 입력하세요.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sourceUrl">원본 게시물 링크</Label>
                                <Input
                                    id="sourceUrl"
                                    name="sourceUrl"
                                    defaultValue={editingPost?.sourceUrl || ""}
                                    placeholder="https://instagram.com/p/..."
                                    data-testid="input-community-source-url"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caption">설명</Label>
                                <Textarea
                                    id="caption"
                                    name="caption"
                                    defaultValue={editingPost?.caption || ""}
                                    placeholder="게시물 내용"
                                    data-testid="input-community-caption"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">위치</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={editingPost?.location || ""}
                                    placeholder="예: 안암생활 공유주방"
                                    data-testid="input-community-location"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hashtags">해시태그 (쉼표로 구분)</Label>
                                <Input
                                    id="hashtags"
                                    name="hashtags"
                                    defaultValue={editingPost?.hashtags?.map(h => `#${h}`).join(", ") || ""}
                                    placeholder="소모임, 파티, 원데이클래스, 입주민일상"
                                    data-testid="input-community-hashtags"
                                />
                                <p className="text-xs text-muted-foreground">
                                    추천: 소모임, 파티, 원데이클래스, 입주민일상, 플리마켓
                                </p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-community-post">
                                    {editingPost ? "수정" : "생성"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !posts || posts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 포스트가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {posts?.map((post) => {
                            const account = post.accountId ? accounts?.find(a => a.id === post.accountId) : null;
                            return (
                                <Card key={post.id} data-testid={`card-community-post-${post.id}`} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        {post.embedCode ? (
                                            <div
                                                className="w-full h-24 overflow-hidden [&>iframe]:w-full [&>iframe]:h-full [&>blockquote]:w-full"
                                                dangerouslySetInnerHTML={{ __html: post.embedCode }}
                                            />
                                        ) : post.imageUrl ? (
                                            <img
                                                src={post.imageUrl}
                                                alt={post.caption || "커뮤니티 포스트"}
                                                className="w-full h-24 object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full h-24 bg-muted flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">이미지 없음</span>
                                            </div>
                                        )}
                                        <div className="p-2 space-y-1">
                                            {account && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    {account.platform === 'instagram' && <SiInstagram className="w-3 h-3" />}
                                                    <span className="font-medium truncate">{account.name}</span>
                                                </div>
                                            )}
                                            {post.caption && (
                                                <p className="text-xs line-clamp-1">{post.caption}</p>
                                            )}
                                            {post.hashtags && post.hashtags.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5">
                                                    {post.hashtags.slice(0, 2).map((tag, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                    {post.hashtags.length > 2 && (
                                                        <span className="text-[10px] text-muted-foreground">+{post.hashtags.length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-end gap-1 pt-1">
                                                {post.sourceUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => window.open(post.sourceUrl!, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleEdit(post)}
                                                >
                                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => deleteMutation.mutate(post.id)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}
