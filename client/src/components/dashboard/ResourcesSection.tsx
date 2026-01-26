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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { FileUpload } from "@/components/ui/file-upload";
import type { Article } from "@shared/schema";

export function ResourcesSection() {
    const { toast } = useToast();
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [content, setContent] = useState("");
    const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0]);

    // Fetch all articles, but we will filter them on the client side for now as the API returns all.
    // Optimization: In real world, we might want a query param to filter by category on backend.
    // Fetch all articles, but we will filter them on the client side for now as the API returns all.
    // Optimization: In real world, we might want a query param to filter by category on backend.
    const { data, isLoading } = useQuery<{ articles: Article[], total: number }>({
        queryKey: ["/api/admin/articles", "all"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/admin/articles?page=1&limit=1000");
            return res.json();
        }
    });

    const articles = data?.articles || [];

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/articles", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "자료가 생성되었습니다." });
            setIsDialogOpen(false);
        },
        onError: (error) => {
            toast({
                title: "생성 실패",
                description: error.message || "알 수 없는 오류가 발생했습니다.",
                variant: "destructive"
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PUT", `/api/admin/articles/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
            toast({ title: "자료가 수정되었습니다." });
            setEditingArticle(null);
            setIsDialogOpen(false);
        },
        onError: (error) => {
            toast({
                title: "수정 실패",
                description: error.message || "알 수 없는 오류가 발생했습니다.",
                variant: "destructive"
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/articles/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "자료가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const openDialog = (article: Article | null) => {
        setEditingArticle(article);
        if (article) {
            setIsFeatured(article.featured ?? false);
            setImageUrl(article.imageUrl ?? "");
            setFileUrl(article.fileUrl ?? "");
            setContent(article.content);
            setPublishedAt(article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        } else {
            setIsFeatured(false);
            setImageUrl("");
            setFileUrl("");
            setContent("");
            setPublishedAt(new Date().toISOString().split('T')[0]);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = {
            title: formData.get("title") as string,
            excerpt: formData.get("excerpt") as string,
            content: content,
            author: formData.get("author") as string,
            category: "library", // Hardcoded category
            featured: isFeatured,
            imageUrl: imageUrl || null, // Send null if empty string
            fileUrl: fileUrl || null,   // Send null if empty string
            publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
        };

        if (editingArticle) {
            updateMutation.mutate({ id: editingArticle.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Filter for library category
    const libraryArticles = articles?.filter(a => a.category === "library") || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">자료실 관리</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog(null)} data-testid="button-add-resource">
                            <Plus className="w-4 h-4 mr-2" />
                            새 자료
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingArticle ? "자료 수정" : "새 자료 등록"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">제목</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={editingArticle?.title}
                                    required
                                    data-testid="input-resource-title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="author">작성자</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        defaultValue={editingArticle?.author}
                                        required
                                        data-testid="input-resource-author"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="publishedAt">등록일</Label>
                                    <Input
                                        id="publishedAt"
                                        name="publishedAt"
                                        type="date"
                                        value={publishedAt}
                                        onChange={(e) => setPublishedAt(e.target.value)}
                                        required
                                        data-testid="input-resource-publishedAt"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="excerpt">요약</Label>
                                <Input
                                    id="excerpt"
                                    name="excerpt"
                                    defaultValue={editingArticle?.excerpt}
                                    required
                                    data-testid="input-resource-excerpt"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>내용</Label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    className="min-h-[200px] mb-12"
                                />
                                <input type="hidden" name="content" value={content} />
                            </div>
                            <div className="space-y-2">
                                <Label>대표 이미지 (선택)</Label>
                                <Input
                                    type="hidden"
                                    name="imageUrl"
                                    value={imageUrl}
                                    readOnly
                                    data-testid="input-resource-image-hidden"
                                />
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={(url) => setImageUrl(url as string)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>첨부 파일 (PDF)</Label>
                                <Input
                                    type="hidden"
                                    name="fileUrl"
                                    value={fileUrl}
                                    readOnly
                                    data-testid="input-resource-file-hidden"
                                />
                                <FileUpload
                                    value={fileUrl}
                                    onChange={setFileUrl}
                                    accept=".pdf"
                                    label="PDF 파일 업로드"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="featured"
                                    checked={isFeatured}
                                    onCheckedChange={(checked) => setIsFeatured(checked === true)}
                                    data-testid="checkbox-resource-featured"
                                />
                                <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                                    추천 자료로 설정
                                </Label>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-resource">
                                    {editingArticle ? "수정" : "생성"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : libraryArticles.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 자료가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {libraryArticles.map((article) => (
                        <Card key={article.id} data-testid={`card-resource-${article.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {article.imageUrl && (
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="w-24 h-16 object-cover rounded-md"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-medium">{article.title}</h3>
                                            {article.featured && <Badge>추천</Badge>}
                                            {article.fileUrl && (
                                                <Badge variant="outline" className="gap-1 text-muted-foreground">
                                                    <FileText className="w-3 h-3" />
                                                    파일 첨부됨
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {article.author} | {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("ko-KR") : ""}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDialog(article)}
                                            data-testid={`button-edit-resource-${article.id}`}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMutation.mutate(article.id)}
                                            data-testid={`button-delete-resource-${article.id}`}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
