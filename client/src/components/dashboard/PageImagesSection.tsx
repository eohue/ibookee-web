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
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { PageImage } from "@shared/schema";

const defaultPageImages = [
    { pageKey: "home", imageKey: "hero", label: "홈 - 히어로 배경", currentUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
    { pageKey: "about", imageKey: "office", label: "About - 오피스 이미지", currentUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { pageKey: "about", imageKey: "ceo", label: "About - CEO 프로필", currentUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { pageKey: "business", imageKey: "solution-youth", label: "Business - 청년주택 솔루션", currentUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { pageKey: "business", imageKey: "solution-single", label: "Business - 1인가구 솔루션", currentUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { pageKey: "business", imageKey: "solution-family", label: "Business - 가족형 솔루션", currentUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
];

export function PageImagesSection() {
    const { toast } = useToast();
    const [editingImage, setEditingImage] = useState<{ pageKey: string; imageKey: string; label: string } | null>(null);
    const [newUrl, setNewUrl] = useState("");
    const [heroImages, setHeroImages] = useState<string[]>([]);

    const { data: pageImages, isLoading } = useQuery<PageImage[]>({
        queryKey: ["/api/admin/page-images"],
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { pageKey: string; imageKey: string; imageUrl: string }) => {
            return apiRequest("PUT", "/api/admin/page-images", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/page-images"] });
            queryClient.invalidateQueries({ queryKey: ["/api/page-images"] });
            toast({ title: "이미지가 업데이트되었습니다" });
            setEditingImage(null);
            setNewUrl("");
        },
        onError: () => {
            toast({ title: "이미지 업데이트 실패", variant: "destructive" });
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: async (data: { pageKey: string; imageKey: string; images: { imageUrl: string; displayOrder: number }[] }) => {
            return apiRequest("PUT", "/api/admin/page-images-list", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/page-images"] });
            queryClient.invalidateQueries({ queryKey: ["/api/page-images"] });
            toast({ title: "이미지 목록이 업데이트되었습니다" });
            setEditingImage(null);
            setHeroImages([]);
        },
        onError: () => {
            toast({ title: "이미지 목록 업데이트 실패", variant: "destructive" });
        },
    });

    const getImageUrl = (pageKey: string, imageKey: string) => {
        const dbImage = pageImages?.find(img => img.pageKey === pageKey && img.imageKey === imageKey);
        if (dbImage) return dbImage.imageUrl;
        const defaultImage = defaultPageImages.find(img => img.pageKey === pageKey && img.imageKey === imageKey);
        return defaultImage?.currentUrl || "";
    };

    const getHeroImages = () => {
        const images = pageImages?.filter(img => img.pageKey === "home" && img.imageKey === "hero")
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        if (images && images.length > 0) return images.map(img => img.imageUrl);
        const defaultUrl = defaultPageImages.find(img => img.pageKey === "home" && img.imageKey === "hero")?.currentUrl;
        return defaultUrl ? [defaultUrl] : [];
    };

    const handleOpenEdit = (item: typeof defaultPageImages[0]) => {
        setEditingImage(item);
        if (item.pageKey === "home" && item.imageKey === "hero") {
            setHeroImages(getHeroImages());
        } else {
            setNewUrl(getImageUrl(item.pageKey, item.imageKey));
        }
    };

    const handleSave = () => {
        if (!editingImage) return;

        if (editingImage.pageKey === "home" && editingImage.imageKey === "hero") {
            const imagesPayload = heroImages.map((url, index) => ({
                imageUrl: url,
                displayOrder: index
            }));
            bulkUpdateMutation.mutate({
                pageKey: editingImage.pageKey,
                imageKey: editingImage.imageKey,
                images: imagesPayload
            });
        } else {
            if (!newUrl) return;
            updateMutation.mutate({
                pageKey: editingImage.pageKey,
                imageKey: editingImage.imageKey,
                imageUrl: newUrl,
            });
        }
    };

    const addHeroImage = () => {
        if (heroImages.length < 5) {
            setHeroImages([...heroImages, ""]);
        }
    };

    const removeHeroImage = (index: number) => {
        setHeroImages(heroImages.filter((_, i) => i !== index));
    };

    const updateHeroImage = (index: number, url: string) => {
        const newImages = [...heroImages];
        newImages[index] = url;
        setHeroImages(newImages);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">페이지 이미지 관리</h2>
            </div>
            <p className="text-muted-foreground">
                메인페이지, About, Business 페이지에 표시되는 이미지를 관리합니다. 메인 히어로 섹션은 최대 5장까지 등록 가능합니다.
            </p>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultPageImages.map((item) => {
                        const currentUrl = getImageUrl(item.pageKey, item.imageKey);
                        const isHero = item.pageKey === "home" && item.imageKey === "hero";

                        return (
                            <Card key={`${item.pageKey}-${item.imageKey}`} data-testid={`card-page-image-${item.pageKey}-${item.imageKey}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <Badge variant="outline" className="mb-2">{item.pageKey}</Badge>
                                            <CardTitle className="text-sm">{item.label}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="aspect-video rounded-md overflow-hidden bg-muted relative group">
                                        <img
                                            src={currentUrl}
                                            alt={item.label}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                                            }}
                                        />
                                        {isHero && (
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                다중 이미지
                                            </div>
                                        )}
                                    </div>
                                    <Dialog open={editingImage?.pageKey === item.pageKey && editingImage?.imageKey === item.imageKey} onOpenChange={(open) => {
                                        if (!open) {
                                            setEditingImage(null);
                                            setNewUrl("");
                                            setHeroImages([]);
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleOpenEdit(item)}
                                                data-testid={`button-edit-page-image-${item.pageKey}-${item.imageKey}`}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                {isHero ? "이미지 관리" : "이미지 변경"}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className={isHero ? "max-w-2xl" : ""}>
                                            <DialogHeader>
                                                <DialogTitle>이미지 변경: {item.label}</DialogTitle>
                                            </DialogHeader>

                                            {isHero ? (
                                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                                    {heroImages.map((url, idx) => (
                                                        <div key={idx} className="space-y-2 p-4 border rounded-lg relative">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <Label>이미지 {idx + 1}</Label>
                                                                <Button variant="ghost" size="sm" onClick={() => removeHeroImage(idx)} className="text-destructive h-8 w-8 p-0">
                                                                    <Edit className="w-4 h-4 rotate-45" /> {/* Close icon substitution */}
                                                                </Button>
                                                            </div>
                                                            <ImageUpload
                                                                value={url}
                                                                onChange={(newUrl) => updateHeroImage(idx, newUrl)}
                                                            />
                                                            {url && (
                                                                <div className="aspect-video rounded-md overflow-hidden bg-muted mt-2 h-32">
                                                                    <img
                                                                        src={url}
                                                                        alt={`Preview ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {heroImages.length < 5 && (
                                                        <Button variant="outline" onClick={addHeroImage} className="w-full border-dashed">
                                                            + 이미지 추가
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>이미지 URL</Label>
                                                        <ImageUpload
                                                            value={newUrl}
                                                            onChange={setNewUrl}
                                                        />
                                                    </div>
                                                    {newUrl && (
                                                        <div className="aspect-video rounded-md overflow-hidden bg-muted">
                                                            <img
                                                                src={newUrl}
                                                                alt="미리보기"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Invalid+URL";
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="outline">취소</Button>
                                                </DialogClose>
                                                <Button onClick={handleSave} disabled={(isHero ? bulkUpdateMutation.isPending : updateMutation.isPending)} data-testid="button-save-page-image">
                                                    저장
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
