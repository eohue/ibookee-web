

import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import MissionSection from "@/components/home/MissionSection";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ReporterPreview from "@/components/home/ReporterPreview";
import CommunityPreview from "@/components/home/CommunityPreview";
import StatsSection from "@/components/home/StatsSection";
import CTASection from "@/components/home/CTASection";
import type { Project, ResidentReporter } from "@shared/schema";
import type { CompanyStats } from "@/hooks/use-site-settings";

interface HomeData {
  projects: Project[];
  reporters: ResidentReporter[];
  stats: CompanyStats | null;
}

export default function Home() {
  const { data, isLoading } = useQuery<HomeData>({
    queryKey: ["/api/home"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="min-h-screen" data-testid="page-home">
      <Header />
      <main>
        <HeroSection />
        <MissionSection />

        {/* Pass fetched data to avoid waterfall requests */}
        <FeaturedProjects
          projects={data?.projects}
          isLoading={isLoading}
        />

        <ReporterPreview
          articles={data?.reporters}
          isLoading={isLoading}
        />

        <CommunityPreview />

        <StatsSection
          stats={data?.stats}
          isLoading={isLoading}
        />

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
