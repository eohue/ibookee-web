import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { HistoryMilestone } from "@shared/schema";

export function HistorySection() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<HistoryMilestone | null>(null);

    const { data: milestones, isLoading } = useQuery<HistoryMilestone[]>({
        queryKey: ["/api/admin/history"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/admin/history", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
            toast({ title: "연혁이 추가되었습니다" });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "연혁 추가 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return apiRequest("PUT", `/api/admin/history/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
            toast({ title: "연혁이 수정되었습니다" });
            setEditingMilestone(null);
        },
        onError: () => {
            toast({ title: "연혁 수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest("DELETE", `/api/admin/history/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
            toast({ title: "연혁이 삭제되었습니다" });
        },
        onError: () => {
            toast({ title: "연혁 삭제 실패", variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            year: parseInt(formData.get("year") as string),
            month: formData.get("month") as string || null,
            title: formData.get("title") as string,
            description: formData.get("description") as string || null,
            link: formData.get("link") as string || null,
            isHighlight: formData.get("isHighlight") === "on",
            displayOrder: parseInt(formData.get("displayOrder") as string) || 0,
        };

        if (editingMilestone) {
            updateMutation.mutate({ id: editingMilestone.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">연혁 관리</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-add-history">
                            <Plus className="w-4 h-4 mr-2" />
                            연혁 추가
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>새 연혁 추가</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">연도</Label>
                                    <Input id="year" name="year" type="number" required data-testid="input-history-year" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="month">월 (예: 04)</Label>
                                    <Input id="month" name="month" placeholder="MM" data-testid="input-history-month" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">제목</Label>
                                <Input id="title" name="title" required data-testid="input-history-title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">설명</Label>
                                <Textarea id="description" name="description" data-testid="input-history-description" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">관련 프로젝트 링크</Label>
                                <Input id="link" name="link" placeholder="https://" data-testid="input-history-link" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="isHighlight" name="isHighlight" data-testid="checkbox-history-highlight" />
                                <Label htmlFor="isHighlight">주요 이벤트로 표시</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayOrder">표시 순서</Label>
                                <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" data-testid="input-history-order" />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">취소</Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-history">
                                    추가
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !milestones || milestones.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 연혁이 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {milestones.map((milestone) => (
                        <Card key={milestone.id} data-testid={`card-history-${milestone.id}`}>
                            <CardHeader className="flex flex-row items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <Badge variant={milestone.isHighlight ? "default" : "outline"}>{milestone.year}</Badge>
                                    <CardTitle className="text-base">{milestone.title}</CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={editingMilestone?.id === milestone.id} onOpenChange={(open) => !open && setEditingMilestone(null)}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="ghost" onClick={() => setEditingMilestone(milestone)} data-testid={`button-edit-history-${milestone.id}`}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>연혁 수정</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="year">연도</Label>
                                                        <Input id="year" name="year" type="number" defaultValue={milestone.year} required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="month">월 (예: 04)</Label>
                                                        <Input id="month" name="month" placeholder="MM" defaultValue={milestone.month || ""} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">제목</Label>
                                                    <Input id="title" name="title" defaultValue={milestone.title} required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="link">관련 프로젝트 링크</Label>
                                                    <Input id="link" name="link" placeholder="https://" defaultValue={milestone.link || ""} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">설명</Label>
                                                    <Textarea id="description" name="description" defaultValue={milestone.description || ""} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox id="isHighlight" name="isHighlight" defaultChecked={milestone.isHighlight || false} />
                                                    <Label htmlFor="isHighlight">주요 이벤트로 표시</Label>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="displayOrder">표시 순서</Label>
                                                    <Input id="displayOrder" name="displayOrder" type="number" defaultValue={milestone.displayOrder ?? 0} />
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
                                        onClick={() => deleteMutation.mutate(milestone.id)}
                                        data-testid={`button-delete-history-${milestone.id}`}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardHeader>
                            {milestone.description && (
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
