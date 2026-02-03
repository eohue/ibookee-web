import { Building, Users, Calendar, Award } from "lucide-react";
import { defaultStats, type CompanyStats } from "@/hooks/use-site-settings";

interface StatsSectionProps {
  stats?: CompanyStats | null;
  isLoading: boolean;
}

export default function StatsSection({ stats: propStats, isLoading }: StatsSectionProps) {
  const stats = propStats || defaultStats;

  const statItems = [
    {
      icon: Building,
      value: stats.projectCount.value,
      label: stats.projectCount.label,
    },
    {
      icon: Users,
      value: stats.householdCount.value,
      label: stats.householdCount.label,
    },
    {
      icon: Calendar,
      value: stats.yearsInBusiness.value,
      label: stats.yearsInBusiness.label,
    },
    {
      icon: Award,
      value: stats.awardCount.value,
      label: stats.awardCount.label,
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-primary" data-testid="section-stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              data-testid={`stat-${index}`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {isLoading ? "..." : stat.value}
              </div>
              <div className="text-lg font-medium text-white mb-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
