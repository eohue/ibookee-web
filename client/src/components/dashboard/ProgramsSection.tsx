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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { ResidentProgram } from "@shared/schema";

export function ProgramsSection() {
    const { toast } = useToast();
    const [editingProgram, setEditingProgram] = useState<ResidentProgram | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("small-group");
    const [selectedStatus, setSelectedStatus] = useState("open");
    const [imageUrl, setImageUrl] = useState("");

    const { data: programs, isLoading } = useQuery<ResidentProgram[]>({
        queryKey: ["/api/admin/programs"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/programs", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "프로그램이 생성되었습니다." });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PUT", `/api/admin/programs/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
            toast({ title: "프로그램이 수정되었습니다." });
            setEditingProgram(null);
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/programs/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "프로그램이 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const openDialog = (program: ResidentProgram | null) => {
        setEditingProgram(program);
        setSelectedType(program?.programType || "small-group");
        setSelectedStatus(program?.status || "open");
        setImageUrl(program?.imageUrl || "");
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const startDateStr = (formData.get("startDate") as string)?.trim();
        const endDateStr = (formData.get("endDate") as string)?.trim();
        const maxParticipantsStr = (formData.get("maxParticipants") as string)?.trim();
        const contentStr = (formData.get("content") as string)?.trim();
        const imageUrlStr = (formData.get("imageUrl") as string)?.trim();

        const maxParticipants = maxParticipantsStr ? parseInt(maxParticipantsStr, 10) : null;

        const data: Record<string, any> = {
            programType: selectedType,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            status: selectedStatus,
        };

        if (contentStr) data.content = contentStr;
        if (imageUrlStr) data.imageUrl = imageUrlStr;
        if (startDateStr) data.startDate = new Date(startDateStr).toISOString();
        if (endDateStr) data.endDate = new Date(endDateStr).toISOString();
        if (maxParticipants !== null && !isNaN(maxParticipants)) {
            data.maxParticipants = maxParticipants;
        }

        if (editingProgram) {
            updateMutation.mutate({ id: editingProgram.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const typeLabels: Record<string, string> = {
        "small-group": "소모임 지원",
        "space-sharing": "공간 공유 공모전",
    };

    const statusLabels: Record<string, string> = {
        open: "모집중",
        closed: "마감",
        completed: "종료",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">입주민 프로그램 관리</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog(null)} data-testid="button-add-program">
                            <Plus className="w-4 h-4 mr-2" />
                            새 프로그램
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProgram ? "프로그램 수정" : "새 프로그램"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="programType">프로그램 유형</Label>
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger data-testid="select-program-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small-group">소모임 지원</SelectItem>
                                            <SelectItem value="space-sharing">공간 공유 공모전</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">상태</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger data-testid="select-program-status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">모집중</SelectItem>
                                            <SelectItem value="closed">마감</SelectItem>
                                            <SelectItem value="completed">종료</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">프로그램명</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={editingProgram?.title}
                                    required
                                    data-testid="input-program-title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">간단 설명</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue={editingProgram?.description}
                                    required
                                    data-testid="input-program-description"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">상세 내용</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    defaultValue={editingProgram?.content || ""}
                                    className="min-h-[150px]"
                                    data-testid="input-program-content"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">시작일</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        defaultValue={editingProgram?.startDate ? new Date(editingProgram.startDate).toISOString().slice(0, 10) : ""}
                                        data-testid="input-program-start-date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">종료일</Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        defaultValue={editingProgram?.endDate ? new Date(editingProgram.endDate).toISOString().slice(0, 10) : ""}
                                        data-testid="input-program-end-date"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxParticipants">최대 참가자 수</Label>
                                    <Input
                                        id="maxParticipants"
                                        name="maxParticipants"
                                        type="number"
                                        defaultValue={editingProgram?.maxParticipants || ""}
                                        data-testid="input-program-max-participants"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>이미지 URL</Label>
                                    <Input
                                        type="hidden"
                                        name="imageUrl"
                                        value={imageUrl}
                                        readOnly
                                        data-testid="input-program-image-hidden"
                                    />
                                    <ImageUpload
                                        value={imageUrl}
                                        onChange={setImageUrl}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-program">
                                    {editingProgram ? "수정" : "생성"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !programs || programs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 프로그램이 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {programs.map((program) => (
                        <Card key={program.id} data-testid={`card-program-${program.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {program.imageUrl && (
                                        <img
                                            src={program.imageUrl}
                                            alt={program.title}
                                            className="w-24 h-16 object-cover rounded-md"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-medium">{program.title}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {typeLabels[program.programType] || program.programType}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {statusLabels[program.status || "open"] || program.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {program.description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDialog(program)}
                                            data-testid={`button-edit-program-${program.id}`}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMutation.mutate(program.id)}
                                            data-testid={`button-delete-program-${program.id}`}
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
