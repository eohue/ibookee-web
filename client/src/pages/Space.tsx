import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Grid3X3, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "all", label: "전체", labelEn: "All" },
  { id: "youth", label: "청년 & 창업", labelEn: "Youth & Startup" },
  { id: "single", label: "1인가구 & 여성", labelEn: "Single & Women" },
  { id: "social-mix", label: "소셜믹스", labelEn: "Social Mix" },
  { id: "local-anchor", label: "로컬 앵커", labelEn: "Local Anchor" },
];

const projects = [
  {
    id: 1,
    title: "안암생활",
    titleEn: "Anam Life",
    location: "서울 성북구",
    category: "youth",
    description: "청년 특화 주거 공간으로, 코워킹 스페이스와 창업 지원 프로그램을 갖춘 대규모 커뮤니티",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 86,
    year: 2022,
    featured: true,
  },
  {
    id: 2,
    title: "홍시주택",
    titleEn: "Hongsi House",
    location: "서울 마포구",
    category: "single",
    description: "1인 여성 가구를 위한 안전하고 편리한 주거 공간, 셰어키친과 라운지 완비",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 45,
    year: 2021,
    featured: true,
  },
  {
    id: 3,
    title: "장안생활",
    titleEn: "Jangan Life",
    location: "서울 동대문구",
    category: "local-anchor",
    description: "도시재생형 복합 주거 시설로, 지역 상권과 연계된 커뮤니티 앵커 역할",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 120,
    year: 2023,
    featured: true,
  },
  {
    id: 4,
    title: "보린주택",
    titleEn: "Borin House",
    location: "서울 은평구",
    category: "social-mix",
    description: "장애인과 비장애인이 함께 어우러져 사는 소셜믹스 커뮤니티",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 32,
    year: 2014,
    featured: false,
  },
  {
    id: 5,
    title: "청춘주택",
    titleEn: "Youth House",
    location: "서울 마포구",
    category: "youth",
    description: "대학가 인근 청년 주거 공간, 스터디룸과 공유 라운지 완비",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 54,
    year: 2019,
    featured: false,
  },
  {
    id: 6,
    title: "나눔하우스",
    titleEn: "Sharing House",
    location: "경기 고양시",
    category: "social-mix",
    description: "다양한 세대가 어우러지는 세대통합형 주거 모델",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 78,
    year: 2020,
    featured: false,
  },
  {
    id: 7,
    title: "동행주택",
    titleEn: "Together House",
    location: "인천 연수구",
    category: "single",
    description: "직장인 1인 가구를 위한 편리한 역세권 주거 공간",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 62,
    year: 2021,
    featured: false,
  },
  {
    id: 8,
    title: "마을생활",
    titleEn: "Village Life",
    location: "서울 노원구",
    category: "local-anchor",
    description: "지역 주민과 입주민이 함께하는 마을 커뮤니티 센터 겸 주거 시설",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 95,
    year: 2022,
    featured: false,
  },
  {
    id: 9,
    title: "희망타운",
    titleEn: "Hope Town",
    location: "경기 수원시",
    category: "youth",
    description: "청년 창업가를 위한 오피스텔형 주거 공간, 1층 공유 오피스",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 48,
    year: 2023,
    featured: false,
  },
];

export default function Space() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

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
                아이부키가 만든 공간들을 둘러보세요. 각 프로젝트는 입주민의 필요와 지역의 특성을 반영하여 설계되었습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="sticky top-16 md:top-20 z-40 bg-background border-b border-border py-4" data-testid="section-filter">
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

        <section className="py-12 bg-background" data-testid="section-projects">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group overflow-hidden rounded-lg bg-card border border-border hover-elevate cursor-pointer"
                    data-testid={`card-project-${project.id}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                          {getCategoryLabel(project.category)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white">{project.title}</h3>
                        <p className="text-white/80 text-sm">{project.titleEn}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{project.year}년 준공</span>
                        <span className="font-medium text-foreground">{project.units}세대</span>
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
                    갤러리 뷰에서 프로젝트를 확인해주세요.
                  </p>
                </div>
              </div>
            )}

            {filteredProjects.length === 0 && (
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
