import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Video, Download, ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "all", label: "전체" },
  { id: "column", label: "칼럼" },
  { id: "media", label: "미디어" },
  { id: "library", label: "자료실" },
];

const articles = [
  {
    id: 1,
    title: "사회주택, 왜 지금 한국에 필요한가",
    excerpt: "오스트리아 빈의 사회주택 모델과 한국적 적용 방안에 대한 고찰. 공공성과 수익성의 균형점을 찾아서.",
    author: "김아이 대표",
    category: "column",
    date: "2025-04-15",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    id: 2,
    title: "청년 주거 문제, 커뮤니티가 답이다",
    excerpt: "혼자가 아닌 함께의 가치. 안암생활 입주민들의 이야기를 통해 본 커뮤니티 주거의 가능성.",
    author: "박운영 팀장",
    category: "column",
    date: "2025-03-28",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    id: 3,
    title: "[KBS 뉴스] 아이부키, 사회주택의 새로운 모델 제시",
    excerpt: "KBS 뉴스 취재 영상. 아이부키의 사회주택 모델과 입주민 인터뷰.",
    author: "KBS",
    category: "media",
    date: "2025-02-10",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: 4,
    title: "ESG 경영과 사회주택",
    excerpt: "환경, 사회, 거버넌스 측면에서 바라본 사회주택의 가치와 아이부키의 ESG 경영 전략.",
    author: "이전략 이사",
    category: "column",
    date: "2025-01-22",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: 5,
    title: "[MBC 경제매거진] 투자와 사회적 가치의 균형",
    excerpt: "MBC 경제매거진에서 다룬 아이부키의 비즈니스 모델과 투자 수익성 분석.",
    author: "MBC",
    category: "media",
    date: "2025-01-15",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: 6,
    title: "도시재생과 앵커 시설의 역할",
    excerpt: "장안생활 사례로 본 도시재생형 사회주택의 지역 거점 기능과 효과.",
    author: "최개발 실장",
    category: "column",
    date: "2024-12-18",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
];

const libraryItems = [
  {
    id: 1,
    title: "아이부키 회사 소개서 2025",
    type: "PDF",
    size: "4.2MB",
  },
  {
    id: 2,
    title: "사회주택 사업 안내서",
    type: "PDF",
    size: "8.1MB",
  },
  {
    id: 3,
    title: "ESG 경영 보고서 2024",
    type: "PDF",
    size: "12.3MB",
  },
  {
    id: 4,
    title: "안암생활 프로젝트 백서",
    type: "PDF",
    size: "15.7MB",
  },
];

export default function Insight() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = activeCategory === "all" || activeCategory === "library"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featuredArticles = articles.filter((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "column":
        return FileText;
      case "media":
        return Video;
      default:
        return FileText;
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
                  onClick={() => setActiveCategory(category.id)}
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
            {activeCategory === "all" && featuredArticles.length > 0 && (
              <section className="py-12 bg-background" data-testid="section-featured-articles">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-foreground mb-8">주요 기사</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {featuredArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="overflow-hidden hover-elevate cursor-pointer"
                        data-testid={`featured-article-${article.id}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2">
                          <div className="aspect-[4/3] md:aspect-auto">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-6 flex flex-col justify-between">
                            <div>
                              <Badge variant="secondary" className="mb-3">
                                {article.category === "column" ? "칼럼" : "미디어"}
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
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(article.date).toLocaleDateString("ko-KR")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="py-12 bg-background" data-testid="section-articles">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {activeCategory === "all" && <h2 className="text-2xl font-bold text-foreground mb-8">최신 글</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(activeCategory === "all" ? regularArticles : filteredArticles).map((article) => {
                    const CategoryIcon = getCategoryIcon(article.category);
                    return (
                      <Card
                        key={article.id}
                        className="overflow-hidden hover-elevate cursor-pointer"
                        data-testid={`article-${article.id}`}
                      >
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <CategoryIcon className="w-4 h-4 text-primary" />
                            <Badge variant="secondary">
                              {article.category === "column" ? "칼럼" : "미디어"}
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
                            <span>{new Date(article.date).toLocaleDateString("ko-KR")}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {activeCategory === "library" && (
          <section className="py-12 bg-background" data-testid="section-library">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">자료실</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {libraryItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-5 flex items-center justify-between hover-elevate"
                    data-testid={`library-item-${item.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.type} · {item.size}
                        </p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" data-testid={`download-${item.id}`}>
                      <Download className="w-5 h-5" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
