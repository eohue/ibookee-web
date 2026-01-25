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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Event } from "@shared/schema";

const ITEMS_PER_PAGE = 20;

function getPageFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('eventsPage') || '1', 10);
    return page > 0 ? page : 1;
}

export function EventsSection() {
    const { toast } = useToast();
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("upcoming");
    const [imageUrl, setImageUrl] = useState("");
    const [currentPage, setCurrentPage] = useState(getPageFromUrl);

    const { data: events, isLoading } = useQuery<Event[]>({
        queryKey: ["/api/admin/events"],
    });

    useEffect(() => {
        const handlePopState = () => setCurrentPage(getPageFromUrl());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const totalPages = Math.ceil((events?.length || 0) / ITEMS_PER_PAGE);
    const paginatedEvents = events?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('eventsPage', page.toString());
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
            await apiRequest("POST", "/api/admin/events", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "행사가 생성되었습니다." });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PUT", `/api/admin/events/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
            toast({ title: "행사가 수정되었습니다." });
            setEditingEvent(null);
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/events/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "행사가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const openDialog = (event: Event | null) => {
        setEditingEvent(event);
        setSelectedStatus(event?.status || "upcoming");
        setImageUrl(event?.imageUrl || "");
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dateValue = formData.get("date") as string;
        if (!dateValue) {
            toast({ title: "일시를 선택해주세요", variant: "destructive" });
            return;
        }
        const imageUrl = (formData.get("imageUrl") as string)?.trim();
        const registrationUrl = (formData.get("registrationUrl") as string)?.trim();
        const data: Record<string, any> = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            date: new Date(dateValue).toISOString(),
            location: formData.get("location") as string,
            status: selectedStatus,
        };
        if (imageUrl) data.imageUrl = imageUrl;
        if (registrationUrl) data.registrationUrl = registrationUrl;

        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const statusLabels: Record<string, string> = {
        upcoming: "예정",
        ongoing: "진행중",
        completed: "종료",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">행사 관리</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog(null)} data-testid="button-add-event">
                            <Plus className="w-4 h-4 mr-2" />
                            새 행사
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingEvent ? "행사 수정" : "새 행사"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">행사명</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={editingEvent?.title}
                                    required
                                    data-testid="input-event-title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">일시</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="datetime-local"
                                        defaultValue={editingEvent?.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ""}
                                        required
                                        data-testid="input-event-date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">상태</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger data-testid="select-event-status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="upcoming">예정</SelectItem>
                                            <SelectItem value="ongoing">진행중</SelectItem>
                                            <SelectItem value="completed">종료</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">장소</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={editingEvent?.location}
                                    required
                                    data-testid="input-event-location"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">설명</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={editingEvent?.description}
                                    required
                                    data-testid="input-event-description"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>대표 이미지 (선택)</Label>
                                <Input
                                    type="hidden"
                                    name="imageUrl"
                                    value={imageUrl}
                                    readOnly
                                    data-testid="input-event-image-hidden"
                                />
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={(url) => setImageUrl(url as string)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registrationUrl">신청 링크</Label>
                                <Input
                                    id="registrationUrl"
                                    name="registrationUrl"
                                    defaultValue={editingEvent?.registrationUrl || ""}
                                    data-testid="input-event-registration"
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-event">
                                    {editingEvent ? "수정" : "생성"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !events || events.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 행사가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4">
                        {paginatedEvents?.map((event) => (
                            <Card key={event.id} data-testid={`card-event-${event.id}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {event.imageUrl && (
                                            <img
                                                src={event.imageUrl}
                                                alt={event.title}
                                                className="w-24 h-16 object-cover rounded-md"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-medium">{event.title}</h3>
                                                <Badge variant="secondary" className="text-xs">
                                                    {statusLabels[event.status || "upcoming"] || event.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {event.location} | {event.date ? new Date(event.date).toLocaleDateString("ko-KR") : ""}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDialog(event)}
                                                data-testid={`button-edit-event-${event.id}`}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(event.id)}
                                                data-testid={`button-delete-event-${event.id}`}
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
