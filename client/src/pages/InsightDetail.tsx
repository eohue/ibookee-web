import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Article } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, AlertCircle, RefreshCw, FileText, Download } from "lucide-react";

const categoryLabels: Record<string, string> = {
  column: "칼럼",
  media: "미디어",
  library: "자료실",
};

export default function InsightDetail() {
  const [, params] = useRoute("/insight/:id");
  const articleId = params?.id || null;

  const { data: article, isLoading, isError, refetch } = useQuery<Article>({
    queryKey: ["/api/articles", articleId],
    enabled: articleId !== null,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" data-testid="page-insight-detail">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (isError || !article) {
    return (
      <div className="min-h-screen" data-testid="page-insight-detail">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/insight">
              <Button variant="ghost" className="mb-8" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isError ? "데이터를 불러올 수 없습니다" : "게시글을 찾을 수 없습니다"}
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

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  return (
    <div className="min-h-screen" data-testid="page-insight-detail">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/insight">
            <Button variant="ghost" className="mb-8" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>
          </Link>

          <article>
            <header className="mb-8">
              <Badge className="mb-4">
                {categoryLabels[article.category] || article.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-article-title">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {article.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>
            </header>

            {article.imageUrl && (
              <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-4">
                {article.excerpt}
              </p>
            )}

            {article.fileUrl && (
              <div className="mb-8">
                <a href={article.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center no-underline">
                  <Button variant="outline" className="gap-2 h-12 px-6">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-base">첨부파일 다운로드</span>
                    <Download className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </a>
              </div>
            )}

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                className="text-foreground leading-relaxed"
                data-testid="text-article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
