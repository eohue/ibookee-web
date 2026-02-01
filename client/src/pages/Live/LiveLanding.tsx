import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Project } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function LiveLanding() {
    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ["/api/projects"],
    });

    // Filter projects if needed (e.g., only show those with 'Live' category or similar if applicable)
    // For now, showing all projects as potential 'Live' locations. 
    // You might want to filter this based on specific criteria later.

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32 bg-zinc-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Life at Ibookee
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        다채로운 삶이 공존하는 아이부키의 주거 공간을 만나보세요.
                        <br className="hidden md:block" />
                        나만의 라이프스타일에 맞는 집을 찾아보세요.
                    </p>
                </div>
            </section>

            {/* Locations List */}
            <section className="py-20 container mx-auto px-4 max-w-6xl">
                {isLoading ? (
                    <div className="space-y-12">
                        {[1, 2].map(i => (
                            <div key={i} className="flex flex-col md:flex-row gap-8">
                                <Skeleton className="w-full md:w-1/2 h-80 rounded-2xl" />
                                <div className="flex-1 space-y-4 py-4">
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-24">
                        {projects.map((project, index) => (
                            <div key={project.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center group`}>
                                <Link href={`/live/${project.id}`} className="w-full md:w-1/2 block overflow-hidden rounded-3xl shadow-lg relative cursor-pointer">
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                </Link>

                                <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 justify-center md:justify-start">
                                            {(Array.isArray(project.category) ? project.category : [project.category]).map(cat => (
                                                <Badge key={cat} variant="outline" className="text-sm py-1 px-3 border-gray-400 text-gray-600">
                                                    {cat}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Link href={`/live/${project.id}`}>
                                            <h2 className="text-3xl md:text-4xl font-bold hover:text-primary transition-colors cursor-pointer">{project.title}</h2>
                                        </Link>
                                        {project.titleEn && <p className="text-xl text-gray-400 font-light">{project.titleEn}</p>}
                                        <p className="text-lg font-medium text-gray-600">{project.location}</p>
                                    </div>

                                    <p className="text-gray-500 leading-relaxed line-clamp-3">
                                        {project.description.replace(/<[^>]*>?/gm, '')}
                                    </p>

                                    <Link href={`/live/${project.id}`}>
                                        <span className="inline-flex items-center text-lg font-bold border-b-2 border-black pb-1 hover:text-primary hover:border-primary transition-all gap-2 group/link">
                                            자세히 보기
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
