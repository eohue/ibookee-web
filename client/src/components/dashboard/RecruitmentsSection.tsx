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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, FileText, Download } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { HousingRecruitment } from "@shared/schema";

const ITEMS_PER_PAGE = 20;

function getPageFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('recruitmentsPage') || '1', 10);
    return page > 0 ? page : 1;
}

export function RecruitmentsSection() {
    const { toast } = useToast();
    const [editingRecruitment, setEditingRecruitment] = useState<HousingRecruitment | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [fileUrl, setFileUrl] = useState("");
    const [published, setPublished] = useState(true);
    const [content, setContent] = useState("");
    const [currentPage, setCurrentPage] = useState(getPageFromUrl);

    const { data: recruitments, isLoading } = useQuery<HousingRecruitment[]>({
        queryKey: ["/api/admin/recruitments"],
    });

    useEffect(() => {
        const handlePopState = () => setCurrentPage(getPageFromUrl());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const totalPages = Math.ceil((recruitments?.length || 0) / ITEMS_PER_PAGE);
    const paginatedRecruitments = recruitments?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('recruitmentsPage', page.toString());
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
                            <PaginationItem key={`ellipsis-${idx}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
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
            await apiRequest("POST", "/api/admin/recruitments", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/recruitments"] });
            toast({ title: "공고가 등록되었습니다." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "등록 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PUT", `/api/admin/recruitments/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/recruitments"] });
            toast({ title: "공고가 수정되었습니다." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/recruitments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/recruitments"] });
            toast({ title: "공고가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const resetForm = () => {
        setEditingRecruitment(null);
        setFileUrl("");
        setPublished(true);
        setContent("");
    };

    const openDialog = (recruitment: HousingRecruitment | null) => {
        setEditingRecruitment(recruitment);
        setFileUrl(recruitment?.fileUrl || "");
        setPublished(recruitment?.published ?? true);
        setContent(recruitment?.content || "");
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = {
            title: formData.get("title") as string,
            content: content || null,
            fileUrl: fileUrl || null,
            published,
        };

        if (editingRecruitment) {
            updateMutation.mutate({ id: editingRecruitment.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">입주자 모집 공고</h2>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog(null)} data-testid="button-add-recruitment">
                            <Plus className="w-4 h-4 mr-2" />
                            새 공고
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRecruitment ? "공고 수정" : "새 공고"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">공고 제목 *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={editingRecruitment?.title}
                                    required
                                    placeholder="예: 2026년 1월 안암생활 입주자 모집"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>공고 내용</Label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="공고 상세 내용을 입력하세요"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>첨부 파일 (PDF 등)</Label>
                                <FileUpload
                                    value={fileUrl}
                                    onChange={(url) => setFileUrl(url as string || "")}
                                    accept=".pdf,.doc,.docx,.hwp"
                                />
                                {fileUrl && (
                                    <p className="text-sm text-muted-foreground mt-1 truncate">
                                        첨부됨: {fileUrl.split('/').pop()}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="published"
                                    checked={published}
                                    onCheckedChange={setPublished}
                                />
                                <Label htmlFor="published">공개 여부</Label>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingRecruitment ? "수정" : "등록"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !recruitments || recruitments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 공고가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4">
                        {paginatedRecruitments?.map((recruitment) => (
                            <Card key={recruitment.id} data-testid={`card-recruitment-${recruitment.id}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-medium">{recruitment.title}</h3>
                                                <Badge variant={recruitment.published ? "default" : "secondary"}>
                                                    {recruitment.published ? "공개" : "비공개"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {recruitment.createdAt ? new Date(recruitment.createdAt).toLocaleDateString("ko-KR") : ""}
                                                {recruitment.fileUrl && " · 첨부파일 있음"}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {recruitment.fileUrl && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <a href={recruitment.fileUrl} target="_blank" rel="noopener noreferrer" title="파일 다운로드">
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDialog(recruitment)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(recruitment.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}
