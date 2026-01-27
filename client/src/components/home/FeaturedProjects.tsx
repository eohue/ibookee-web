import { Link } from "wouter";
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@shared/schema";

import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FeaturedProjectsProps {
  projects?: Project[];
  isLoading: boolean;
}

export default function FeaturedProjects({ projects = [], isLoading }: FeaturedProjectsProps) {
  // Take up to 10 projects, prioritizing featured ones
  const featuredOnly = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);
  const displayProjects = [...featuredOnly, ...otherProjects].slice(0, 10);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    loop: true,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  // Navigation handlers
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" data-testid="section-featured-projects">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase">
              Featured Projects
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              공간에 <span className="text-primary">삶</span>을 담다
            </h2>
          </div>
          <Link href="/space">
            <Button variant="outline" className="group rounded-full px-6 border-primary/20 hover:bg-primary/5 hover:text-primary" data-testid="button-view-all-projects">
              전체 프로젝트 보기
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 first:pl-0">
                  <Card className="overflow-hidden border-0 shadow-sm">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-3/4" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
            <p className="text-muted-foreground text-lg">
              등록된 프로젝트가 없습니다.
            </p>
          </div>
        ) : (
          <div className="relative group">
            <div className="overflow-hidden py-8" ref={emblaRef}>
              <div className="flex -ml-6 px-2">
                {displayProjects.map((project) => (
                  <div key={project.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6">
                    <Link href={`/space/${project.id}`}>
                      <div
                        className="group rounded-2xl border-2 border-border bg-card shadow-lg overflow-hidden hover:shadow-xl cursor-pointer h-full flex flex-col transition-all"
                        data-testid={`card-project-${project.id}`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-4 left-4">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(project.category) ? project.category : [project.category as unknown as string]).map((cat) => (
                                <Badge key={cat} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0 mr-1 hover:bg-white/30">
                                  {CATEGORY_LABELS[cat] || cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                            {project.titleEn && (
                              <p className="text-white/70 text-sm font-medium tracking-wide">{project.titleEn}</p>
                            )}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-primary text-sm mb-3">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{project.location}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {project.description.replace(/<[^>]*>?/gm, "")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                            <span>{project.year}년 준공</span>
                            {project.units && (
                              <span className="font-semibold text-foreground">{project.units}세대</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Navigation - Button style update: removed opacity-0 group-hover:opacity-100 to make them always visible */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between pointer-events-none px-2 lg:px-0">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full pointer-events-auto bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all opacity-100 -translate-x-1/2"
                onClick={scrollPrev}
                data-testid="button-featured-prev"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full pointer-events-auto bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all opacity-100 translate-x-1/2"
                onClick={scrollNext}
                data-testid="button-featured-next"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
