import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@shared/schema";

import { CATEGORY_LABELS } from "@/lib/constants";

export default function FeaturedProjects() {
  const { data: projects = [], isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

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
    <section className="py-20 md:py-24 bg-card" data-testid="section-featured-projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">
              Featured Projects
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              공간에 삶을 담다
            </h2>
          </div>
          <Link href="/space">
            <Button variant="outline" className="group" data-testid="button-view-all-projects">
              전체 프로젝트 보기
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isError ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
            <Button variant="outline" onClick={() => refetch()} data-testid="button-retry-featured">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </div>
        ) : isLoading ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 first:pl-0">
                  <div className="overflow-hidden rounded-lg bg-background border border-border">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              등록된 프로젝트가 없습니다.
            </p>
          </div>
        ) : (
          <div className="relative group">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {displayProjects.map((project) => (
                  <div key={project.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
                    <Link
                      href={`/space/${project.id}`}
                      className="group/card block h-full overflow-hidden rounded-lg bg-background border border-border hover-elevate transition-all duration-300"
                      data-testid={`card-project-${project.id}`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(Array.isArray(project.category) ? project.category : [project.category as unknown as string]).map((cat) => (
                              <span key={cat} className="inline-block px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full">
                                {CATEGORY_LABELS[cat] || cat}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                          {project.titleEn && (
                            <p className="text-white/80 text-sm line-clamp-1">{project.titleEn}</p>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{project.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{project.year}년 준공</span>
                          {project.units && (
                            <span className="font-medium text-foreground">{project.units}세대</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            {/* Navigation Arrows - Glassmorphism style - Always visible for loop */}
            <button
              className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 z-10 h-12 w-12 rounded-full backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-lg transition-all duration-200 flex items-center justify-center opacity-100"
              onClick={scrollPrev}
              data-testid="button-featured-prev"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 z-10 h-12 w-12 rounded-full backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-lg transition-all duration-200 flex items-center justify-center opacity-100"
              onClick={scrollNext}
              data-testid="button-featured-next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
