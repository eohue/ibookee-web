import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, Trash2 } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { Inquiry } from "@shared/schema";

const ITEMS_PER_PAGE = 20;

function getPageFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('inquiriesPage') || '1', 10);
    return page > 0 ? page : 1;
}

export function InquiriesSection() {
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(getPageFromUrl);

    const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
        queryKey: ["/api/admin/inquiries"],
    });

    useEffect(() => {
        const handlePopState = () => setCurrentPage(getPageFromUrl());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const totalPages = Math.ceil((inquiries?.length || 0) / ITEMS_PER_PAGE);
    const paginatedInquiries = inquiries?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('inquiriesPage', page.toString());
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

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "move-in": return "입주 문의";
            case "business": return "사업 제휴";
            case "recruit": return "채용 문의";
            default: return type;
        }
    };

    const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
        switch (type) {
            case "move-in": return "default";
            case "business": return "secondary";
            case "recruit": return "outline";
            default: return "secondary";
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">문의 관리</h2>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !inquiries || inquiries.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        접수된 문의가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {paginatedInquiries?.map((inquiry) => (
                        <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <Badge variant={getTypeVariant(inquiry.type)}>
                                                {getTypeLabel(inquiry.type)}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {inquiry.createdAt
                                                    ? new Date(inquiry.createdAt).toLocaleDateString("ko-KR")
                                                    : "날짜 없음"}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="font-medium text-foreground">
                                                {inquiry.name}
                                                {inquiry.company && (
                                                    <span className="text-muted-foreground font-normal">
                                                        {" "}({inquiry.company})
                                                    </span>
                                                )}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {inquiry.email}
                                                </span>
                                                {inquiry.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {inquiry.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {inquiry.message}
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteMutation.mutate(inquiry.id)}
                                        disabled={deleteMutation.isPending}
                                        data-testid={`button-delete-inquiry-${inquiry.id}`}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {renderPagination()}
                </div>
            )}
        </div>
    );
}
