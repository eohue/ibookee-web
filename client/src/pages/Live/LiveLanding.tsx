import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Project } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Users, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LiveLanding() {
    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ["/api/projects?isLive=true"],
    });

    // Determine project category mapping
    const getProjectType = (project: Project) => {
        const cats = Array.isArray(project.category) ? project.category : [project.category as unknown as string];
        if (cats.includes('청년') || cats.includes('1인')) return 'Youth & Creator';
        if (cats.includes('가족') || cats.includes('신혼부부')) return 'Social & Family';
        return 'Standard';
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            {/* 1. Hero Section - Immersive & Bold */}
            <section className="relative h-screen w-full overflow-hidden bg-zinc-900 text-white flex items-center justify-center">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tighter">
                            아이부키<br />입주모집
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-xl md:text-3xl font-light text-gray-200 tracking-wide"
                    >
                        살고 싶은 집, 살고 싶은 동네
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-sm uppercase tracking-widest text-white/50">스크롤</span>
                    <div className="w-[1px] h-12 bg-white/30" />
                </motion.div>
            </section>

            {/* 2. Philosophy Section - Grid Layout */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-20"
                        {...fadeInUp}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-zinc-900">
                            단순한 건물이 아닌,<br />삶의 방식으로서의 집
                        </h2>
                        <p className="text-lg text-zinc-500 leading-relaxed">
                            아이부키는 집이라는 물리적 공간을 넘어, 입주민의 삶과 지역 사회가 함께 호흡하는 '리빙 플랫폼'을 만듭니다.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            {
                                icon: Sparkles,
                                title: "Reasonable",
                                subtitle: "합리적 주거",
                                desc: "시세보다 저렴한 임대료와 부담 없는 보증금으로 주거 불안을 해소합니다."
                            },
                            {
                                icon: Users,
                                title: "Community",
                                subtitle: "따로 또 같이",
                                desc: "단절된 이웃이 아닌, 느슨한 연대로 연결되어 서로를 지지하는 삶을 지향합니다."
                            },
                            {
                                icon: MapPin,
                                title: "Local",
                                subtitle: "동네의 재발견",
                                desc: "내 집 앞이 가장 핫한 플레이스. 지역 자원과 연계하여 풍요로운 일상을 만듭니다."
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-zinc-50 p-10 rounded-[2rem] hover:bg-zinc-100 transition-colors group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.2 }}
                            >
                                <item.icon className="w-10 h-10 text-primary mb-6 transition-transform group-hover:scale-110 duration-300" />
                                <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 block">{item.subtitle}</span>
                                <p className="text-zinc-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Curator Section - Types */}
            <section className="py-24 bg-zinc-900 text-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div>
                            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">단축 타입</span>
                            <h2 className="text-3xl md:text-5xl font-bold">맞춤형 라이프스타일</h2>
                        </div>
                        <p className="text-zinc-400 max-w-md text-lg">
                            나에게 맞는 라이프스타일을 찾아보세요.<br />다양한 형태의 삶이 공존하는 곳입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Link href="/space?filter=youth" className="group relative aspect-[16/9] md:aspect-[2/1] overflow-hidden rounded-3xl cursor-pointer block">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12">
                                <h3 className="text-3xl md:text-4xl font-bold mb-2">Youth & Creator</h3>
                                <p className="text-zinc-200 text-lg">도전하는 청년과 창작자를 위한 영감의 공간</p>
                            </div>
                            <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </Link>
                        <Link href="/space?filter=family" className="group relative aspect-[16/9] md:aspect-[2/1] overflow-hidden rounded-3xl cursor-pointer block">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12">
                                <h3 className="text-3xl md:text-4xl font-bold mb-2">Social & Family</h3>
                                <p className="text-zinc-200 text-lg">이웃과 함께 성장하는 따뜻한 보금자리</p>
                            </div>
                            <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. Lineup Section - Masonry/Grid */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-20">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">프로젝트 라인업</span>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-zinc-900">
                            집을 찾아보세요
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                            {projects.map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                    <Link href={`/live/${project.id}`} className="group block cursor-pointer">
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 mb-6">
                                            <img
                                                src={project.imageUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-white/90 text-black hover:bg-white border-0 backdrop-blur-sm">
                                                    {project.location}
                                                </Badge>
                                            </div>
                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white text-black px-6 py-3 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    자세히 보기
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 border border-zinc-200 px-2 py-1 rounded-full">
                                                    {getProjectType(project)}
                                                </span>
                                            </div>
                                            {project.titleEn && <p className="text-zinc-500 font-medium">{project.titleEn}</p>}
                                            <div className="pt-2 text-zinc-400 text-sm line-clamp-2">
                                                {project.description.replace(/<[^>]*>?/gm, '')}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
