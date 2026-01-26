import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Video, Download, Calendar, User, AlertCircle, RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Article } from "@shared/schema";

const ITEMS_PER_PAGE = 21;

const categories = [
  { id: "all", label: "전체" },
  { id: "column", label: "칼럼" },
  { id: "media", label: "미디어" },
  { id: "notice", label: "알림" },
  { id: "library", label: "자료실" },
];

function getPageFromUrl(): number {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get('page') || '1', 10);
  return page > 0 ? page : 1;
}

function getCategoryFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || 'all';
}



export default function Insight() {
  const [activeCategory, setActiveCategory] = useState(getCategoryFromUrl);
  const [currentPage, setCurrentPage] = useState(getPageFromUrl);

  const { data, isLoading, isError, refetch } = useQuery<{ articles: Article[]; total: number }>({
    queryKey: ["/api/articles", activeCategory, currentPage],
    queryFn: async () => {
      const limit = ITEMS_PER_PAGE;
      const url = activeCategory === "all"
        ? `/api/articles?page=${currentPage}&limit=${limit}`
        : `/api/articles/category/${activeCategory}?page=${currentPage}&limit=${limit}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch articles");
      }
      return res.json();
    },
  });

  const articles = data?.articles || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Sync state with URL on popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
      setActiveCategory(getCategoryFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle category change - reset page and update URL
  const handleCategoryChange = (category: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url.toString());
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Featured logic is tricky with server-side pagination.
  // Ideally, featured articles should be a separate API call or handled differently.
  // For now, we will display articles as returned by server.
  // If we want featured at top, server should sort by featured first. 
  // (Current server sort is by date desc)

  // Library specific view
  const isLibrary = activeCategory === "library";

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (showEllipsisStart) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (showEllipsisEnd) pages.push('ellipsis');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return (
      <Pagination className="mt-12">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page, idx) =>
            page === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "column": return FileText;
      case "media": return Video;
      case "notice": return Bell;
      default: return FileText;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "column": return "칼럼";
      case "media": return "미디어";
      case "notice": return "알림";
      case "library": return "자료실";
      default: return category;
    }
  };

  return (
    <div className="min-h-screen" data-testid="page-insight">
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-card" data-testid="section-insight-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Insight
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                지식 & 미디어
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                사회주택, 도시재생, 공동체적 삶에 대한 아이부키의 생각과 이야기를 공유합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className="rounded-full"
                  data-testid={`filter-category-${category.id}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {isError ? (
          <section className="py-12 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                <Button variant="outline" onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            </div>
          </section>
        ) : isLoading ? (
          <section className="py-12 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[16/9] w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Library View */}
            {isLibrary && (
              <section className="py-12 bg-background" data-testid="section-library">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-foreground mb-8">자료실</h2>
                  {articles.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground">등록된 자료가 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                          <Card
                            key={article.id}
                            className="overflow-hidden hover-elevate h-full flex flex-col"
                            data-testid={`library-item-${article.id}`}
                          >
                            <Link
                              href={`/insight/${article.id}`}
                              className="block flex-1"
                            >
                              <div className="aspect-[16/9] overflow-hidden">
                                {article.imageUrl ? (
                                  <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <FileText className="w-12 h-12 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <Badge variant="secondary">자료실</Badge>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                                  {article.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                  {article.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{article.author}</span>
                                  {article.publishedAt && (
                                    <span>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                            {article.fileUrl && (
                              <div className="px-5 pb-5 pt-0">
                                <a
                                  href={article.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button size="sm" variant="outline" className="w-full gap-2">
                                    <Download className="w-4 h-4" />
                                    PDF 다운로드
                                  </Button>
                                </a>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                      {renderPagination()}
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Standard Article View */}
            {!isLibrary && (
              <section className="py-12 bg-background" data-testid="section-articles">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {activeCategory === "all" && <h2 className="text-2xl font-bold text-foreground mb-8">모든 글</h2>}
                  {articles.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground">
                        등록된 게시글이 없습니다.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => {
                          const CategoryIcon = getCategoryIcon(article.category);
                          return (
                            <Link
                              key={article.id}
                              href={`/insight/${article.id}`}
                              className="block h-full"
                            >
                              <Card
                                className="overflow-hidden hover-card-strong cursor-pointer h-full transition-all duration-300"
                                data-testid={`article-${article.id}`}
                              >
                                <div className="aspect-[16/9] overflow-hidden relative group">
                                  {article.imageUrl ? (
                                    <>
                                      <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </>
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                      <CategoryIcon className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-6">
                                  <div className="flex items-center gap-2 mb-3">
                                    <CategoryIcon className="w-4 h-4 text-primary" />
                                    <Badge variant="secondary" className="bg-secondary/50">
                                      {getCategoryLabel(article.category)}
                                    </Badge>
                                  </div>
                                  <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                    {article.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                    {article.excerpt}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                                    <span>{article.author}</span>
                                    {article.publishedAt && (
                                      <span>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</span>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          );
                        })}
                      </div>
                      {renderPagination()}
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
