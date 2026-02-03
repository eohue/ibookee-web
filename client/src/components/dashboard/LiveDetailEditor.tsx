import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import type { LiveProjectDetail, RoomType, CommunityFeature } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

interface LiveDetailEditorProps {
    projectId: string;
    projectTitle: string;
    onBack: () => void;
}

export function LiveDetailEditor({ projectId, projectTitle, onBack }: LiveDetailEditorProps) {
    const { toast } = useToast();

    // Form States
    const [heroSlogan, setHeroSlogan] = useState("");
    const [heroImage, setHeroImage] = useState("");
    const [conceptTitle, setConceptTitle] = useState("");
    const [conceptText, setConceptText] = useState("");
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [communityImages, setCommunityImages] = useState<CommunityFeature[]>([]);

    const { data: detail, isLoading } = useQuery<LiveProjectDetail>({
        queryKey: [`/api/projects/${projectId}/live-detail`],
    });

    useEffect(() => {
        if (detail) {
            setHeroSlogan(detail.heroSlogan || "");
            setHeroImage(detail.heroImage || "");
            setConceptTitle(detail.conceptTitle || "");
            setConceptText(detail.conceptText || "");
            setRoomTypes((detail.roomTypes as unknown as RoomType[]) || []);
            setCommunityImages((detail.communityImages as unknown as CommunityFeature[]) || []);
        }
    }, [detail]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", `/api/admin/projects/${projectId}/live-detail`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/live-detail`] });
            toast({ title: "저장되었습니다." });
        },
        onError: () => {
            toast({ title: "저장 실패", variant: "destructive" });
        },
    });

    const handleSave = () => {
        mutation.mutate({
            heroSlogan,
            heroImage,
            conceptTitle,
            conceptText,
            roomTypes,
            communityImages,
        });
    };

    const addRoomType = () => {
        setRoomTypes([...roomTypes, { name: "", summary: "", details: [], price: "", images: [] }]);
    };

    const updateRoomType = (index: number, field: keyof RoomType, value: any) => {
        const newRooms = [...roomTypes];
        newRooms[index] = { ...newRooms[index], [field]: value };
        setRoomTypes(newRooms);
    };

    const removeRoomType = (index: number) => {
        setRoomTypes(roomTypes.filter((_, i) => i !== index));
    };

    const addCommunityFeature = () => {
        setCommunityImages([...communityImages, { title: "", description: "", imageUrl: "" }]);
    };

    const updateCommunityFeature = (index: number, field: keyof CommunityFeature, value: any) => {
        const newFeatures = [...communityImages];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setCommunityImages(newFeatures);
    };

    const removeCommunityFeature = (index: number) => {
        setCommunityImages(communityImages.filter((_, i) => i !== index));
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{projectTitle} 상세 페이지 관리</h2>
                        <p className="text-muted-foreground">Mangrove 스타일의 상세 페이지 내용을 편집합니다.</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={mutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    저장하기
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Hero Slogan</Label>
                            <Input value={heroSlogan} onChange={e => setHeroSlogan(e.target.value)} placeholder="Live in Project Name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Hero Background Image</Label>
                            <ImageUpload value={heroImage} onChange={(url) => setHeroImage(url as string)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Concept Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Concept</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Concept Title</Label>
                            <Input value={conceptTitle} onChange={e => setConceptTitle(e.target.value)} placeholder="함께 성장하는 집" />
                        </div>
                        <div className="space-y-2">
                            <Label>Concept Description</Label>
                            <Textarea value={conceptText} onChange={e => setConceptText(e.target.value)} className="min-h-[100px]" placeholder="긴 설명 텍스트..." />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Room Types */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Room Types (Stay)</h3>
                    <Button onClick={addRoomType} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Room Type 추가
                    </Button>
                </div>
                {roomTypes.map((room, index) => (
                    <Card key={index} className="relative border-l-4 border-l-primary">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-destructive"
                            onClick={() => removeRoomType(index)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>타입 이름</Label>
                                    <Input value={room.name} onChange={e => updateRoomType(index, 'name', e.target.value)} placeholder="Single, Dorm, etc." />
                                </div>
                                <div className="space-y-2">
                                    <Label>한줄 요약</Label>
                                    <Input value={room.summary} onChange={e => updateRoomType(index, 'summary', e.target.value)} placeholder="나만의 아늑한 공간" />
                                </div>
                                <div className="space-y-2">
                                    <Label>가격 정보</Label>
                                    <Input value={room.price} onChange={e => updateRoomType(index, 'price', e.target.value)} placeholder="500,000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>상세 옵션 (엔터로 구분)</Label>
                                    <Textarea
                                        value={room.details?.join('\n') || ""}
                                        onChange={e => updateRoomType(index, 'details', e.target.value.split('\n'))}
                                        placeholder="슈퍼싱글 침대\n개인 냉장고"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>이미지 목록 (첫번째가 대표)</Label>
                                <MultiImageUpload
                                    value={room.images || []}
                                    onChange={urls => updateRoomType(index, 'images', urls)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Separator />

            {/* Community */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Community</h3>
                    <Button onClick={addCommunityFeature} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Community 추가
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {communityImages.map((feature, index) => (
                        <Card key={index} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-destructive z-10 bg-white/50 hover:bg-white"
                                onClick={() => removeCommunityFeature(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>공간 이름</Label>
                                    <Input value={feature.title} onChange={e => updateCommunityFeature(index, 'title', e.target.value)} placeholder="Library" />
                                </div>
                                <div className="space-y-2">
                                    <Label>설명</Label>
                                    <Input value={feature.description} onChange={e => updateCommunityFeature(index, 'description', e.target.value)} placeholder="영감을 주는 서재" />
                                </div>
                                <div className="space-y-2">
                                    <Label>이미지</Label>
                                    <ImageUpload value={feature.imageUrl} onChange={url => updateCommunityFeature(index, 'imageUrl', url as string)} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-8 pb-20">
                <Button size="lg" onClick={handleSave} disabled={mutation.isPending}>
                    <Save className="w-5 h-5 mr-2" />
                    변경사항 저장
                </Button>
            </div>
        </div>
    );
}
