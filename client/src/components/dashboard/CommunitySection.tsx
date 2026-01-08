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
import { Plus, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { ImageUpload } from "@/components/ui/image-upload";
import type { SocialAccount, CommunityPost } from "@shared/schema";

export function CommunitySection() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<{ caption?: string } | null>(null);

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
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
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

    const handleScan = async (url: string) => {
        if (!url) return;
        setIsScanning(true);
        try {
            // Updated to use the correct API endpoint path which should be /api/admin/extract-metadata
            // But wait, my implementation plan and code used /api/admin/extract-metadata
            const res = await fetch("/api/admin/extract-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            if (data.imageUrl) {
                setImageUrl(data.imageUrl);
                toast({ title: "이미지를 가져왔습니다." });
            }
            // Optional: Auto-fill caption if empty? default to not overwriting for now unless we want to.
            // Let's store it to suggest or fill if empty.
            if (data.description || data.title) {
                setScannedData({ caption: data.description || data.title });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "메타데이터를 가져올 수 없습니다.", variant: "destructive" });
        } finally {
            setIsScanning(false);
        }
    };

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
            embedCode: (formData.get("embedCode") as string) || undefined,
            caption: formData.get("caption") as string,
            location: formData.get("location") as string,
            sourceUrl: formData.get("sourceUrl") as string || undefined,
            accountId: accountId && accountId !== "none" ? accountId : undefined,
            hashtags: hashtags.length > 0 ? hashtags : undefined,
        };

        createMutation.mutate(data);
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-add-community-post">
                            <Plus className="w-4 h-4 mr-2" />
                            새 포스트
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>새 소셜 포스트</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="accountId">소셜 계정 (선택)</Label>
                                <Select name="accountId" defaultValue="none">
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
                            <div className="space-y-2">
                                <Label htmlFor="embedCode">임베드 코드 (이미지 대신 사용 가능)</Label>
                                <Textarea
                                    id="embedCode"
                                    name="embedCode"
                                    placeholder="Instagram/Youtube/Naver 등에서 복사한 임베드 코드를 붙여넣으세요. (iframe, blockquote 등)"
                                    className="font-mono text-xs"
                                    data-testid="input-community-embed-code"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sourceUrl">원본 게시물 링크</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="sourceUrl"
                                        name="sourceUrl"
                                        placeholder="https://instagram.com/p/..."
                                        data-testid="input-community-source-url"
                                        onBlur={(e) => {
                                            if (e.target.value && !imageUrl) handleScan(e.target.value);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={isScanning}
                                        onClick={() => {
                                            const input = document.getElementById("sourceUrl") as HTMLInputElement;
                                            handleScan(input.value);
                                        }}
                                        title="이미지 자동 가져오기"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">링크 입력 후 자동으로 이미지를 가져옵니다.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caption">설명</Label>
                                <Textarea
                                    id="caption"
                                    name="caption"
                                    placeholder="게시물 내용"
                                    data-testid="input-community-caption"
                                    defaultValue={scannedData?.caption}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">위치</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="예: 안암생활 공유주방"
                                    data-testid="input-community-location"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hashtags">해시태그 (쉼표로 구분)</Label>
                                <Input
                                    id="hashtags"
                                    name="hashtags"
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
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-community-post">
                                    생성
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
