import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Building2, Users, Award, Target, ChevronRight } from "lucide-react";
import { useCompanyStats, usePageImages } from "@/hooks/use-site-settings";
import type { HistoryMilestone, Partner } from "@shared/schema";

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

const defaultPartners = [
  { name: "국토교통부", category: "정부" },
  { name: "LH 한국토지주택공사", category: "공공기관" },
  { name: "HUG 주택도시보증공사", category: "공공기관" },
  { name: "서울시", category: "지자체" },
  { name: "경기도", category: "지자체" },
  { name: "KB국민은행", category: "금융" },
  { name: "신한은행", category: "금융" },
  { name: "우리은행", category: "금융" },
];

export default function About() {
  const { stats } = useCompanyStats();
  const { getImageUrl } = usePageImages();
  
  const { data: historyData } = useQuery<HistoryMilestone[]>({
    queryKey: ["/api/history"],
    staleTime: 60000,
  });

  const { data: partnersData } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
    staleTime: 60000,
  });

  const historyMilestones = historyData && historyData.length > 0 
    ? historyData.map(m => ({ year: m.year, title: m.title, description: m.description || "" }))
    : defaultHistoryMilestones;

  const partners = partnersData && partnersData.length > 0
    ? partnersData.map(p => ({ name: p.name, category: p.category }))
    : defaultPartners;

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
                아이부키는 '공간을 통해 삶을 디자인하는(Space to Life)' 소셜 하우징 플랫폼 기업입니다.
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
                  "가난한 자를 위한 주택은<br />
                  가난해 보여서는 안 된다"
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    오스트리아 빈에서 처음 사회주택을 접했을 때, 저는 깊은 감명을 받았습니다.
                    사회주택이 빈민을 위한 시혜가 아닌, 모든 시민이 존엄하게 살 권리를 보장하는
                    공공 인프라라는 사실을요.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    한국에 돌아와 아이부키를 설립하면서, 저는 이 철학을 한국적으로 재해석하고자 했습니다.
                    공공성과 수익성이 양립할 수 있다는 것, 좋은 주거 환경이 개인의 삶뿐만 아니라
                    지역사회 전체를 변화시킬 수 있다는 것을 증명하고 싶었습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    지난 13년간 32개 프로젝트, 2,500세대를 거쳐오면서 우리는 그 가능성을 확인했습니다.
                    아이부키의 커뮤니티에서 이웃이 된 청년들이 창업을 하고, 가족을 이루고,
                    다시 지역사회에 기여하는 선순환을 목격했습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    앞으로도 아이부키는 '공간을 짓고, 삶을 잇는' 사명을 이어가겠습니다.
                    더 많은 분들이 존엄한 주거를 누릴 수 있도록, 한국형 소셜 하우징의 새로운 길을 열어가겠습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background" data-testid="section-history">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                History
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                The First Mover의 여정
              </h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
              <div className="space-y-8 md:space-y-0">
                {historyMilestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative md:flex items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                    data-testid={`milestone-${milestone.year}`}
                  >
                    <div className="md:w-1/2 md:px-8">
                      <div
                        className={`bg-card rounded-lg p-6 border border-border ${
                          index % 2 === 0 ? "md:text-right" : "md:text-left"
                        }`}
                      >
                        <span className="text-primary font-bold text-2xl">{milestone.year}</span>
                        <h3 className="text-lg font-semibold text-foreground mt-2">{milestone.title}</h3>
                        <p className="text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div className="md:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {partners.map((partner, index) => (
                <div
                  key={partner.name}
                  className="bg-background rounded-lg p-6 text-center border border-border"
                  data-testid={`partner-${index}`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{partner.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{partner.category}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
