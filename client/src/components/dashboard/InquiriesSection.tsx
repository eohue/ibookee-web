
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, Mail, Phone, Trash2, MessageSquare, Download, Lock } from "lucide-react";
import * as XLSX from "xlsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { Inquiry } from "@shared/schema";

const ITEMS_PER_PAGE = 20;

function getParamsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('inquiriesPage') || '1', 10);
    const type = params.get('inquiriesType') || 'all';
    return {
        page: page > 0 ? page : 1,
        type
    };
}

export function InquiriesSection() {
    const { toast } = useToast();
    const [page, setPage] = useState(getParamsFromUrl().page);
    const [type, setType] = useState(getParamsFromUrl().type);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // For answer dialog
    const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");

    // Sync URL with state
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('inquiriesPage', page.toString());
        url.searchParams.set('inquiriesType', type);
        window.history.pushState({}, '', url.toString());
    }, [page, type]);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            const { page, type } = getParamsFromUrl();
            setPage(page);
            setType(type);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const { data, isLoading } = useQuery<{ inquiries: Inquiry[], total: number }>({
        queryKey: ["/api/admin/inquiries", { page, limit: ITEMS_PER_PAGE, type }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                type: type === "all" ? "" : type
            });
            const res = await apiRequest("GET", `/api/admin/inquiries?${params}`);
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "문의가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Inquiry> }) => {
            const res = await apiRequest("PATCH", `/api/admin/inquiries/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
            toast({ title: "답변이 저장되었습니다." });
        },
        onError: () => {
            toast({ title: "저장 실패", variant: "destructive" });
        },
    });

    const handleTabChange = (value: string) => {
        setType(value);
        setPage(1);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "move-in": return "입주 문의";
            case "business": return "사업 제휴";
            case "recruit": return "채용 문의";
            default: return type;
        }
    };

    const getTypeVariant = (type: string): "default" | "secondary" | "outline" | "destructive" => {
        switch (type) {
            case "move-in": return "default";
            case "business": return "secondary";
            case "recruit": return "outline";
            default: return "secondary";
        }
    };

    const inquiries = data?.inquiries || [];
    const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(inquiries.map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleExport = () => {
        if (selectedIds.length === 0) {
            toast({ title: "내보낼 항목을 선택해주세요.", variant: "destructive" });
            return;
        }

        const selectedInquiries = inquiries.filter(i => selectedIds.includes(i.id));

        const exportData = selectedInquiries.map(i => ({
            "유형": getTypeLabel(i.type),
            "제목": i.title || "-",
            "상태": i.status === 'answered' ? '답변완료' : '대기중',
            "비밀글": i.isSecret ? 'Y' : 'N',
            "희망 주택": i.preferredProject || "-",
            "이름": i.name,
            "회사": i.company || "-",
            "이메일": i.email,
            "전화번호": i.phone || "-",
            "비밀번호": i.password || "-",
            "내용": i.message,
            "답변내용": i.answer || "-",
            "작성일": i.createdAt ? new Date(i.createdAt).toLocaleDateString("ko-KR") : "-",
            "답변일": i.answeredAt ? new Date(i.answeredAt).toLocaleDateString("ko-KR") : "-"
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inquiries");
        XLSX.writeFile(wb, `문의내역_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleSaveAnswer = (inquiryId: string) => {
        updateMutation.mutate({ id: inquiryId, data: { answer: answerText } });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages: (number | 'ellipsis')[] = [];
        const showEllipsisStart = page > 3;
        const showEllipsisEnd = page < totalPages - 2;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (showEllipsisStart) pages.push('ellipsis');
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (showEllipsisEnd) pages.push('ellipsis');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        return (
            <Pagination className="mt-4 justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => page > 1 && setPage(page - 1)}
                            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                    {pages.map((p, idx) => (
                        <PaginationItem key={idx}>
                            {p === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={page === p}
                                    onClick={() => setPage(p)}
                                    className="cursor-pointer"
                                >
                                    {p}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => page < totalPages && setPage(page + 1)}
                            className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">문의 관리 <span className="text-sm font-normal text-muted-foreground ml-2">Total {data?.total || 0}</span></h2>
                    {selectedIds.length > 0 && (
                        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                            <Download className="w-4 h-4" />
                            엑셀 다운로드 ({selectedIds.length})
                        </Button>
                    )}
                </div>
                <Tabs value={type} onValueChange={handleTabChange} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="move-in">입주</TabsTrigger>
                        <TabsTrigger value="business">제휴</TabsTrigger>
                        <TabsTrigger value="recruit">채용</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={inquiries.length > 0 && selectedIds.length === inquiries.length}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="w-[80px]">상태</TableHead>
                            <TableHead className="w-[100px]">유형</TableHead>
                            <TableHead className="w-[120px]">희망 주택</TableHead>
                            <TableHead className="w-[200px]">보낸 사람</TableHead>
                            <TableHead>내용/제목</TableHead>
                            <TableHead className="w-[120px]">날짜</TableHead>
                            <TableHead className="w-[80px] text-right">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    로딩 중...
                                </TableCell>
                            </TableRow>
                        ) : inquiries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    접수된 문의가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inquiries.map((inquiry) => (
                                <TableRow key={inquiry.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(inquiry.id)}
                                            onCheckedChange={(checked) => handleSelect(inquiry.id, checked as boolean)}
                                            aria-label={`Select inquiry from ${inquiry.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={inquiry.status === "answered" ? "default" : "secondary"}>
                                            {inquiry.status === "answered" ? "답변완료" : "대기중"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            {getTypeLabel(inquiry.type)}
                                            {inquiry.isSecret && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{inquiry.preferredProject || "-"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium truncate" title={inquiry.name}>{inquiry.name}</div>
                                        <div className="text-xs text-muted-foreground truncate" title={`${inquiry.email}${inquiry.phone ? ` / ${inquiry.phone}` : ''}`}>
                                            {inquiry.email} {inquiry.phone && `/ ${inquiry.phone}`}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Dialog onOpenChange={(open) => {
                                            if (open) {
                                                setSelectedInquiryId(inquiry.id);
                                                setAnswerText(inquiry.answer || "");
                                            } else {
                                                setSelectedInquiryId(null);
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <div className="max-w-[300px] cursor-pointer text-sm hover:underline group">
                                                    <div className="font-medium truncate group-hover:text-primary transition-colors">
                                                        {inquiry.title || "(제목 없음)"}
                                                    </div>
                                                    <div className="truncate text-muted-foreground text-xs mt-0.5">
                                                        {inquiry.message}
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant={inquiry.status === "answered" ? "default" : "secondary"}>
                                                            {inquiry.status === "answered" ? "답변완료" : "대기중"}
                                                        </Badge>
                                                        {inquiry.isSecret && (
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <Lock className="w-3 h-3" /> 비밀글
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <DialogTitle className="text-xl mb-1">{inquiry.title || "(제목 없음)"}</DialogTitle>
                                                    <DialogDescription className="text-sm border-b pb-4 mt-2">
                                                        <div className="grid grid-cols-2 gap-y-2 mt-2">
                                                            <div><span className="font-medium text-foreground">보낸 사람:</span> {inquiry.name}</div>
                                                            <div><span className="font-medium text-foreground">연락처:</span> {inquiry.phone || "-"}</div>
                                                            <div><span className="font-medium text-foreground">이메일:</span> {inquiry.email}</div>
                                                            {inquiry.type === "business" && <div><span className="font-medium text-foreground">회사/기관:</span> {inquiry.company || "-"}</div>}
                                                            {inquiry.preferredProject && (
                                                                <div className="col-span-2 text-primary">
                                                                    <span className="font-medium">희망 입주 주택:</span> {inquiry.preferredProject}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="my-2 space-y-4">
                                                    <div>
                                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">문의 내용</h4>
                                                        <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border">
                                                            {inquiry.message}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium mb-2 text-sm text-foreground flex items-center justify-between">
                                                            <span>답변 작성</span>
                                                            <span className="text-xs font-normal text-muted-foreground">
                                                                답변을 저장하면 게시판에서 내용을 볼 수 있습니다.
                                                            </span>
                                                        </h4>
                                                        <Textarea
                                                            className="min-h-[150px] resize-y"
                                                            placeholder="답변 내용을 입력하세요..."
                                                            value={answerText}
                                                            onChange={(e) => setAnswerText(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end mt-4 pt-4 border-t gap-2">
                                                    <Button
                                                        onClick={() => handleSaveAnswer(inquiry.id)}
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        {updateMutation.isPending ? "저장 중..." : "답변 저장"}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString("ko-KR") : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm('정말 이 문의를 삭제하시겠습니까?')) {
                                                    deleteMutation.mutate(inquiry.id);
                                                }
                                            }}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {renderPagination()}
        </div>
    );
}
