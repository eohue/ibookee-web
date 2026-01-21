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

const ITEMS_PER_PAGE = 9;

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

  const { data: articles = [], isLoading, isError, refetch } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

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

  const filteredArticles = activeCategory === "all" || activeCategory === "library"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featuredArticles = articles.filter((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  const libraryDisplayArticles = activeCategory === "library"
    ? filteredArticles.filter((a) => a.fileUrl && a.fileUrl.trim() !== "")
    : [];

  // Pagination logic
  const articlesToDisplay = activeCategory === "all" ? regularArticles : filteredArticles;
  const totalPages = Math.ceil(articlesToDisplay.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = articlesToDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Library pagination
  const libraryTotalPages = Math.ceil(libraryDisplayArticles.length / ITEMS_PER_PAGE);
  const libraryStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLibraryArticles = libraryDisplayArticles.slice(libraryStartIndex, libraryStartIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = (total: number) => {
    if (total <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < total - 2;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (showEllipsisStart) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(total - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (showEllipsisEnd) pages.push('ellipsis');
      if (!pages.includes(total)) pages.push(total);
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
              onClick={() => currentPage < total && handlePageChange(currentPage + 1)}
              className={currentPage === total ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "column":
        return FileText;
      case "media":
        return Video;
      case "notice":
        return Bell;
      default:
        return FileText;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "column":
        return "칼럼";
      case "media":
        return "미디어";
      case "notice":
        return "알림";
      case "library":
        return "자료실";
      default:
        return category;
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

        <section className="sticky top-16 md:top-20 z-40 bg-background border-b border-border py-4">
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

        {activeCategory !== "library" && (
          <>
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
                  <Skeleton className="h-8 w-32 mb-8" />
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
                {activeCategory === "all" && featuredArticles.length > 0 && (
                  <section className="py-12 bg-background" data-testid="section-featured-articles">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-2xl font-bold text-foreground mb-8">주요 기사</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {featuredArticles.map((article) => (
                          <Link
                            key={article.id}
                            href={`/insight/${article.id}`}
                            className="block"
                          >
                            <Card
                              className="overflow-hidden hover-elevate cursor-pointer h-full"
                              data-testid={`featured-article-${article.id}`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="aspect-[4/3] md:aspect-auto">
                                  {article.imageUrl ? (
                                    <img
                                      src={article.imageUrl}
                                      alt={article.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                      <FileText className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-6 flex flex-col justify-between">
                                  <div>
                                    <Badge variant="secondary" className="mb-3">
                                      {getCategoryLabel(article.category)}
                                    </Badge>
                                    <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                                      {article.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                      {article.excerpt}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      <span>{article.author}</span>
                                    </div>
                                    {article.publishedAt && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className="py-12 bg-background" data-testid="section-articles">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {activeCategory === "all" && <h2 className="text-2xl font-bold text-foreground mb-8">최신 글</h2>}
                    {paginatedArticles.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="text-muted-foreground">
                          등록된 게시글이 없습니다.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {paginatedArticles.map((article) => {
                            const CategoryIcon = getCategoryIcon(article.category);
                            return (
                              <Link
                                key={article.id}
                                href={`/insight/${article.id}`}
                                className="block"
                              >
                                <Card
                                  className="overflow-hidden hover-elevate cursor-pointer h-full"
                                  data-testid={`article-${article.id}`}
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
                                        <CategoryIcon className="w-12 h-12 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                      <CategoryIcon className="w-4 h-4 text-primary" />
                                      <Badge variant="secondary">
                                        {getCategoryLabel(article.category)}
                                      </Badge>
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
                                </Card>
                              </Link>
                            );
                          })}
                        </div>
                        {renderPagination(totalPages)}
                      </>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {activeCategory === "library" && (
          <section className="py-12 bg-background" data-testid="section-library">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">자료실</h2>
              {libraryDisplayArticles.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">등록된 자료가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedLibraryArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="p-5 flex items-center justify-between hover-elevate transition-all"
                        data-testid={`library-item-${article.id}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-foreground truncate pr-4">{article.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {article.author} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("ko-KR") : ""}
                            </p>
                          </div>
                        </div>
                        {article.fileUrl ? (
                          <a href={article.fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="hover:text-primary hover:bg-primary/10" data-testid={`download-${article.id}`}>
                              <Download className="w-5 h-5" />
                            </Button>
                          </a>
                        ) : (
                          <Button size="icon" variant="ghost" disabled title="파일 없음">
                            <Download className="w-5 h-5 opacity-30" />
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                  {renderPagination(libraryTotalPages)}
                </>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
