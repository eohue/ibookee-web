import { Link } from "wouter";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const featuredProjects = [
  {
    id: 1,
    title: "안암생활",
    titleEn: "Anam Life",
    location: "서울 성북구",
    category: "청년주택",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 86,
    year: 2022,
  },
  {
    id: 2,
    title: "홍시주택",
    titleEn: "Hongsi House",
    location: "서울 마포구",
    category: "토지임대부",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 45,
    year: 2021,
  },
  {
    id: 3,
    title: "장안생활",
    titleEn: "Jangan Life",
    location: "서울 동대문구",
    category: "도시재생",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    units: 120,
    year: 2023,
  },
];

export default function FeaturedProjects() {
  return (
    <section className="py-20 md:py-24 bg-card" data-testid="section-featured-projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">
              Featured Projects
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              공간에 삶을 담다
            </h2>
          </div>
          <Link href="/space">
            <Button variant="outline" className="group" data-testid="button-view-all-projects">
              전체 프로젝트 보기
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/space`}
              className="group block overflow-hidden rounded-lg bg-background border border-border hover-elevate"
              data-testid={`card-project-${project.id}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full mb-2">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold text-white">{project.title}</h3>
                  <p className="text-white/80 text-sm">{project.titleEn}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{project.year}년 준공</span>
                  <span className="font-medium text-foreground">{project.units}세대</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
