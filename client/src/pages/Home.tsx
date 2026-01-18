import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import MissionSection from "@/components/home/MissionSection";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ReporterPreview from "@/components/home/ReporterPreview";
import CommunityPreview from "@/components/home/CommunityPreview";
import StatsSection from "@/components/home/StatsSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen" data-testid="page-home">
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <FeaturedProjects />
        <ReporterPreview />
        <CommunityPreview />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
