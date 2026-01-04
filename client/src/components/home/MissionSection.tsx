import { Home, Users, Heart, Building2 } from "lucide-react";

const values = [
  {
    icon: Home,
    title: "Space to Life",
    description: "공간이 단순한 거주지를 넘어 삶의 질을 높이는 플랫폼이 됩니다.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "이웃과 함께 성장하는 커뮤니티 중심의 주거 문화를 만듭니다.",
  },
  {
    icon: Heart,
    title: "Affordable Living",
    description: "누구나 존엄하게 살 수 있는 합리적인 주거 솔루션을 제공합니다.",
  },
  {
    icon: Building2,
    title: "Sustainable Design",
    description: "환경과 미래 세대를 생각하는 지속가능한 건축을 추구합니다.",
  },
];

export default function MissionSection() {
  return (
    <section className="py-20 md:py-24 bg-background" data-testid="section-mission">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
            Our Mission
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            "지속 가능한 도시를 만드는<br />
            소셜 임팩트 솔루션"
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            단순한 주거 공급을 넘어, 지역 사회의 앵커가 되어
            상생하는 로컬 생태계를 구축합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="text-center p-6 rounded-lg bg-card border border-border shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300"
              data-testid={`card-value-${index}`}
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
                <value.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
