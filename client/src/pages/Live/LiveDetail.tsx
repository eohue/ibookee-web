import { useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Project, LiveProjectDetail, RoomType, CommunityFeature } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Check, Wifi, Wind, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LiveDetail() {
    const { id } = useParams();

    const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
        queryKey: [`/api/projects/${id}`],
    });

    const { data: detail, isLoading: isDetailLoading } = useQuery<LiveProjectDetail>({
        queryKey: [`/api/projects/${id}/live-detail`],
    });

    const isLoading = isProjectLoading || isDetailLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="pt-32 container mx-auto px-4">
                    <Skeleton className="w-full h-[60vh] rounded-xl mb-8" />
                    <Skeleton className="w-2/3 h-12 mb-4" />
                    <Skeleton className="w-1/2 h-8" />
                </div>
            </div>
        );
    }

    if (!project) return <div>Project not found</div>;

    const roomTypes = (detail?.roomTypes as unknown as RoomType[]) || [];
    const communityImages = (detail?.communityImages as unknown as CommunityFeature[]) || [];

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />

            {/* 1. Hero Section */}
            <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center bg-zinc-900">
                {detail?.heroImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${detail.heroImage})` }}
                    />
                ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${project.imageUrl})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                <div className="relative z-10 text-center text-white p-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block border border-white/30 px-4 py-1 rounded-full text-sm font-medium tracking-widest uppercase mb-6 backdrop-blur-sm">
                            Live at Ibookee
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
                            {detail?.heroSlogan || project.titleEn || project.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
                            {project.location} · {project.units}세대
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                    <span className="text-xs uppercase tracking-widest text-white/70 mb-2">Scroll</span>
                    <div className="w-[1px] h-8 bg-white/50" />
                </div>
            </section>

            {/* Sticky Nav */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-8 py-4 overflow-x-auto no-scrollbar">
                        <a href="#concept" className="text-sm font-bold uppercase tracking-widest hover:text-primary whitespace-nowrap">Concept</a>
                        <a href="#stay" className="text-sm font-bold uppercase tracking-widest hover:text-primary whitespace-nowrap">Stay</a>
                        <a href="#community" className="text-sm font-bold uppercase tracking-widest hover:text-primary whitespace-nowrap">Community</a>
                        <a href="#location" className="text-sm font-bold uppercase tracking-widest hover:text-primary whitespace-nowrap">Location</a>
                        <div className="flex-1" />
                        <Button size="sm" className="hidden md:flex rounded-full">
                            입주 신청하기
                        </Button>
                    </nav>
                </div>
            </div>

            {/* 2. Concept Section */}
            <section id="concept" className="py-24 md:py-32 container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="w-full md:w-1/3">
                        <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Concept</h2>
                        <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                            {detail?.conceptTitle || "새로운 주거 경험,\n아이부키와 시작하세요"}
                        </h3>
                    </div>
                    <div className="w-full md:w-2/3">
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none mb-12 text-muted-foreground leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: detail?.conceptText || project.description }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "합리적인 임대료와 보증금",
                                "풀옵션 가구와 가전",
                                "입주민 전용 커뮤니티 라운지",
                                "전문 매니저 상주 관리"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="font-medium text-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Stay (Room Types) */}
            <section id="stay" className="py-24 bg-zinc-50 border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="mb-16">
                        <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Stay</h2>
                        <h3 className="text-3xl md:text-4xl font-bold">Private Rooms</h3>
                        <p className="text-muted-foreground mt-4 max-w-xl">
                            나만의 라이프스타일에 맞게 설계된 독립적인 주거 공간입니다.
                        </p>
                    </div>

                    {roomTypes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            {roomTypes.map((room, idx) => (
                                <div key={idx} className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50">
                                    {/* Image Carousel (Simplified as single image first) */}
                                    <div className="aspect-[4/3] overflow-hidden relative">
                                        {room.images && room.images.length > 0 ? (
                                            <img
                                                src={room.images[0]}
                                                alt={room.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <span className="text-muted-foreground">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {room.summary}
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-2xl font-bold mb-1">{room.name}</h4>
                                                <p className="text-primary font-semibold">{room.price}</p>
                                            </div>
                                            <Button variant="outline" size="icon" className="rounded-full">
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <Separator className="mb-6" />

                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                                            {room.details && room.details.map((item, i) => (
                                                <span key={i} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                            <p className="text-muted-foreground">등록된 룸 타입 정보가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Community */}
            <section id="community" className="py-24 container mx-auto px-4">
                <div className="mb-16 md:text-center max-w-3xl mx-auto">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Community</h2>
                    <h3 className="text-3xl md:text-4xl font-bold mb-6">Shared Spaces</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        입주민이라면 누구나 자유롭게 이용할 수 있는 공용 공간입니다.<br />
                        이웃과 함께 요리하고, 대화하고, 휴식하며 더 풍요로운 일상을 만들어보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {communityImages.length > 0 ? (
                        communityImages.map((feat, idx) => (
                            <Card key={idx} className="overflow-hidden border-0 shadow-lg bg-zinc-900 text-white h-[400px] group relative rounded-2xl">
                                <div className="absolute inset-0">
                                    {feat.imageUrl && (
                                        <img
                                            src={feat.imageUrl}
                                            alt={feat.title}
                                            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                </div>
                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <h4 className="text-2xl font-bold mb-2">{feat.title}</h4>
                                    <p className="text-zinc-300 line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        {feat.description}
                                    </p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        // Fallback placeholders
                        [1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-[400px] rounded-2xl" />
                        ))
                    )}
                </div>
            </section>

            {/* 5. Location */}
            <section id="location" className="py-24 bg-zinc-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="w-full lg:w-1/2 space-y-8">
                            <div>
                                <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Location</h2>
                                <h3 className="text-3xl md:text-4xl font-bold mb-4">{project.location}</h3>
                                <p className="text-xl text-muted-foreground">{project.title} 주변의 매력적인 장소를 소개합니다.</p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-primary mt-1" />
                                    <div>
                                        <h5 className="font-bold mb-1">주소</h5>
                                        <p className="text-muted-foreground">{project.location} (상세주소는 입주 상담 시 안내)</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Wifi className="w-4 h-4" /> 초고속 와이파이
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Wind className="w-4 h-4" /> 쾌적한 공조시스템
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Zap className="w-4 h-4" /> 풀옵션 가전
                                    </div>
                                </div>
                            </div>

                            <Button size="lg" className="w-full rounded-full h-14 text-lg">
                                방문 신청하기
                            </Button>
                        </div>
                        <div className="w-full lg:w-1/2 aspect-square lg:aspect-[4/3] bg-zinc-200 rounded-3xl overflow-hidden relative">
                            {/* Map Placeholder or Interactive Map */}
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(project.location)}`}
                                className="w-full h-full grayscale opacity-80 hover:grayscale-0 transition-all duration-500"
                                loading="lazy"
                            ></iframe>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg font-bold shadow-lg">Google Map (API Key Required)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
