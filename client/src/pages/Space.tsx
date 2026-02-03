import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Grid3X3, Map, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background font-sans" data-testid="page-space">
      <Header />
      <main>
        {/* Hero Section - Matching Live Page Style */}
        <section className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32 bg-zinc-900 text-white overflow-hidden" data-testid="section-space-hero">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Space at Ibookee
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              아이부키가 만든 공간들을 둘러보세요.
              <br className="hidden md:block" />
              각 프로젝트는 입주민의 필요와 지역의 특성을 반영하여 설계되었습니다.
            </p>
          </div>
        </section>

        <section
          className={cn(
            "sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border py-4 transition-[top] duration-300",
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

        <section className="py-20 container mx-auto px-4 max-w-6xl" data-testid="section-projects">
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
          ) : viewMode === "grid" ? (
            <div className="space-y-24">
              {filteredProjects.map((project, index) => (
                <div key={project.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center group`}>
                  <Link href={`/space/${project.id}`} className="w-full md:w-1/2 block overflow-hidden rounded-3xl shadow-lg relative cursor-pointer">
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
                        {(Array.isArray(project.category) ? project.category : [project.category as unknown as string]).map(cat => (
                          <Badge key={cat} variant="outline" className="text-sm py-1 px-3 border-gray-400 text-gray-600">
                            {getCategoryLabel(cat)}
                          </Badge>
                        ))}
                      </div>
                      <Link href={`/space/${project.id}`}>
                        <h2 className="text-3xl md:text-4xl font-bold hover:text-primary transition-colors cursor-pointer">{project.title}</h2>
                      </Link>
                      {project.titleEn && <p className="text-xl text-gray-400 font-light">{project.titleEn}</p>}
                      <div className="flex items-center justify-center md:justify-start gap-2 text-lg font-medium text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>{project.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-500 leading-relaxed line-clamp-3">
                      {project.description.replace(/<[^>]*>?/gm, '')}
                    </p>

                    <div className="flex items-center justify-between md:justify-start md:gap-8 pt-4">
                      <div className="text-sm text-muted-foreground">
                        <span className="mr-4">{project.year}년 준공</span>
                        {project.units && <span>{project.units}세대</span>}
                      </div>
                      <Link href={`/space/${project.id}`}>
                        <span className="inline-flex items-center text-lg font-bold border-b-2 border-black pb-1 hover:text-primary hover:border-primary transition-all gap-2 group/link">
                          자세히 보기
                          <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 min-h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">지도 뷰</h3>
                <p className="text-muted-foreground">
                  지도 기능은 준비 중입니다.<br />
                  리스트 뷰에서 프로젝트를 확인해주세요.
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
