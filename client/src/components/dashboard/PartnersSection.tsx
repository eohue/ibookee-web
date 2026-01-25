import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { Partner } from "@shared/schema";

const ITEMS_PER_PAGE = 20;

function getPageFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('partnersPage') || '1', 10);
    return page > 0 ? page : 1;
}

export function PartnersSection() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [logoUrl, setLogoUrl] = useState("");
    const [currentPage, setCurrentPage] = useState(getPageFromUrl);

    const { data: partners, isLoading } = useQuery<Partner[]>({
        queryKey: ["/api/admin/partners"],
    });

    useEffect(() => {
        const handlePopState = () => setCurrentPage(getPageFromUrl());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const totalPages = Math.ceil((partners?.length || 0) / ITEMS_PER_PAGE);
    const paginatedPartners = partners?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('partnersPage', page.toString());
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
            return apiRequest("POST", "/api/admin/partners", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
            toast({ title: "파트너가 추가되었습니다" });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "파트너 추가 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return apiRequest("PUT", `/api/admin/partners/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
            toast({ title: "파트너가 수정되었습니다" });
            setEditingPartner(null);
        },
        onError: () => {
            toast({ title: "파트너 수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest("DELETE", `/api/admin/partners/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
            toast({ title: "파트너가 삭제되었습니다" });
        },
        onError: () => {
            toast({ title: "파트너 삭제 실패", variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            logoUrl: formData.get("logoUrl") as string || null,
            category: formData.get("category") as string,
            displayOrder: parseInt(formData.get("displayOrder") as string) || 0,
        };

        if (editingPartner) {
            updateMutation.mutate({ id: editingPartner.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">파트너 목록</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-add-partner">
                            <Plus className="w-4 h-4 mr-2" />
                            파트너 추가
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>새 파트너 추가</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">파트너명</Label>
                                <Input id="name" name="name" required data-testid="input-partner-name" />
                            </div>
                            <div className="space-y-2">
                                <Label>로고 URL</Label>
                                <Input
                                    type="hidden"
                                    name="logoUrl"
                                    value={logoUrl}
                                    readOnly
                                    data-testid="input-partner-logo-hidden"
                                />
                                <ImageUpload
                                    value={logoUrl}
                                    onChange={(url) => setLogoUrl(url as string)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">카테고리</Label>
                                <Input id="category" name="category" placeholder="예: government, investment, construction" data-testid="input-partner-category" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayOrder">표시 순서</Label>
                                <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" data-testid="input-partner-order" />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">취소</Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-partner">
                                    추가
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !partners || partners.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 파트너가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedPartners?.map((partner) => (
                            <Card key={partner.id} data-testid={`card-partner-${partner.id}`}>
                                <CardHeader className="flex flex-row items-center justify-between gap-2">
                                    <CardTitle className="text-base">{partner.name}</CardTitle>
                                    <Badge variant="outline">{partner.category}</Badge>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {partner.logoUrl && (
                                        <img src={partner.logoUrl} alt={partner.name} className="h-12 object-contain" loading="lazy" decoding="async" />
                                    )}
                                    <p className="text-sm text-muted-foreground">순서: {partner.displayOrder}</p>
                                    <div className="flex gap-2 pt-2">
                                        <Dialog open={editingPartner?.id === partner.id} onOpenChange={(open) => !open && setEditingPartner(null)}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setEditingPartner(partner);
                                                    setLogoUrl(partner.logoUrl || "");
                                                }} data-testid={`button-edit-partner-${partner.id}`}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>파트너 수정</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">파트너명</Label>
                                                        <Input id="name" name="name" defaultValue={partner.name} required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>로고 URL</Label>
                                                        <Input
                                                            type="hidden"
                                                            name="logoUrl"
                                                            value={logoUrl}
                                                            readOnly
                                                        />
                                                        <ImageUpload
                                                            value={logoUrl}
                                                            onChange={(url) => setLogoUrl(url as string)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="category">카테고리</Label>
                                                        <Input id="category" name="category" defaultValue={partner.category} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="displayOrder">표시 순서</Label>
                                                        <Input id="displayOrder" name="displayOrder" type="number" defaultValue={partner.displayOrder ?? 0} />
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button type="button" variant="outline">취소</Button>
                                                        </DialogClose>
                                                        <Button type="submit" disabled={updateMutation.isPending}>저장</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteMutation.mutate(partner.id)}
                                            data-testid={`button-delete-partner-${partner.id}`}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {renderPagination()}
                </>
            )
            }
        </div >
    );
}
