import { Link } from "wouter";
import { ArrowRight, Newspaper, Heart, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { ResidentReporter } from "@shared/schema";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReporterPreview() {
    const { data: articles, isLoading } = useQuery<ResidentReporter[]>({
        queryKey: ["/api/resident-reporter"],
    });

    const displayedArticles = articles?.slice(0, 6) || [];

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
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {displayedArticles.map((article) => (
                                <CarouselItem key={article.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <Link href="/community">
                                        <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-none shadow-sm overflow-hidden group">
                                            <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                                                <img
                                                    src={article.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-white/90 text-black hover:bg-white flex items-center gap-1">
                                                        <Newspaper className="w-3 h-3" />
                                                        안암 리포트
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                        {article.authorName} 기자
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(article.createdAt || "").toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </h3>
                                                <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4" />
                                                        <span>{article.likes || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span>{article.commentCount || 0}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex justify-end gap-2 mt-8">
                            <CarouselPrevious className="position-static transform-none" />
                            <CarouselNext className="position-static transform-none" />
                        </div>
                    </Carousel>
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
