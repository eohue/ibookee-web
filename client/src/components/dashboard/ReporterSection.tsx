import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Edit, Trash2, Eye, Calendar, Clock } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ResidentReporter } from "@shared/schema";
import { useState } from "react";

export function ReporterSection() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingArticle, setEditingArticle] = useState<ResidentReporter | null>(null);
    const [viewingArticle, setViewingArticle] = useState<ResidentReporter | null>(null);
    const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);

    const { data: articles = [], isLoading } = useQuery<ResidentReporter[]>({
        queryKey: ["/api/admin/resident-reporter"],
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/resident-reporter/${id}/status`, { status });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/resident-reporter"] });
            toast({
                title: "상태 업데이트 성공",
                description: "기사 상태가 변경되었습니다.",
            });
        },
        onError: () => {
            toast({
                title: "업데이트 실패",
                description: "상태 변경 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        },
    });

    const editMutation = useMutation({
        mutationFn: async (data: { id: string; title: string; content: string; authorName: string; imageUrl: string }) => {
            const res = await apiRequest("PUT", `/api/admin/resident-reporter/${data.id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/resident-reporter"] });
            toast({ title: "기사가 수정되었습니다." });
            setEditingArticle(null);
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiRequest("DELETE", `/api/admin/resident-reporter/${id}`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/resident-reporter"] });
            toast({ title: "기사가 삭제되었습니다." });
            setDeletingArticleId(null);
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const handleStatusChange = (id: string, status: string) => {
        statusMutation.mutate({ id, status });
    };

    const pendingArticles = articles.filter(a => a.status === "pending");
    const approvedArticles = articles.filter(a => a.status === "approved");
    const rejectedArticles = articles.filter(a => a.status === "rejected");

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">입주민 기자단 관리</h2>
                <p className="text-muted-foreground">
                    접수된 입주민 기사를 검토하고 승인합니다.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>대기 중인 기사 ({pendingArticles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ArticleTable
                        articles={pendingArticles}
                        onApprove={(id) => handleStatusChange(id, "approved")}
                        onReject={(id) => handleStatusChange(id, "rejected")}
                        onEdit={setEditingArticle}
                        onDelete={setDeletingArticleId}
                        onView={setViewingArticle}
                        showActions
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>승인된 기사 ({approvedArticles.length})</CardTitle>
                    <CardDescription>승인된 기사는 커뮤니티 페이지에 노출됩니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ArticleTable
                        articles={approvedArticles}
                        onEdit={setEditingArticle}
                        onDelete={setDeletingArticleId}
                        onView={setViewingArticle}
                        showManageActions
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>반려된 기사 ({rejectedArticles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ArticleTable
                        articles={rejectedArticles}
                        onEdit={setEditingArticle}
                        onDelete={setDeletingArticleId}
                        onView={setViewingArticle}
                        onApprove={(id) => handleStatusChange(id, "approved")}
                        showReapprove
                    />
                </CardContent>
            </Card>

            {/* View Article Modal */}
            <Dialog open={!!viewingArticle} onOpenChange={() => setViewingArticle(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{viewingArticle?.title}</DialogTitle>
                        <DialogDescription>
                            {viewingArticle?.authorName} 기자
                        </DialogDescription>
                    </DialogHeader>
                    {viewingArticle && (
                        <div className="space-y-4">
                            {viewingArticle.imageUrl && (
                                <img src={viewingArticle.imageUrl} alt={viewingArticle.title} className="w-full rounded-lg" />
                            )}
                            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    작성일: {new Date(viewingArticle.createdAt || "").toLocaleDateString("ko-KR")}
                                </div>
                                {viewingArticle.approvedAt && (
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        승인일: {new Date(viewingArticle.approvedAt).toLocaleDateString("ko-KR")}
                                    </div>
                                )}
                                {viewingArticle.updatedAt && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        수정일: {new Date(viewingArticle.updatedAt).toLocaleDateString("ko-KR")}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Article Modal */}
            <EditArticleDialog
                article={editingArticle}
                onClose={() => setEditingArticle(null)}
                onSave={(data) => editMutation.mutate(data)}
                isPending={editMutation.isPending}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingArticleId} onOpenChange={() => setDeletingArticleId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>기사를 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 기사가 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingArticleId && deleteMutation.mutate(deletingArticleId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ArticleTable({
    articles,
    onApprove,
    onReject,
    onEdit,
    onDelete,
    onView,
    showActions,
    showManageActions,
    showReapprove
}: {
    articles: ResidentReporter[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onEdit?: (article: ResidentReporter) => void;
    onDelete?: (id: string) => void;
    onView?: (article: ResidentReporter) => void;
    showActions?: boolean;
    showManageActions?: boolean;
    showReapprove?: boolean;
}) {
    if (articles.length === 0) {
        return <p className="text-muted-foreground text-sm py-4">데이터가 없습니다.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>이력</TableHead>
                    <TableHead>관리</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {articles.map((article) => (
                    <TableRow key={article.id}>
                        <TableCell>
                            <div className="font-medium">{article.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {article.content?.replace(/<[^>]*>/g, '').substring(0, 50)}...
                            </div>
                        </TableCell>
                        <TableCell>{article.authorName}</TableCell>
                        <TableCell>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    작성: {new Date(article.createdAt || "").toLocaleDateString()}
                                </div>
                                {article.approvedAt && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-3 h-3" />
                                        승인: {new Date(article.approvedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {article.updatedAt && (
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <Clock className="w-3 h-3" />
                                        수정: {new Date(article.updatedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1.5 flex-wrap">
                                <Button size="sm" variant="ghost" onClick={() => onView?.(article)}>
                                    <Eye className="w-4 h-4" />
                                </Button>
                                {showActions && (
                                    <>
                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => onApprove?.(article.id)}>
                                            <CheckCircle className="w-4 h-4 mr-1" /> 승인
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onReject?.(article.id)}>
                                            <XCircle className="w-4 h-4 mr-1" /> 반려
                                        </Button>
                                    </>
                                )}
                                {showReapprove && (
                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => onApprove?.(article.id)}>
                                        <CheckCircle className="w-4 h-4 mr-1" /> 재승인
                                    </Button>
                                )}
                                {(showManageActions || showActions || showReapprove) && (
                                    <>
                                        <Button size="sm" variant="ghost" onClick={() => onEdit?.(article)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete?.(article.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function EditArticleDialog({
    article,
    onClose,
    onSave,
    isPending
}: {
    article: ResidentReporter | null;
    onClose: () => void;
    onSave: (data: { id: string; title: string; content: string; authorName: string; imageUrl: string }) => void;
    isPending: boolean;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Reset form when article changes
    if (article && title === "" && content === "") {
        setTitle(article.title);
        setContent(article.content);
        setAuthorName(article.authorName);
        setImageUrl(article.imageUrl || "");
    }

    const handleClose = () => {
        setTitle("");
        setContent("");
        setAuthorName("");
        setImageUrl("");
        onClose();
    };

    const handleSave = () => {
        if (!article) return;
        onSave({
            id: article.id,
            title,
            content,
            authorName,
            imageUrl,
        });
        setTitle("");
        setContent("");
        setAuthorName("");
        setImageUrl("");
    };

    return (
        <Dialog open={!!article} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>기사 수정</DialogTitle>
                    <DialogDescription>기사 내용을 수정합니다. 수정일이 자동으로 기록됩니다.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>제목</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>작성자</Label>
                        <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>대표 이미지</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(typeof url === 'string' ? url : url[0])}
                            maxFiles={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>본문</Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[200px]"
                        />
                        <p className="text-xs text-muted-foreground">HTML 형식으로 입력할 수 있습니다.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>취소</Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
