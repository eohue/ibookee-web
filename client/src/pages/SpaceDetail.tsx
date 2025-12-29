import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Project } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, Home, Users, AlertCircle, RefreshCw } from "lucide-react";

const categoryLabels: Record<string, string> = {
  youth: "청년주택",
  single: "1인가구",
  "social-mix": "소셜믹스",
  "local-anchor": "지역거점",
};

export default function SpaceDetail() {
  const [, params] = useRoute("/space/:id");
  const projectId = params?.id ? parseInt(params.id) : null;

  const { data: project, isLoading, isError, refetch } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: projectId !== null,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" data-testid="page-space-detail">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="aspect-[16/9] w-full rounded-lg mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen" data-testid="page-space-detail">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/space">
              <Button variant="ghost" className="mb-8" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isError ? "데이터를 불러올 수 없습니다" : "프로젝트를 찾을 수 없습니다"}
              </h3>
              <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
              {isError && (
                <Button variant="outline" onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="page-space-detail">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/space">
            <Button variant="ghost" className="mb-8" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>
          </Link>

          <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-8">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="mb-3 bg-white/20 backdrop-blur-sm text-white border-0">
                {categoryLabels[project.category] || project.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" data-testid="text-project-title">
                {project.title}
              </h1>
              {project.titleEn && (
                <p className="text-white/80 text-lg">{project.titleEn}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">위치</span>
              </div>
              <p className="font-medium text-foreground">{project.location}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">준공연도</span>
              </div>
              <p className="font-medium text-foreground">{project.year}년</p>
            </div>
            {project.units && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">세대수</span>
                </div>
                <p className="font-medium text-foreground">{project.units}세대</p>
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-4">프로젝트 소개</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-project-description">
              {project.description}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
