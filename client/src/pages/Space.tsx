import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Grid3X3, Map, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";

import { PROJECT_CATEGORIES } from "@/lib/constants";

const categories = [
  { id: "all", label: "전체", labelEn: "All" },
  ...PROJECT_CATEGORIES
];

import { useScrollVisible } from "@/hooks/use-scroll-visible";

export default function Space() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const { isVisible } = useScrollVisible();

  const { data: projects = [], isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter((p) => {
      const cats = Array.isArray(p.category) ? p.category : [p.category as unknown as string];
      return cats.includes(activeCategory);
    });

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.label || categoryId;
  };

  return (
    <div className="min-h-screen" data-testid="page-space">
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-card" data-testid="section-space-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Space
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                프로젝트
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                아이부키가 만든 공간들을 둘러보세요.<br />각 프로젝트는 입주민의 필요와 지역의 특성을 반영하여 설계되었습니다.
              </p>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border py-2 transition-[top] duration-300",
            isVisible ? "top-14" : "top-0"
          )}
          data-testid="section-filter"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className="rounded-full"
                    data-testid={`filter-${category.id}`}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "map" ? "default" : "outline"}
                  onClick={() => setViewMode("map")}
                  data-testid="button-view-map"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/60" data-testid="section-projects">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isError ? (
              <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                <Button variant="outline" onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-lg bg-card border border-border">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/space/${project.id}`}
                  >
                    <div
                      className="group rounded-2xl border-2 border-border bg-card overflow-hidden shadow-lg hover:shadow-xl cursor-pointer h-full flex flex-col transition-all"
                      data-testid={`card-project-${project.id}`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 left-4">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(project.category) ? project.category : [project.category as unknown as string]).map((cat) => (
                              <Badge key={cat} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0 mr-1 hover:bg-white/30">
                                {getCategoryLabel(cat)}
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
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">지도 뷰</h3>
                  <p className="text-muted-foreground">
                    지도 기능은 준비 중입니다.<br />
                    갤러리 뷰에서 프로젝트를 확인해주세요.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  해당 카테고리의 프로젝트가 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
