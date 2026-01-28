import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Building2, Users, Award, Target, ChevronRight } from "lucide-react";
import { useCompanyStats, usePageImages } from "@/hooks/use-site-settings";
import type { HistoryMilestone, Project } from "@shared/schema";

const defaultHistoryMilestones = [
  { year: 2012, title: "아이부키 설립", description: "사회주택 전문기업으로 첫 발을 내딛다" },
  { year: 2014, title: "보린주택 준공", description: "첫 번째 사회주택 프로젝트 완공" },
  { year: 2016, title: "LH 매입약정 1호", description: "공공-민간 협력 모델 구축" },
  { year: 2018, title: "토지임대부 사업 착수", description: "토지비 절감 신모델 도입" },
  { year: 2020, title: "1,000세대 돌파", description: "누적 입주 세대 1,000가구 달성" },
  { year: 2022, title: "안암생활 오픈", description: "청년 특화 대규모 커뮤니티 조성" },
  { year: 2023, title: "ESG 경영 선언", description: "지속가능한 주거 문화 선도" },
  { year: 2024, title: "2,500세대 달성", description: "누적 입주 세대 2,500가구 돌파" },
];

export default function About() {
  const { stats } = useCompanyStats();
  const { getImageUrl } = usePageImages();

  const { data: historyData } = useQuery<HistoryMilestone[]>({
    queryKey: ["/api/history"],
    staleTime: 60000,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 60000,
  });

  // Extract unique partner logos from projects
  // Extract unique partner logos from projects, filtering by filename
  // Fetch partners from the dedicated API
  const { data: partners } = useQuery<{ logoUrl: string; name: string }[]>({
    queryKey: ["/api/partners"],
    staleTime: 60000,
  });

  const partnerLogos = partners?.map(p => p.logoUrl).filter(Boolean) || [];

  const statsDisplay = [
    { icon: Building2, label: `${stats.projectCount.value} ${stats.projectCount.label}`, desc: "완공" },
    { icon: Users, label: `${stats.householdCount.value} ${stats.householdCount.label}`, desc: "입주" },
    { icon: Award, label: `${stats.awardCount.value} ${stats.awardCount.label}`, desc: "실적" },
    { icon: Target, label: `${stats.yearsInBusiness.value} ${stats.yearsInBusiness.label}`, desc: "업력" },
  ];

  return (
    <div className="min-h-screen" data-testid="page-about">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-card" data-testid="section-about-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                About Us
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                소셜 하우징<br />
                디자이너
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                아이부키는 '공간을 통해 삶을 디자인하는(Space to Life)' 소셜 하우징 플랫폼 기업입니다.<br />
                단순한 시공/임대 사업자를 넘어, 공공성과 수익성을 결합한 새로운 주거 모델을 만들어갑니다.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background" data-testid="section-who-we-are">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                  Who We Are
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  공간에 삶의 가치를<br />
                  더하는 사람들
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  아이부키는 2012년 설립 이래, 한국형 사회주택의 새로운 표준을 만들어왔습니다.
                  오스트리아 빈(Vienna)의 사회주택 철학을 한국적으로 재해석하여,
                  누구나 존엄하게 살 수 있는 주거 환경을 만듭니다.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {statsDisplay.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src={getImageUrl("about", "office")}
                  alt="아이부키 오피스"
                  className="rounded-lg w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card" data-testid="section-ceo-message">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <img
                  src={getImageUrl("about", "ceo")}
                  alt="CEO"
                  className="rounded-lg w-full max-w-md aspect-[3/4] object-cover"
                />
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-foreground">김아이</h3>
                  <p className="text-muted-foreground">대표이사 / CEO</p>
                </div>
              </div>
              <div>
                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                  CEO Message
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                  "주거는 상품이 아니라,<br />
                  지속 가능한 삶을 담는 그릇이어야 합니다."
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    오스트리아 빈의 사회주택 모델이 우리에게 준 교훈은 명확합니다.
                    주거는 시혜가 아닌 존엄이며, 가난한 자를 위한 주택일수록 더욱 품격 있게 디자인되어야 한다는 것입니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    아이부키는 지난 13년간 보린주택을 시작으로 안암생활, 장안생활에 이르기까지 한국형 사회주택의 새로운 표준을 제시해 왔습니다.
                    우리는 공공성(Affordability)과 수익성(Profitability)이 조화롭게 공존하는 '제3의 섹터' 모델을 통해,
                    부동산 시장의 새로운 대안을 증명해내고 있습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    단순히 물리적인 벽을 쌓는 것을 넘어, 사람과 사람이 연결되고 지역 사회가 다시 살아나는 '리빙 플랫폼'을 지향합니다.
                    아이부키가 가는 길이 우리나라 사회주택이 가는 길입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/60" data-testid="section-history">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
              <div className="md:w-1/4 flex-shrink-0">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">연혁</h2>
              </div>
              <div className="md:w-3/4 space-y-16">
                {Object.entries((historyData || [])
                  .reduce((acc, milestone) => {
                    const year = milestone.year;
                    if (!acc[year]) acc[year] = [];
                    acc[year].push(milestone);
                    return acc;
                  }, {} as Record<string, HistoryMilestone[]>))
                  .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                  .map(([year, milestones]) => (
                    <div key={year} className="flex flex-col md:flex-row gap-8 md:gap-16">
                      <div className="md:w-24 flex-shrink-0">
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{year}</span>
                      </div>
                      <div className="flex-grow space-y-4">
                        {milestones
                          .sort((a, b) => (b.month || "").localeCompare(a.month || "") || (b.displayOrder || 0) - (a.displayOrder || 0))
                          .map((milestone) => (
                            <div key={milestone.id} className="flex gap-4 md:gap-8 items-start">
                              <div className="w-12 pt-1 flex-shrink-0 text-foreground font-bold text-right md:text-left">
                                {milestone.month ? (milestone.month.endsWith('월') ? milestone.month : `${milestone.month}월`) : ""}
                              </div>
                              <div className="flex-grow pt-1">
                                {milestone.link ? (
                                  <a
                                    href={milestone.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary transition-colors hover:underline block"
                                  >
                                    {milestone.title}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">{milestone.title}</span>
                                )}
                                {milestone.description && (
                                  <p className="text-sm text-muted-foreground/80 mt-1">{milestone.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {partnerLogos.length > 0 && (
          <section className="py-20 bg-card" data-testid="section-partners">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                  Partners
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  신뢰할 수 있는 파트너
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
                {partnerLogos.map((logoUrl, index) => (
                  <div
                    key={index}
                    className="w-full max-w-[150px] aspect-[3/2] flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                    data-testid={`partner-logo-${index}`}
                  >
                    <img
                      src={logoUrl}
                      alt={`Partner ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div >
  );
}
