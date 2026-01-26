import { Link } from "wouter";
import { ArrowRight, Heart, MessageCircle, Calendar, Users, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { CommunityFeedItem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function CommunityPreview() {
  const { data: feedData, isLoading } = useQuery<CommunityFeedItem[]>({
    queryKey: ["/api/community-feed", { limit: 8 }],
    queryFn: async () => {
      const res = await fetch("/api/community-feed?limit=8");
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
  });

  const posts = feedData || [];

  return (
    <section className="py-20 md:py-24 bg-background" data-testid="section-community-preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">
              Ibookee Life
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              함께 만들어가는 일상
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              아이부키 입주민들의 생생한 커뮤니티 활동을 만나보세요.
            </p>
          </div>
          <Link href="/community">
            <Button variant="outline" className="group" data-testid="button-view-all-community">
              커뮤니티 더보기
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))
          ) : posts.slice(0, 8).map((item) => (
            <Link key={item.id} href={`/community`}>
              <div
                className="group relative aspect-square overflow-hidden rounded-lg glass-interactive cursor-pointer"
                data-testid={`card-community-${item.id}`}
              >
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                  alt={item.title || "Community Post"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />

                {/* Type Badge */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white">
                    {item.type === 'social' ? '소셜' : item.type === 'program' ? '프로그램' : item.type === 'reporter' ? '안암리포트' : '행사'}
                  </Badge>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                  {item.type === 'social' ? (
                    <>
                      <div className="flex items-center gap-4 text-white mb-2">
                        <div className="flex items-center gap-1">
                          <Heart className="w-5 h-5 fill-white" />
                          <span className="font-medium">{item.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">{item.comments || 0}</span>
                        </div>
                      </div>
                      {item.hashtags && item.hashtags.length > 0 && (
                        <span className="text-white/90 text-sm font-medium line-clamp-1">#{item.hashtags[0]}</span>
                      )}
                    </>
                  ) : item.type === 'reporter' ? (
                    <div className="text-white flex flex-col items-center gap-2">
                      <Newspaper className="w-8 h-8 mb-1" />
                      <h3 className="font-bold line-clamp-2 text-sm md:text-base leading-tight px-2">{item.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/90 mt-1">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white flex flex-col items-center gap-2">
                      {item.type === 'program' ? <Users className="w-8 h-8 mb-1" /> : <Calendar className="w-8 h-8 mb-1" />}
                      <h3 className="font-bold line-clamp-2 text-sm md:text-base leading-tight">{item.title}</h3>
                      <span className="text-xs text-white/80">
                        {item.date ? new Date(item.date).toLocaleDateString() : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
