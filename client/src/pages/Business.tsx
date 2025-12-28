import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";
import { ArrowRight, Building2, Leaf, Users, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const solutions = [
  {
    id: "purchase-agreement",
    title: "매입약정형",
    titleEn: "Purchase Agreement",
    description: "LH, SH 등 공공기관이 준공 후 매입을 약정하여 자산 경량화 및 안정적 운영이 가능한 모델",
    features: [
      "준공 후 공공기관 매입 확정",
      "자산 리스크 최소화",
      "장기 운영위탁 계약",
      "안정적 수익 구조",
    ],
    case: {
      name: "안암생활",
      location: "서울 성북구",
      units: 86,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "land-lease",
    title: "토지임대부",
    titleEn: "Land Lease",
    description: "공공 토지를 장기 임대하여 토지비 부담을 줄이고 합리적인 임대료를 제공하는 모델",
    features: [
      "토지비 절감 (최대 40%)",
      "합리적 임대료 책정",
      "장기 안정적 사업 운영",
      "공공-민간 협력 모델",
    ],
    case: {
      name: "홍시주택",
      location: "서울 마포구",
      units: 45,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "urban-regeneration",
    title: "도시재생형",
    titleEn: "Urban Regeneration",
    description: "노후 지역의 거점 시설로서 주거와 커뮤니티 공간을 결합한 앵커 시설 개발 모델",
    features: [
      "지역 거점 시설 개발",
      "주거+상업+커뮤니티 복합",
      "도시재생 활성화 기여",
      "지역경제 순환 구조",
    ],
    case: {
      name: "장안생활",
      location: "서울 동대문구",
      units: 120,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  },
];

const esgMetrics = [
  {
    category: "Environment",
    icon: Leaf,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    metrics: [
      { label: "친환경 인증", value: "100%", desc: "전 프로젝트" },
      { label: "태양광 설비", value: "15+", desc: "설치 프로젝트" },
      { label: "에너지 절감", value: "30%", desc: "평균 절감률" },
    ],
  },
  {
    category: "Social",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    metrics: [
      { label: "소셜믹스", value: "40%", desc: "사회 배려계층" },
      { label: "커뮤니티 프로그램", value: "500+", desc: "연간 운영" },
      { label: "입주민 만족도", value: "94%", desc: "평균 만족도" },
    ],
  },
  {
    category: "Governance",
    icon: Shield,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    metrics: [
      { label: "투명 경영", value: "A+", desc: "경영 평가" },
      { label: "사회적기업", value: "인증", desc: "고용노동부" },
      { label: "윤리경영", value: "선언", desc: "ESG 위원회" },
    ],
  },
];

export default function Business() {
  return (
    <div className="min-h-screen" data-testid="page-business">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-card" data-testid="section-business-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Business
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                공공성과 수익성의<br />
                새로운 균형
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                아이부키는 공공-민간 협력을 통해 지속가능한 소셜 하우징 모델을 구축합니다.
                검증된 사업 역량과 운영 노하우로 안정적인 투자 수익을 제공합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background" data-testid="section-overview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Our Model
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                제3의 섹터, 소셜 하우징
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                공공주택의 안정성과 민간주택의 효율성을 결합한 새로운 주거 모델
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Public</h3>
                  <p className="text-sm text-muted-foreground">
                    공공의 지원과 정책적 안정성
                  </p>
                </Card>
                <Card className="p-6 text-center border-primary border-2">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">Social Housing</h3>
                  <p className="text-sm text-muted-foreground">
                    공공성 + 수익성의 균형점
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Private</h3>
                  <p className="text-sm text-muted-foreground">
                    민간의 효율성과 창의성
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card" data-testid="section-solutions">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Development Solutions
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                맞춤형 개발 솔루션
              </h2>
            </div>

            <div className="space-y-16">
              {solutions.map((solution, index) => (
                <div
                  key={solution.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                  data-testid={`solution-${solution.id}`}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                      {solution.titleEn}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {solution.title}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      {solution.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {solution.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Card className="p-4 bg-background">
                      <div className="flex items-center gap-4">
                        <img
                          src={solution.case.image}
                          alt={solution.case.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Case Study
                          </p>
                          <h4 className="font-semibold text-foreground">{solution.case.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {solution.case.location} · {solution.case.units}세대
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <img
                      src={solution.case.image}
                      alt={solution.title}
                      className="rounded-lg w-full aspect-[4/3] object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background" data-testid="section-esg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                ESG Performance
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                지속가능한 가치 창출
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                환경, 사회, 거버넌스 모든 영역에서 측정 가능한 성과를 만들어갑니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {esgMetrics.map((category) => (
                <Card
                  key={category.category}
                  className="p-6"
                  data-testid={`esg-${category.category.toLowerCase()}`}
                >
                  <div className={`w-12 h-12 rounded-full ${category.bgColor} flex items-center justify-center mb-4`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.metrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{metric.label}</p>
                          <p className="text-xs text-muted-foreground">{metric.desc}</p>
                        </div>
                        <span className={`text-2xl font-bold ${category.color}`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary" data-testid="section-business-cta">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              함께 만들어갈 파트너를 찾습니다
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              토지주, 건물주, 공공기관, 투자자 여러분의 제안을 기다립니다.
              아이부키와 함께 지속가능한 가치를 창출해보세요.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-semibold rounded-full bg-white text-primary hover:bg-white/90"
                data-testid="button-business-contact"
              >
                제휴 문의하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
