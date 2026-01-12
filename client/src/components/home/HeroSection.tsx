import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageImages } from "@/hooks/use-site-settings";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSection() {
  const { getImageList } = usePageImages();
  const apiImages = getImageList("home", "hero");

  // Default hardcoded images
  const defaultImages = [
    { imageUrl: "/images/home-hero/hero-1.jpg" },
    { imageUrl: "/images/home-hero/hero-2.jpg" },
    { imageUrl: "/images/home-hero/hero-3.jpg" },
    { imageUrl: "/images/home-hero/hero-4.jpg" },
    { imageUrl: "/images/home-hero/hero-5.jpg" },
  ];

  const heroImages = apiImages.length > 0 ? apiImages : defaultImages;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden"
      data-testid="section-hero"
    >
      <AnimatePresence mode="popLayout">
        {heroImages.length > 0 ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${heroImages[currentIndex].imageUrl}')`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/80 text-sm md:text-base font-medium tracking-widest uppercase mb-4 md:mb-6">
            Social Housing Designer
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 md:mb-8">
            공간을 짓고,<br />
            삶을 잇다
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto">
            아이부키는 단순한 주거 공간을 넘어,<br className="hidden sm:block" />
            사람들이 연결되고 성장하는 커뮤니티를 디자인합니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/space">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-semibold rounded-full bg-white text-foreground hover:bg-white/90"
                data-testid="button-explore-projects"
              >
                프로젝트 둘러보기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base font-semibold rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                data-testid="button-about-us"
              >
                <Play className="w-5 h-5 mr-2" />
                아이부키 소개
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-white/40" />
        </div>
      </div>
    </section>
  );
}
