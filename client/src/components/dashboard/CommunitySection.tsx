import { useState } from "react";
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
import { Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { ImageUpload } from "@/components/ui/image-upload";
import type { SocialAccount, CommunityPost } from "@shared/schema";

export function CommunitySection() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
    // Scanned data state removed


    const { data: accounts } = useQuery<SocialAccount[]>({
        queryKey: ["/api/admin/social-accounts"],
    });

    const { data: posts, isLoading } = useQuery<CommunityPost[]>({
        queryKey: ["/api/admin/community-posts"],
    });

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
            setImageUrl("");
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
            setImageUrl("");
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
            imageUrl: (formData.get("imageUrl") as string) || undefined,
            caption: formData.get("caption") as string,
            location: formData.get("location") as string,
            sourceUrl: formData.get("sourceUrl") as string || undefined,
            accountId: accountId && accountId !== "none" ? accountId : undefined,
            hashtags: hashtags.length > 0 ? hashtags : undefined,
        };

        if (editingPost) {
            updateMutation.mutate({ ...data, id: editingPost.id });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (post: CommunityPost) => {
        setEditingPost(post);
        setImageUrl(post.imageUrl || "");
        setIsDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingPost(null);
            setImageUrl("");
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
                                <Label>이미지 URL (선택)</Label>
                                <Input
                                    type="hidden"
                                    name="imageUrl"
                                    value={imageUrl}
                                    readOnly
                                    data-testid="input-community-image-hidden"
                                />
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                />
                            </div>
                            {/* Embed Code input removed */}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post) => {
                        const account = post.accountId ? accounts?.find(a => a.id === post.accountId) : null;
                        return (
                            <Card key={post.id} data-testid={`card-community-post-${post.id}`}>
                                <CardContent className="p-0">
                                    {post.embedCode ? (
                                        <div
                                            className="w-full overflow-hidden rounded-t-md [&>iframe]:w-full [&>blockquote]:w-full"
                                            dangerouslySetInnerHTML={{ __html: post.embedCode }}
                                        />
                                    ) : post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt={post.caption || "커뮤니티 포스트"}
                                            className="w-full h-48 object-cover rounded-t-md"
                                        />
                                    ) : null}
                                    <div className="p-4 space-y-2">
                                        {account && (
                                            <div className="flex items-center gap-2 text-sm">
                                                {account.platform === 'instagram' && <SiInstagram className="w-4 h-4" />}
                                                <span className="font-medium">{account.name}</span>
                                            </div>
                                        )}
                                        {post.caption && (
                                            <p className="text-sm line-clamp-2">{post.caption}</p>
                                        )}
                                        {post.location && (
                                            <p className="text-xs text-muted-foreground">{post.location}</p>
                                        )}
                                        {post.hashtags && post.hashtags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {post.hashtags.map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-2">
                                            {post.sourceUrl && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(post.sourceUrl!, '_blank')}
                                                    data-testid={`button-open-post-${post.id}`}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    원본
                                                </Button>
                                            )}
                                            <div className="flex-1" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(post)}
                                                className="mr-1"
                                                data-testid={`button-edit-community-post-${post.id}`}
                                            >
                                                <Pencil className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(post.id)}
                                                data-testid={`button-delete-community-post-${post.id}`}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
