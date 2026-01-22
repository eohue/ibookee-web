import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
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
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import type { Subproject } from "@shared/schema";

interface SubprojectManagerProps {
    projectId: string;
    projectTitle: string;
}

export function SubprojectManager({ projectId, projectTitle }: SubprojectManagerProps) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubproject, setEditingSubproject] = useState<Subproject | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    const { data: subprojects = [] } = useQuery<Subproject[]>({
        queryKey: [`/api/admin/projects/${projectId}/subprojects`],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", `/api/admin/projects/${projectId}/subprojects`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/admin/projects/${projectId}/subprojects`] });
            toast({ title: "서브 프로젝트가 생성되었습니다." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PUT", `/api/admin/subprojects/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/admin/projects/${projectId}/subprojects`] });
            toast({ title: "서브 프로젝트가 수정되었습니다." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/subprojects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/admin/projects/${projectId}/subprojects`] });
            toast({ title: "서브 프로젝트가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const resetForm = () => {
        setEditingSubproject(null);
        setImageUrl("");
    };

    const openDialog = (subproject: Subproject | null) => {
        setEditingSubproject(subproject);
        if (subproject) {
            setImageUrl(subproject.imageUrl || "");
        } else {
            setImageUrl("");
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const completionYearInput = formData.get("completionYear") as string;
        const completionYear = completionYearInput ? parseInt(completionYearInput) : null;

        const unitsInput = formData.get("units") as string;
        const units = unitsInput ? parseInt(unitsInput) : null;

        const data = {
            name: formData.get("name") as string,
            location: formData.get("location") as string,
            completionYear: completionYear,
            completionMonth: (formData.get("completionMonth") as string) || null,
            units: units,
            siteArea: (formData.get("siteArea") as string) || null,
            grossFloorArea: (formData.get("grossFloorArea") as string) || null,
            scale: (formData.get("scale") as string) || null,
            imageUrl: imageUrl || null,
        };

        if (editingSubproject) {
            updateMutation.mutate({ id: editingSubproject.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <>
            <Accordion type="single" collapsible className="w-full mt-3">
                <AccordionItem value="subprojects" className="border-0">
                    <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>서브 프로젝트 ({subprojects.length})</span>
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
                                서브 프로젝트 추가
                            </Button>

                            {subprojects.length > 0 && (
                                <div className="space-y-2">
                                    {subprojects.map((sub) => (
                                        <Card key={sub.id} className="bg-muted/50">
                                            <CardContent className="p-3">
                                                <div className="flex items-center gap-3">
                                                    {sub.imageUrl && (
                                                        <img
                                                            src={sub.imageUrl}
                                                            alt={sub.name}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">{sub.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {sub.location}
                                                            {sub.completionYear && ` | ${sub.completionYear}년`}
                                                            {sub.units && ` | ${sub.units}세대`}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openDialog(sub)}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => deleteMutation.mutate(sub.id)}
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
                            {editingSubproject ? "서브 프로젝트 수정" : `서브 프로젝트 추가`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름 *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={`예: ${projectTitle} 2호`}
                                defaultValue={editingSubproject?.name || ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">위치 *</Label>
                            <Input
                                id="location"
                                name="location"
                                defaultValue={editingSubproject?.location || ""}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="completionYear">준공 연도</Label>
                                <Input
                                    id="completionYear"
                                    name="completionYear"
                                    type="number"
                                    defaultValue={editingSubproject?.completionYear || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="completionMonth">준공 월</Label>
                                <Select name="completionMonth" defaultValue={editingSubproject?.completionMonth || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="월 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">-</SelectItem>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                {i + 1}월
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="units">세대 수</Label>
                                <Input
                                    id="units"
                                    name="units"
                                    type="number"
                                    defaultValue={editingSubproject?.units || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteArea">대지면적</Label>
                                <Input
                                    id="siteArea"
                                    name="siteArea"
                                    placeholder="예: 320.5㎡"
                                    defaultValue={editingSubproject?.siteArea || ""}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="grossFloorArea">연면적</Label>
                                <Input
                                    id="grossFloorArea"
                                    name="grossFloorArea"
                                    placeholder="예: 1,250.8㎡"
                                    defaultValue={editingSubproject?.grossFloorArea || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="scale">규모(층수)</Label>
                                <Input
                                    id="scale"
                                    name="scale"
                                    placeholder="예: 지하1층/지상5층"
                                    defaultValue={editingSubproject?.scale || ""}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>대표 이미지</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={(url) => setImageUrl(url as string)}
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
                                {editingSubproject ? "수정" : "추가"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
