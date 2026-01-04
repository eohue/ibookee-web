import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Project } from "@shared/schema";

export function ProjectsSection() {
    const { toast } = useToast();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("youth");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [partnerLogos, setPartnerLogos] = useState<string[]>([]);


    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ["/api/admin/projects"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/projects", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "프로젝트가 생성되었습니다." });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "생성 실패", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PUT", `/api/admin/projects/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
            toast({ title: "프로젝트가 수정되었습니다." });
            setEditingProject(null);
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "수정 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "프로젝트가 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const openDialog = (project: Project | null) => {
        setEditingProject(project);
        if (project) {
            setSelectedCategory(project.category);
            setImageUrl(project.imageUrl ?? "");
            setDescription(project.description);
            setPartnerLogos(project.partnerLogos ?? []);
        } else {
            setSelectedCategory("youth");
            setImageUrl("");
            setDescription("");
            setPartnerLogos([]);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            titleEn: formData.get("titleEn") as string,
            location: formData.get("location") as string,
            category: selectedCategory,
            description: description,
            imageUrl: formData.get("imageUrl") as string,
            year: parseInt(formData.get("year") as string),
            units: parseInt(formData.get("units") as string) || undefined,
            featured: false,
            partnerLogos: partnerLogos,
        };

        if (editingProject) {
            updateMutation.mutate({ id: editingProject.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const categoryLabels: Record<string, string> = {
        youth: "청년 주택",
        single: "1인 가구",
        "social-mix": "소셜 믹스",
        "local-anchor": "지역 앵커",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">프로젝트 관리</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog(null)} data-testid="button-add-project">
                            <Plus className="w-4 h-4 mr-2" />
                            새 프로젝트
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProject ? "프로젝트 수정" : "새 프로젝트"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">프로젝트명 (한글)</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={editingProject?.title}
                                        required
                                        data-testid="input-project-title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="titleEn">프로젝트명 (영문)</Label>
                                    <Input
                                        id="titleEn"
                                        name="titleEn"
                                        defaultValue={editingProject?.titleEn || ""}
                                        data-testid="input-project-title-en"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">위치</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        defaultValue={editingProject?.location}
                                        required
                                        data-testid="input-project-location"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">카테고리</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger data-testid="select-project-category">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="youth">청년 주택</SelectItem>
                                            <SelectItem value="single">1인 가구</SelectItem>
                                            <SelectItem value="social-mix">소셜 믹스</SelectItem>
                                            <SelectItem value="local-anchor">지역 앵커</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>설명</Label>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                    className="min-h-[200px] mb-12"
                                />
                                <input type="hidden" name="description" value={description} />
                            </div>
                            <div className="space-y-2">
                                <Label>대표 이미지</Label>
                                <Input
                                    type="hidden"
                                    name="imageUrl"
                                    value={imageUrl}
                                    readOnly
                                    data-testid="input-project-image-hidden"
                                />
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>협력사 로고 (설계, 시공 등)</Label>
                                <MultiImageUpload
                                    value={partnerLogos}
                                    onChange={setPartnerLogos}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">준공 연도</Label>
                                    <Input
                                        id="year"
                                        name="year"
                                        type="number"
                                        defaultValue={editingProject?.year || new Date().getFullYear()}
                                        required
                                        data-testid="input-project-year"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="units">세대 수</Label>
                                    <Input
                                        id="units"
                                        name="units"
                                        type="number"
                                        defaultValue={editingProject?.units || ""}
                                        data-testid="input-project-units"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-project">
                                    {editingProject ? "수정" : "생성"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !projects || projects.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 프로젝트가 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => (
                        <Card key={project.id} data-testid={`card-project-${project.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {project.imageUrl && (
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            className="w-24 h-16 object-cover rounded-md"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-medium">{project.title}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {categoryLabels[project.category] || project.category}
                                            </Badge>
                                            {project.featured && <Badge>추천</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {project.location} | {project.year}년 | {project.units}세대
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDialog(project)}
                                            data-testid={`button-edit-project-${project.id}`}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMutation.mutate(project.id)}
                                            data-testid={`button-delete-project-${project.id}`}
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
