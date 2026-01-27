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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { ResidentReporter } from "@shared/schema";
import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 10;

function getPageFromUrl(paramName: string): number {
    if (typeof window === 'undefined') return 1;
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get(paramName) || '1', 10);
    return page > 0 ? page : 1;
}

export function ReporterSection() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingArticle, setEditingArticle] = useState<ResidentReporter | null>(null);
    const [viewingArticle, setViewingArticle] = useState<ResidentReporter | null>(null);
    const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);

    // Page states
    const [pendingPage, setPendingPage] = useState(() => getPageFromUrl('pendingPage'));
    const [approvedPage, setApprovedPage] = useState(() => getPageFromUrl('approvedPage'));
    const [rejectedPage, setRejectedPage] = useState(() => getPageFromUrl('rejectedPage'));

    // Sync URL with state
    const updateUrl = (param: string, page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set(param, page.toString());
        window.history.pushState({}, '', url.toString());
    };

    const handlePendingPageChange = (page: number) => {
        setPendingPage(page);
        updateUrl('pendingPage', page);
    };

    const handleApprovedPageChange = (page: number) => {
        setApprovedPage(page);
        updateUrl('approvedPage', page);
    };

    const handleRejectedPageChange = (page: number) => {
        setRejectedPage(page);
        updateUrl('rejectedPage', page);
    };

    // Queries
    const pendingQuery = useQuery<{ articles: ResidentReporter[], total: number }>({
        queryKey: ["/api/admin/resident-reporter", "pending", pendingPage],
        queryFn: async () => {
            const res = await fetch(`/api/admin/resident-reporter?status=pending&page=${pendingPage}&limit=${ITEMS_PER_PAGE}`);
            if (!res.ok) throw new Error("Failed to fetch pending");
            return res.json();
        }
    });

    const approvedQuery = useQuery<{ articles: ResidentReporter[], total: number }>({
        queryKey: ["/api/admin/resident-reporter", "approved", approvedPage],
        queryFn: async () => {
            const res = await fetch(`/api/admin/resident-reporter?status=approved&page=${approvedPage}&limit=${ITEMS_PER_PAGE}`);
            if (!res.ok) throw new Error("Failed to fetch approved");
            return res.json();
        }
    });

    const rejectedQuery = useQuery<{ articles: ResidentReporter[], total: number }>({
        queryKey: ["/api/admin/resident-reporter", "rejected", rejectedPage],
        queryFn: async () => {
            const res = await fetch(`/api/admin/resident-reporter?status=rejected&page=${rejectedPage}&limit=${ITEMS_PER_PAGE}`);
            if (!res.ok) throw new Error("Failed to fetch rejected");
            return res.json();
        }
    });

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/resident-reporter"] });
        // Also invalidate public/user queries if needed
        queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] });
        queryClient.invalidateQueries({ queryKey: ["/api/my/reporter-articles"] });
    };

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/resident-reporter/${id}/status`, { status });
            return res.json();
        },
        onSuccess: () => {
            invalidateAll();
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
            invalidateAll();
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
            invalidateAll();
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

    // Helper to calculate total pages
    const getTotalPages = (total: number) => Math.ceil(total / ITEMS_PER_PAGE);

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
                    <CardTitle>대기 중인 기사 ({pendingQuery.data?.total || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingQuery.isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <ArticleTable
                            articles={pendingQuery.data?.articles || []}
                            currentPage={pendingPage}
                            totalPages={getTotalPages(pendingQuery.data?.total || 0)}
                            onPageChange={handlePendingPageChange}
                            onApprove={(id) => handleStatusChange(id, "approved")}
                            onReject={(id) => handleStatusChange(id, "rejected")}
                            onEdit={setEditingArticle}
                            onDelete={setDeletingArticleId}
                            onView={setViewingArticle}
                            showActions
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>승인된 기사 ({approvedQuery.data?.total || 0})</CardTitle>
                    <CardDescription>승인된 기사는 커뮤니티 페이지에 노출됩니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    {approvedQuery.isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <ArticleTable
                            articles={approvedQuery.data?.articles || []}
                            currentPage={approvedPage}
                            totalPages={getTotalPages(approvedQuery.data?.total || 0)}
                            onPageChange={handleApprovedPageChange}
                            onEdit={setEditingArticle}
                            onDelete={setDeletingArticleId}
                            onView={setViewingArticle}
                            showManageActions
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>반려된 기사 ({rejectedQuery.data?.total || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {rejectedQuery.isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <ArticleTable
                            articles={rejectedQuery.data?.articles || []}
                            currentPage={rejectedPage}
                            totalPages={getTotalPages(rejectedQuery.data?.total || 0)}
                            onPageChange={handleRejectedPageChange}
                            onEdit={setEditingArticle}
                            onDelete={setDeletingArticleId}
                            onView={setViewingArticle}
                            onApprove={(id) => handleStatusChange(id, "approved")}
                            showReapprove
                        />
                    )}
                </CardContent>
            </Card>

            {/* View Article Modal */}
            <ViewArticleDialog
                article={viewingArticle}
                onClose={() => setViewingArticle(null)}
            />

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
    currentPage,
    totalPages,
    onPageChange,
    onApprove,
    onReject,
    onEdit,
    onDelete,
    onView,
    showActions,
    showManageActions,
    showReapprove,
}: {
    articles: ResidentReporter[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onEdit?: (article: ResidentReporter) => void;
    onDelete?: (id: string) => void;
    onView?: (article: ResidentReporter) => void;
    showActions?: boolean;
    showManageActions?: boolean;
    showReapprove?: boolean;
}) {

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
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                    {pages.map((page, idx) =>
                        page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${idx}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink onClick={() => onPageChange(page as number)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                            </PaginationItem>
                        )
                    )}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    if (articles.length === 0) {
        return <p className="text-muted-foreground text-sm py-4">데이터가 없습니다.</p>;
    }

    return (
        <div>
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
            {renderPagination()}
        </div>
    );
}

function ViewArticleDialog({ article, onClose }: { article: ResidentReporter | null; onClose: () => void }) {
    // Fetch full viewing article
    const { data: fullViewingArticle } = useQuery<ResidentReporter>({
        queryKey: ["/api/resident-reporter", article?.id],
        queryFn: async () => {
            if (!article?.id) return null;
            const res = await fetch(`/api/resident-reporter/${article.id}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        enabled: !!article?.id,
    });

    // Use the fetched full article if available, otherwise fallback to the list item (which might miss content)
    // But typically list item is passed for immediate display of title etc.
    const displayArticle = fullViewingArticle || article;

    return (
        <Dialog open={!!article} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{displayArticle?.title}</DialogTitle>
                    <DialogDescription>
                        {displayArticle?.authorName} 기자
                    </DialogDescription>
                </DialogHeader>
                {fullViewingArticle ? (
                    <div className="space-y-4">
                        {fullViewingArticle.imageUrl && (
                            <img src={fullViewingArticle.imageUrl} alt={fullViewingArticle.title} className="w-full rounded-lg" />
                        )}
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: fullViewingArticle.content }} />
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                작성일: {new Date(fullViewingArticle.createdAt || "").toLocaleDateString("ko-KR")}
                            </div>
                            {fullViewingArticle.approvedAt && (
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    승인일: {new Date(fullViewingArticle.approvedAt).toLocaleDateString("ko-KR")}
                                </div>
                            )}
                            {fullViewingArticle.updatedAt && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    수정일: {new Date(fullViewingArticle.updatedAt).toLocaleDateString("ko-KR")}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                )}
            </DialogContent>
        </Dialog>
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

    // Fetch full article for editing
    const { data: fullData } = useQuery({
        queryKey: ["/api/resident-reporter", article?.id, "edit"],
        queryFn: async () => {
            if (!article?.id) return null;
            const res = await fetch(`/api/resident-reporter/${article.id}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        enabled: !!article?.id,
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (fullData) {
            setTitle(fullData.title);
            setContent(fullData.content || "");
            setAuthorName(fullData.authorName);
            setImageUrl(fullData.imageUrl || "");
        }
    }, [fullData]);

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
