import { Link } from "wouter";
import { ArrowRight, Newspaper, Heart, MessageCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import type { ResidentReporter } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReporterPreviewProps {
    articles?: ResidentReporter[];
    isLoading: boolean;
}

export default function ReporterPreview({ articles = [], isLoading }: ReporterPreviewProps) {
    const displayedArticles = articles?.slice(0, 6) || [];

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        loop: true,
    });

    // Navigation handlers
    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    return (
        <section className="py-20 bg-muted/30" data-testid="section-reporter-preview">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">
                            Reporter
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                            입주민 기자단
                        </h2>
                        <p className="mt-3 text-muted-foreground max-w-xl">
                            안암생활의 생생한 이야기를 입주민 기자가 직접 전해드립니다.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/resident-reporter-guide">
                            <Button variant="ghost" className="group text-muted-foreground hover:text-primary">
                                <Info className="w-4 h-4 mr-2" />
                                기자단이란?
                            </Button>
                        </Link>
                        <Link href="/community">
                            <Button variant="outline" className="group">
                                기사 더보기
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[300px] bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : displayedArticles.length > 0 ? (
                    <div className="relative group">
                        <div className="overflow-hidden py-8" ref={emblaRef}>
                            <div className="flex -ml-4 px-2">
                                {displayedArticles.map((article) => (
                                    <div key={article.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
                                        <Link href="/community">
                                            <Card
                                                className="overflow-hidden hover-card-strong cursor-pointer h-full transition-all duration-300 border-border/60 shadow-sm"
                                                data-testid={`article-${article.id}`}
                                            >
                                                <div className="aspect-[16/9] overflow-hidden relative group">
                                                    <img
                                                        src={article.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Newspaper className="w-4 h-4 text-primary" />
                                                        <Badge variant="secondary" className="bg-secondary/50">
                                                            안암 리포트
                                                        </Badge>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                                        {article.content.replace(/<[^>]*>?/gm, "").substring(0, 100)}...
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                                                        <span>{article.authorName} 기자</span>
                                                        {article.createdAt && (
                                                            <span>{new Date(article.createdAt).toLocaleDateString("ko-KR")}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Navigation Arrows - Glassmorphism style - Always visible for loop */}
                        <button
                            className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 z-10 h-12 w-12 rounded-full backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-lg transition-all duration-200 flex items-center justify-center opacity-100"
                            onClick={scrollPrev}
                            data-testid="button-reporter-prev"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 z-10 h-12 w-12 rounded-full backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-lg transition-all duration-200 flex items-center justify-center opacity-100"
                            onClick={scrollNext}
                            data-testid="button-reporter-next"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-xl">
                        <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">등록된 기사가 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
