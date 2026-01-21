import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { FileUpload } from "@/components/ui/file-upload";

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
import { MultiSelect } from "@/components/ui/multi-select-custom";
import { PROJECT_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { SubprojectManager } from "./SubprojectManager";

export function ProjectsSection() {
    const { toast } = useToast();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["youth"]);
    const [imageUrl, setImageUrl] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
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
            const categories = Array.isArray(project.category)
                ? project.category
                : [project.category as unknown as string];
            setSelectedCategories(categories);
            setImageUrl(project.imageUrl ?? "");
            setPdfUrl(project.pdfUrl ?? "");
            setDescription(project.description);
            setPartnerLogos((project.partnerLogos as unknown as string[]) ?? []);
        } else {
            setSelectedCategories(["youth"]);
            setImageUrl("");
            setPdfUrl("");
            setDescription("");
            setPartnerLogos([]);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const yearInput = formData.get("year") as string;
        const year = parseInt(yearInput);

        const unitsInput = formData.get("units") as string;
        const units = unitsInput ? parseInt(unitsInput) : undefined;

        const data = {
            title: formData.get("title") as string,
            titleEn: (formData.get("titleEn") as string) || null,
            location: formData.get("location") as string,
            category: selectedCategories,
            description: description,
            imageUrl: formData.get("imageUrl") as string,
            pdfUrl: pdfUrl || null,
            year: isNaN(year) ? new Date().getFullYear() : year,
            completionMonth: (formData.get("completionMonth") as string) || null,
            units: typeof units === 'number' && !isNaN(units) ? units : undefined,
            siteArea: (formData.get("siteArea") as string) || null,
            grossFloorArea: (formData.get("grossFloorArea") as string) || null,
            scale: (formData.get("scale") as string) || null,
            featured: false,
            partnerLogos: partnerLogos,
        };

        if (editingProject) {
            updateMutation.mutate({ id: editingProject.id, data });
        } else {
            createMutation.mutate(data);
        }
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
                                    <Label className="mb-2 block">카테고리</Label>
                                    <div className="grid grid-cols-2 gap-4 border rounded-md p-4">
                                        {PROJECT_CATEGORIES.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={selectedCategories.includes(category.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedCategories([...selectedCategories, category.id]);
                                                        } else {
                                                            setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`category-${category.id}`}
                                                    className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {category.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="hidden" name="category" value={JSON.stringify(selectedCategories)} />
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
                                    onChange={(url) => setImageUrl(url as string)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>협력사 로고 (설계, 시공 등)</Label>
                                <MultiImageUpload
                                    value={partnerLogos}
                                    onChange={setPartnerLogos}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>프로젝트 소개서 (PDF)</Label>
                                <FileUpload
                                    value={pdfUrl}
                                    onChange={setPdfUrl}
                                    accept=".pdf"
                                    label="PDF 업로드"
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
                                    <Label htmlFor="completionMonth">준공 월</Label>
                                    <Select name="completionMonth" defaultValue={editingProject?.completionMonth || ""}>
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
                                        defaultValue={editingProject?.units || ""}
                                        data-testid="input-project-units"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteArea">대지면적</Label>
                                    <Input
                                        id="siteArea"
                                        name="siteArea"
                                        placeholder="예: 320.5㎡"
                                        defaultValue={editingProject?.siteArea || ""}
                                        data-testid="input-project-site-area"
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
                                        defaultValue={editingProject?.grossFloorArea || ""}
                                        data-testid="input-project-gross-floor-area"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scale">규모(층수)</Label>
                                    <Input
                                        id="scale"
                                        name="scale"
                                        placeholder="예: 지하1층/지상5층"
                                        defaultValue={editingProject?.scale || ""}
                                        data-testid="input-project-scale"
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
                                            {(Array.isArray(project.category) ? project.category : [project.category as unknown as string]).map((cat) => (
                                                <Badge key={cat} variant="secondary" className="text-xs">
                                                    {CATEGORY_LABELS[cat] || cat}
                                                </Badge>
                                            ))}
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
                                <SubprojectManager projectId={project.id} projectTitle={project.title} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
