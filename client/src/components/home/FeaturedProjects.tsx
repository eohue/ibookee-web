import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  youth: "청년주택",
  single: "1인가구",
  "social-mix": "소셜믹스",
  "local-anchor": "도시재생",
};

export default function FeaturedProjects() {
  const { data: projects = [], isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-background border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              등록된 프로젝트가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.map((project) => (
              <Link
                key={project.id}
                href={`/space/${project.id}`}
                className="group block overflow-hidden rounded-lg bg-background border border-border hover-elevate"
                data-testid={`card-project-${project.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full mb-2">
                      {categoryLabels[project.category] || project.category}
                    </span>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    {project.titleEn && (
                      <p className="text-white/80 text-sm">{project.titleEn}</p>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{project.year}년 준공</span>
                    {project.units && (
                      <span className="font-medium text-foreground">{project.units}세대</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
