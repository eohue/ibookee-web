import { Link } from "wouter";
import { ArrowRight, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const communityPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 42,
    comments: 8,
    hashtag: "#요리클래스",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 67,
    comments: 12,
    hashtag: "#커뮤니티파티",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 35,
    comments: 5,
    hashtag: "#텃밭가꾸기",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 89,
    comments: 23,
    hashtag: "#플리마켓",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 54,
    comments: 9,
    hashtag: "#독서모임",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 78,
    comments: 15,
    hashtag: "#요가클래스",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 93,
    comments: 19,
    hashtag: "#영화모임",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    likes: 61,
    comments: 11,
    hashtag: "#공유주방",
  },
];

export default function CommunityPreview() {
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
          {communityPosts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
              data-testid={`card-community-${post.id}`}
            >
              <img
                src={post.image}
                alt={post.hashtag}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4 text-white mb-2">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
                <span className="text-white/90 text-sm font-medium">{post.hashtag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
