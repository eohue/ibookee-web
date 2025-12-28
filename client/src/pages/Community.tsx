import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Heart, MessageCircle, Calendar, Users, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const hashtags = [
  { id: "all", label: "전체" },
  { id: "party", label: "#파티" },
  { id: "cooking", label: "#요리클래스" },
  { id: "hobby", label: "#소모임" },
  { id: "daily", label: "#입주민일상" },
  { id: "market", label: "#플리마켓" },
];

const communityPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "오늘의 요리 클래스! 입주민 분들과 함께 만든 파스타 🍝",
    location: "안암생활 공유주방",
    likes: 42,
    comments: 8,
    hashtag: "cooking",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "월간 입주민 파티! 새로 오신 분들 환영해요 🎉",
    location: "홍시주택 라운지",
    likes: 67,
    comments: 12,
    hashtag: "party",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "옥상 텃밭 가꾸기 클래스 진행했어요 🌱",
    location: "장안생활 옥상",
    likes: 35,
    comments: 5,
    hashtag: "hobby",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "봄맞이 플리마켓 성공적! 다음에 또 만나요 💕",
    location: "안암생활 1층 광장",
    likes: 89,
    comments: 23,
    hashtag: "market",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "독서모임 '책읽는밤' 4월 모임 📚",
    location: "홍시주택 북카페",
    likes: 54,
    comments: 9,
    hashtag: "hobby",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "아침 요가 클래스 시작! 함께해요 🧘",
    location: "장안생활 피트니스룸",
    likes: 78,
    comments: 15,
    hashtag: "hobby",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "영화 동호회 '시네마클럽' 모임 🎬",
    location: "안암생활 미디어룸",
    likes: 93,
    comments: 19,
    hashtag: "hobby",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "공유주방에서 만난 이웃들 🍳",
    location: "홍시주택 공유주방",
    likes: 61,
    comments: 11,
    hashtag: "daily",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    caption: "크리스마스 파티 준비 중 🎄",
    location: "장안생활 라운지",
    likes: 112,
    comments: 27,
    hashtag: "party",
  },
];

const supportPrograms = [
  {
    id: 1,
    title: "소모임 지원 프로그램",
    description: "입주민 자발적 모임에 활동비와 공간을 지원합니다. 독서, 운동, 취미 등 다양한 모임을 시작해보세요.",
    icon: Users,
    benefits: ["월 10만원 활동비 지원", "공용 공간 무료 이용", "홍보물 제작 지원"],
  },
  {
    id: 2,
    title: "공간 공유 공모전",
    description: "공유 주방, 라운지 등을 활용한 창의적인 기획을 공모합니다. 채택된 기획에는 실행 예산을 지원합니다.",
    icon: Gift,
    benefits: ["최대 50만원 실행 예산", "전문가 멘토링", "기획 컨설팅"],
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "5월 입주민 파티",
    date: "2025-05-15",
    location: "안암생활 라운지",
    description: "새로 오신 분들 환영! 함께 저녁 먹어요",
  },
  {
    id: 2,
    title: "원데이 베이킹 클래스",
    date: "2025-05-20",
    location: "홍시주택 공유주방",
    description: "마카롱 만들기 with 파티시에",
  },
  {
    id: 3,
    title: "옥상 바베큐 파티",
    date: "2025-05-25",
    location: "장안생활 옥상",
    description: "봄밤의 바베큐 파티",
  },
];

export default function Community() {
  const [activeHashtag, setActiveHashtag] = useState("all");

  const filteredPosts = activeHashtag === "all"
    ? communityPosts
    : communityPosts.filter((post) => post.hashtag === activeHashtag);

  return (
    <div className="min-h-screen" data-testid="page-community">
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-card" data-testid="section-community-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Community
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                입주민 라이프
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                아이부키 입주민들의 생생한 일상과 커뮤니티 활동을 만나보세요.
                외롭지 않은 나만의 집, 함께 만들어가는 이야기입니다.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background" data-testid="section-social-stream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-2">
                  Ibookee Life
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  소셜 스트림
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hashtags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={activeHashtag === tag.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveHashtag(tag.id)}
                    className="rounded-full"
                    data-testid={`filter-hashtag-${tag.id}`}
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                  data-testid={`post-${post.id}`}
                >
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="w-5 h-5 fill-white" />
                        <span className="font-medium">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.comments}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm line-clamp-2 mb-1">{post.caption}</p>
                      <p className="text-white/70 text-xs">{post.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-card" data-testid="section-support-programs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Support Program
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                입주민 지원 프로그램
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {supportPrograms.map((program) => (
                <Card
                  key={program.id}
                  className="p-6 md:p-8"
                  data-testid={`program-${program.id}`}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <program.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {program.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {program.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full group" data-testid={`button-apply-${program.id}`}>
                    신청하기
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background" data-testid="section-events">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">
                  Notice & Events
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  다가오는 행사
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="p-6 hover-elevate"
                  data-testid={`event-${event.id}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {new Date(event.date).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
