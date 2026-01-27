import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Article } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, AlertCircle, RefreshCw, FileText, Download, ExternalLink } from "lucide-react";
import DOMPurify from "dompurify";

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
                <a href={article.fileUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center no-underline w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full p-4 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">첨부파일 다운로드</p>
                        <p className="text-xs text-muted-foreground">{article.title}.pdf</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity ml-4" />
                  </div>
                </a>
              </div>
            )}

            {article.sourceUrl && (
              <div className="mb-8">
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center no-underline">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">원문 기사 보기</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{article.sourceUrl}</p>
                    </div>
                  </div>
                </a>
              </div>
            )}

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                className="text-foreground leading-relaxed"
                data-testid="text-article-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
              />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
