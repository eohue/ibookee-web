import { Building, Users, Calendar, Award } from "lucide-react";

const stats = [
  {
    icon: Building,
    value: "32+",
    label: "완공 프로젝트",
    description: "Projects Completed",
  },
  {
    icon: Users,
    value: "2,500+",
    label: "입주 세대",
    description: "Households",
  },
  {
    icon: Calendar,
    value: "13년",
    label: "업력",
    description: "Years of Experience",
  },
  {
    icon: Award,
    value: "15+",
    label: "수상 실적",
    description: "Awards",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 md:py-24 bg-primary" data-testid="section-stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              data-testid={`stat-${index}`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-medium text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-white/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
