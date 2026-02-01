import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { FileUpload } from "@/components/ui/file-upload";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Home, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { ProjectUnit } from "@shared/schema";

interface UnitManagerProps {
    projectId: string;
    projectTitle: string;
}

const STATUS_LABELS: Record<string, string> = {
    available: "입주 가능",
    occupied: "입주 완료",
    reserved: "계약 중",
    maintenance: "정비 중",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    available: "default", // Green-ish usually, but default is primary
    occupied: "secondary",
    reserved: "outline",
    maintenance: "destructive",
};

export function UnitManager({ projectId, projectTitle }: UnitManagerProps) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<ProjectUnit | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [floorPlanUrl, setFloorPlanUrl] = useState("");

    const { data: units = [] } = useQuery<ProjectUnit[]>({
        queryKey: [`/api/projects/${projectId}/units`],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/units", { ...data, projectId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/units`] });
            toast({ title: "호실 정보가 생성되었습니다." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PATCH", `/api/admin/units/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/units`] });
            toast({ title: "호실 정보가 수정되었습니다." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/units/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/units`] });
            toast({ title: "호실 정보가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const resetForm = () => {
        setEditingUnit(null);
        setPhotos([]);
        setFloorPlanUrl("");
    };

    const openDialog = (unit: ProjectUnit | null) => {
        setEditingUnit(unit);
        if (unit) {
            setPhotos((unit.photos as unknown as string[]) || []);
            setFloorPlanUrl(unit.floorPlanUrl || "");
        } else {
            setPhotos([]);
            setFloorPlanUrl("");
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const parseAmount = (value: string) => {
            if (!value) return undefined;
            return parseInt(value.replace(/,/g, ""), 10);
        };

        const deposit = parseAmount(formData.get("deposit") as string);
        const monthlyRent = parseAmount(formData.get("monthlyRent") as string);
        const maintenanceFee = parseAmount(formData.get("maintenanceFee") as string);

        const data = {
            unitNumber: formData.get("unitNumber") as string,
            type: formData.get("type") as string,
            description: formData.get("description") as string,
            area: formData.get("area") as string,
            deposit: deposit,
            monthlyRent: monthlyRent,
            maintenanceFee: maintenanceFee,
            status: formData.get("status") as string,
            photos: photos,
            floorPlanUrl: floorPlanUrl || null,
        };

        if (editingUnit) {
            updateMutation.mutate({ id: editingUnit.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const formatNumber = (num?: number) => {
        return num ? num.toLocaleString() : "";
    };

    return (
        <>
            <Accordion type="single" collapsible className="w-full mt-3">
                <AccordionItem value="units" className="border-0">
                    <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span>공실 관리 ({units.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialog(null)}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                호실 추가
                            </Button>

                            {units.length > 0 && (
                                <div className="space-y-2">
                                    {units.map((unit) => (
                                        <Card key={unit.id} className="bg-muted/50">
                                            <CardContent className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-medium text-sm">{unit.unitNumber}</p>
                                                            <Badge variant={STATUS_VARIANTS[unit.status || "available"] as any} className="text-[10px] px-1 py-0 h-5">
                                                                {STATUS_LABELS[unit.status || "available"]}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {unit.type} | {unit.area} | {unit.deposit?.toLocaleString()} / {unit.monthlyRent?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openDialog(unit)}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => deleteMutation.mutate(unit.id)}
                                                        >
                                                            <Trash2 className="w-3 h-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUnit ? "호실 수정" : "호실 추가"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unitNumber">호실 번호 *</Label>
                                <Input
                                    id="unitNumber"
                                    name="unitNumber"
                                    placeholder="예: 101호"
                                    defaultValue={editingUnit?.unitNumber || ""}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">상태</Label>
                                <Select name="status" defaultValue={editingUnit?.status || "available"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="상태 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">입주 가능</SelectItem>
                                        <SelectItem value="occupied">입주 완료</SelectItem>
                                        <SelectItem value="reserved">계약 중</SelectItem>
                                        <SelectItem value="maintenance">정비 중</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">타입</Label>
                                <Input
                                    id="type"
                                    name="type"
                                    placeholder="예: A Type"
                                    defaultValue={editingUnit?.type || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">전용면적</Label>
                                <Input
                                    id="area"
                                    name="area"
                                    placeholder="예: 15m²"
                                    defaultValue={editingUnit?.area || ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="deposit">보증금 (원)</Label>
                                <Input
                                    id="deposit"
                                    name="deposit"
                                    placeholder="0"
                                    defaultValue={formatNumber(editingUnit?.deposit || undefined)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="monthlyRent">월세 (원)</Label>
                                <Input
                                    id="monthlyRent"
                                    name="monthlyRent"
                                    placeholder="0"
                                    defaultValue={formatNumber(editingUnit?.monthlyRent || undefined)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maintenanceFee">관리비 (원)</Label>
                                <Input
                                    id="maintenanceFee"
                                    name="maintenanceFee"
                                    placeholder="0"
                                    defaultValue={formatNumber(editingUnit?.maintenanceFee || undefined)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">상세 설명</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="특이사항 (예: 남향, 풀옵션)"
                                defaultValue={editingUnit?.description || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>내부 사진</Label>
                            <MultiImageUpload
                                value={photos}
                                onChange={setPhotos}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>평면도</Label>
                            <FileUpload
                                value={floorPlanUrl}
                                onChange={setFloorPlanUrl}
                                accept="image/*,.pdf"
                                label="평면도 업로드"
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    취소
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {editingUnit ? "수정" : "추가"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
