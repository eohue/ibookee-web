import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectUnit } from "@shared/schema";
import { UnitCard } from "@/pages/Apply/components/UnitCard";
import { MapPin } from "lucide-react";
import DOMPurify from "dompurify";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveDetail() {
    const [, params] = useRoute("/live/:id");
    const projectId = params?.id;

    const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
        queryKey: ["/api/projects", projectId],
        enabled: !!projectId,
    });

    const { data: units = [], isLoading: isUnitsLoading } = useQuery<ProjectUnit[]>({
        queryKey: [`/api/projects/${projectId}/units`],
        enabled: !!projectId,
    });

    if (isProjectLoading || isUnitsLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 py-24 space-y-8">
                    <Skeleton className="h-[60vh] w-full rounded-2xl" />
                    <Skeleton className="h-12 w-2/3 mx-auto" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!project) return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <p className="text-xl text-gray-500">프로젝트를 찾을 수 없습니다.</p>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />

            {/* 1. Hero Section */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <Badge className="mb-6 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-0 text-lg px-6 py-2 rounded-full font-light">
                        {Array.isArray(project.category) ? project.category[0] : project.category}
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">{project.title}</h1>
                    {project.titleEn && <p className="text-xl md:text-3xl font-light opacity-90 mb-10 tracking-wide">{project.titleEn}</p>}

                    <Link href="/apply">
                        <Button size="lg" className="text-lg px-10 py-7 rounded-full bg-white text-black hover:bg-gray-100 border-none transition-all hover:scale-105 shadow-xl">
                            입주 신청하기
                        </Button>
                    </Link>
                </div>
            </section>

            {/* 2. Building Intro */}
            <section className="py-24 container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-20 fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">공간 소개</h2>
                    <div
                        className="prose prose-lg prose-gray mx-auto leading-relaxed text-gray-600 break-keep"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.description) }}
                    />
                </div>

                {/* Placeholder for Diagram */}
                <div className="max-w-5xl mx-auto bg-gray-50 rounded-3xl p-12 md:p-24 text-center border border-gray-100">
                    <div className="max-w-md mx-auto space-y-4">
                        <p className="text-xl font-bold text-gray-400">FLOOR PLAN</p>
                        <p className="text-gray-400">층별 안내도가 준비 중입니다.</p>
                        {/* Visual placeholder logic could go here */}
                    </div>
                </div>
            </section>

            {/* 3. Community (Static Placeholder) */}
            <section className="py-24 bg-zinc-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Community & Amenities</h2>
                        <p className="text-gray-500 text-lg">입주민들의 풍요로운 삶을 위한 공용 공간입니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Lounge', desc: '자유롭게 휴식하고 소통하는 라운지' },
                            { title: 'Kitchen', desc: '함께 요리하고 나누는 소셜 키친' },
                            { title: 'Rooftop', desc: '도심 속 여유를 즐기는 루프탑' }
                        ].map((item, idx) => (
                            <div key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-64 bg-gray-200 relative overflow-hidden">
                                    {/* Placeholder image logic */}
                                    <div className="absolute inset-0 bg-gray-800/10 group-hover:bg-transparent transition-colors" />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Room Types */}
            <section className="py-24 container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Room Types</h2>
                    <p className="text-gray-500 text-lg">나에게 맞는 방을 선택하세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {units.length > 0 ? units.map(unit => (
                        <UnitCard
                            key={unit.id}
                            unit={unit}
                            onApply={(u) => window.location.href = `/apply?projectId=${projectId}&unitId=${u.id}`} // Simple redirect to Apply page with params
                        />
                    )) : (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed text-gray-500">
                            <p>현재 등록된 공실 정보가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 5. Neighborhood */}
            <section className="py-24 bg-[#1a1a1a] text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">우리 동네,<br />{project.location}</h2>

                            <div className="space-y-6 text-lg text-white/70 leading-relaxed">
                                <p>
                                    이 곳은 단순한 주거 공간이 아닙니다.
                                    {project.location}의 활기찬 에너지와 고즈넉한 골목의 정취를
                                    동시에 느낄 수 있는 특별한 장소입니다.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <MapPin className="text-primary w-5 h-5" />
                                        <span>지하철역 도보 5분</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <MapPin className="text-primary w-5 h-5" />
                                        <span>편의점, 카페 등 편의시설 인접</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex-1 w-full aspect-square md:aspect-[4/3] bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center p-8">
                            <div className="text-center text-white/30">
                                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Location Map Visualization</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky CTA for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t p-4 md:hidden z-50">
                <Link href={`/apply?projectId=${projectId}`}>
                    <Button className="w-full text-lg py-6 rounded-xl shadow-lg" size="lg">
                        입주 상담 / 투어 신청
                    </Button>
                </Link>
            </div>

            <Footer />
        </div>
    );
}
