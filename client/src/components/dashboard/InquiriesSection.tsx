
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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar, Mail, Phone, Trash2, MessageSquare } from "lucide-react";
import type { Inquiry } from "@shared/schema";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        // Pagination logic (simplified for brevity but functional)
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
                <h2 className="text-xl font-semibold">문의 관리 <span className="text-sm font-normal text-muted-foreground ml-2">Total {data?.total || 0}</span></h2>
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
                            <TableHead className="w-[100px]">유형</TableHead>
                            <TableHead className="w-[180px]">보낸 사람</TableHead>
                            <TableHead className="w-[200px]">연락처</TableHead>
                            <TableHead>내용</TableHead>
                            <TableHead className="w-[120px]">날짜</TableHead>
                            <TableHead className="w-[80px] text-right">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    로딩 중...
                                </TableCell>
                            </TableRow>
                        ) : inquiries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    접수된 문의가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inquiries.map((inquiry) => (
                                <TableRow key={inquiry.id}>
                                    <TableCell>
                                        <Badge variant={getTypeVariant(inquiry.type)} className="whitespace-nowrap">
                                            {getTypeLabel(inquiry.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{inquiry.name}</div>
                                        {inquiry.company && (
                                            <div className="text-xs text-muted-foreground truncate" title={inquiry.company}>
                                                {inquiry.company}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-0.5">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-muted-foreground" />
                                                <span className="truncate" title={inquiry.email}>{inquiry.email}</span>
                                            </div>
                                            {inquiry.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                                    <span>{inquiry.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="max-w-[300px] truncate cursor-help text-sm">
                                                        {inquiry.message}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[400px] p-4 text-sm whitespace-pre-wrap">
                                                    {inquiry.message}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
