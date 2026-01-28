import { useState, useEffect, useMemo } from "react";
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

  // Shuffle images on mount
  const heroImages = useMemo(() => {
    const images = [...(apiImages.length > 0 ? apiImages : defaultImages)];
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }
    return images;
  }, [apiImages]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages]);

  return (
    <section
      className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black"
      data-testid="section-hero"
    >
      <AnimatePresence mode="popLayout">
        {heroImages.length > 0 ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${heroImages[currentIndex].imageUrl}')`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-8 md:mb-10 tracking-tight">
              공간을 짓고,<br />
              <span className="text-primary/90">삶</span>을 잇다
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-lg md:text-2xl text-white/90 leading-relaxed mb-10 md:mb-14 max-w-2xl mx-auto font-light"
          >
            아이부키는 단순한 주거 공간을 넘어,<br className="hidden sm:block" />
            사람들이 연결되고 성장하는 <b className="font-semibold">커뮤니티</b>를 디자인합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link href="/space" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-7 py-5 text-[15px] font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                data-testid="button-explore-projects"
              >
                프로젝트 둘러보기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-7 py-5 text-[15px] font-semibold rounded-full border-white/30 text-white bg-white/5 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all"
                data-testid="button-about-us"
              >
                <Play className="w-5 h-5 mr-2" />
                아이부키 소개
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex flex-col items-center gap-3 text-white/50 animate-bounce"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
