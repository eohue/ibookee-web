import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Project, Subproject, RelatedArticle } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Home, Users, AlertCircle, RefreshCw, Building2, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { CATEGORY_LABELS } from "@/lib/constants";

export default function SpaceDetail() {
  const [, params] = useRoute("/space/:id");
  const projectId = params?.id || null;

  const { data: project, isLoading, isError, refetch } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: projectId !== null,
  });

  const { data: subprojects = [] } = useQuery<Subproject[]>({
    queryKey: [`/api/projects/${projectId}/subprojects`],
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
              <div className="flex flex-wrap gap-2 mb-3">
                {(Array.isArray(project.category) ? project.category : [project.category as unknown as string]).map((cat) => (
                  <Badge key={cat} className="bg-white/20 backdrop-blur-sm text-white border-0">
                    {CATEGORY_LABELS[cat] || cat}
                  </Badge>
                ))}
              </div>
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
                <span className="text-sm">준공</span>
              </div>
              <p className="font-medium text-foreground">
                {project.year}년{project.completionMonth ? ` ${parseInt(project.completionMonth)}월` : ''}
              </p>
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
            {project.scale && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">규모</span>
                </div>
                <p className="font-medium text-foreground">{project.scale}</p>
              </div>
            )}
            {project.siteArea && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="text-sm">대지면적</span>
                </div>
                <p className="font-medium text-foreground">{project.siteArea}</p>
              </div>
            )}
            {project.grossFloorArea && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="text-sm">연면적</span>
                </div>
                <p className="font-medium text-foreground">{project.grossFloorArea}</p>
              </div>
            )}
            {project.pdfUrl && (
              <a
                href={project.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/5 rounded-lg p-4 border border-primary/20 hover:bg-primary/10 transition-colors block group"
              >
                <div className="flex items-center gap-2 text-primary/70 group-hover:text-primary mb-1">
                  <ArrowRight className="w-4 h-4 -rotate-45" />
                  <span className="text-sm">소개서</span>
                </div>
                <p className="font-bold text-primary">PDF 다운로드</p>
              </a>
            )}
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-4">프로젝트 소개</h2>
            <div
              className="text-muted-foreground leading-relaxed mb-16"
              data-testid="text-project-description"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />

            {(() => {
              const relatedArticles = (project.relatedArticles as unknown as RelatedArticle[]) ?? [];
              if (relatedArticles.length === 0) return null;

              return (
                <div className="border-t border-border pt-12 mb-12">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    관련 기사
                  </h3>
                  <div className="grid gap-3">
                    {relatedArticles.map((article, index) => (
                      <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const partnerLogos = (project.partnerLogos as unknown as string[]) ?? [];
              if (partnerLogos.length === 0) return null;

              return (
                <div className="border-t border-border pt-12">
                  <h3 className="text-lg font-semibold mb-6">Partners</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
                    {partnerLogos.map((logo, index) => (
                      <div key={index} className="w-full aspect-[3/2] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                        <img
                          src={logo}
                          alt={`Partner ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Subprojects Section */}
            {subprojects.length > 0 && (
              <div className="border-t border-border pt-12">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  관련 프로젝트
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subprojects.map((sub) => (
                    <Card key={sub.id} className="overflow-hidden">
                      {sub.imageUrl && (
                        <img
                          src={sub.imageUrl}
                          alt={sub.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{sub.name}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{sub.location}</p>
                          {sub.completionYear && (
                            <p>
                              {sub.completionYear}년
                              {sub.completionMonth ? ` ${parseInt(sub.completionMonth)}월` : ''} 준공
                            </p>
                          )}
                          {sub.units && <p>{sub.units}세대</p>}
                          {sub.scale && <p>{sub.scale}</p>}
                          {sub.siteArea && <p>대지면적: {sub.siteArea}</p>}
                          {sub.grossFloorArea && <p>연면적: {sub.grossFloorArea}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
