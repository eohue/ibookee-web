import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Heart, Calendar, Users, ArrowRight, Gift, AlertCircle, RefreshCw, ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommunityPost, Event, ResidentProgram, SocialAccount } from "@shared/schema";
import { PostDetailModal } from "@/components/community/PostDetailModal";

const defaultHashtags = [
  { id: "all", label: "전체" },
  { id: "소모임", label: "#소모임" },
  { id: "파티", label: "#파티" },
  { id: "원데이클래스", label: "#원데이클래스" },
  { id: "입주민일상", label: "#입주민일상" },
  { id: "플리마켓", label: "#플리마켓" },
];

const programTypeIcons: Record<string, typeof Users> = {
  "small-group": Users,
  "space-sharing": Gift,
};

const programTypeLabels: Record<string, string> = {
  "small-group": "소모임 지원 프로그램",
  "space-sharing": "공간 공유 공모전",
};

const programTypeBenefits: Record<string, string[]> = {
  "small-group": ["월 10만원 활동비 지원", "공용 공간 무료 이용", "홍보물 제작 지원"],
  "space-sharing": ["최대 50만원 실행 예산", "전문가 멘토링", "기획 컨설팅"],
};

// Helper function to extract YouTube video ID from embed code
const getYouTubeVideoId = (embedCode: string): string | null => {
  // Match youtube.com/embed/VIDEO_ID pattern
  const embedMatch = embedCode.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Match youtube.com/watch?v=VIDEO_ID pattern
  const watchMatch = embedCode.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Match youtu.be/VIDEO_ID pattern
  const shortMatch = embedCode.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Match youtube.com/shorts/VIDEO_ID pattern
  const shortsMatch = embedCode.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  return null;
};


export default function Community() {
  const [activeHashtag, setActiveHashtag] = useState("all");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data: socialAccounts = [], isLoading: accountsLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isError: postsError,
    refetch: refetchPosts
  } = useInfiniteQuery({
    queryKey: ["/api/community-posts", activeHashtag],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.append("page", String(pageParam));
      params.append("limit", "20");
      if (activeHashtag !== "all") {
        params.append("hashtag", activeHashtag);
      }
      const response = await fetch(`/api/community-posts?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json() as Promise<{ posts: CommunityPost[], total: number }>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedPosts = allPages.flatMap(p => p.posts).length;
      if (loadedPosts < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  const communityPosts = useMemo(() => {
    return postsData?.pages.flatMap(page => page.posts) || [];
  }, [postsData]);

  const { data: events = [], isLoading: eventsLoading, isError: eventsError, refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: programs = [], isLoading: programsLoading, isError: programsError, refetch: refetchPrograms } = useQuery<ResidentProgram[]>({
    queryKey: ["/api/programs"],
  });

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keep allHashtags logic for now, but it relies on fetched posts which might be partial.
  // Ideally, hashtags should be fetched separately or fixed list.
  // For now, we combine default with loaded tags, but since we lazy load, dynamic tags might be missing.
  // We'll trust defaultHashtags + whatever we find in loaded posts + maybe activeHashtag itself if not in list.
  const allHashtags = useMemo(() => {
    const tagSet = new Set<string>();
    communityPosts.forEach(post => {
      post.hashtags?.forEach(tag => tagSet.add(tag));
    });
    const dynamicTags = Array.from(tagSet).map(tag => ({ id: tag, label: `#${tag}` }));

    // Ensure active hashtag is present if it's not "all" and not in default params
    // Actually we just display defaults + found ones.
    const combined = [...defaultHashtags];

    // Add dynamic ones that are not duplicates
    dynamicTags.forEach(tag => {
      if (!combined.find(t => t.id === tag.id)) {
        combined.push(tag);
      }
    });

    return combined;
  }, [communityPosts]);

  const accountsById = useMemo(() => {
    const map: Record<string, SocialAccount> = {};
    socialAccounts.forEach(acc => { map[acc.id] = acc; });
    return map;
  }, [socialAccounts]);

  const upcomingEvents = events.filter((event) =>
    event.published && (event.status === "upcoming" || event.status === "ongoing")
  ).slice(0, 3);

  const openPrograms = programs.filter((program) =>
    program.published && program.status === "open"
  );

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
                {allHashtags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={activeHashtag === tag.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveHashtag(tag.id);
                      // Reset scroll or similar if needed, query key change handles fetch
                    }}
                    className="rounded-full"
                    data-testid={`filter-hashtag-${tag.id}`}
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </div>

            {postsError ? (
              <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                <Button variant="outline" onClick={() => refetchPosts()} data-testid="button-retry-posts">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {communityPosts.map((post) => {
                    const account = post.accountId ? accountsById[post.accountId] : null;
                    return (
                      <div
                        key={post.id}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                        data-testid={`post-${post.id}`}
                        onClick={() => setSelectedPost(post)}
                      >
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.caption || "Community post"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : post.embedCode ? (
                          (() => {
                            const youtubeId = getYouTubeVideoId(post.embedCode);
                            if (youtubeId) {
                              return (
                                <img
                                  src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                  alt={post.caption || "YouTube video"}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              );
                            }
                            return (
                              <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4 text-muted-foreground bg-gray-100">
                                <SiInstagram className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-xs font-medium">View Post</span>
                              </div>
                            );
                          })()
                        ) : (

                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-5 h-5 fill-white" />
                                <span className="font-medium">{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-5 h-5 text-white" />
                                <span className="font-medium text-white">{post.commentCount || 0}</span>
                              </div>
                            </div>
                            {post.sourceUrl && (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            {account && (
                              <div className="flex items-center gap-2 mb-2">
                                {account.platform === 'instagram' && <SiInstagram className="w-4 h-4 text-white" />}
                                <span className="text-white text-xs font-medium">{account.name}</span>
                              </div>
                            )}
                            {post.caption && (
                              <p className="text-white text-sm line-clamp-2 mb-1">{post.caption}</p>
                            )}
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {post.hashtags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-white/80 text-xs">#{tag}</span>
                                ))}
                              </div>
                            )}
                            {post.images && post.images.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-sm">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-white"
                                >
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                  <path d="M3 9h18" />
                                  <path d="M9 21V9" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading Skeletons for next page */}
                  {(postsLoading || isFetchingNextPage) && (
                    [...Array(4)].map((_, i) => (
                      <Skeleton key={`skeleton-${i}`} className="aspect-square rounded-lg" />
                    ))
                  )}
                </div>

                {!postsLoading && communityPosts.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">
                      등록된 게시물이 없습니다.
                    </p>
                  </div>
                )}

                {/* Intersection Observer Sentinel */}
                <div ref={observerRef} className="h-10 w-full" />
              </>
            )}
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

            {programsError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                <Button variant="outline" onClick={() => refetchPrograms()} data-testid="button-retry-programs">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            ) : programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="p-6 md:p-8">
                    <Skeleton className="w-14 h-14 rounded-full mb-6" />
                    <Skeleton className="h-6 w-48 mb-3" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <div className="space-y-2 mb-6">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </Card>
                ))}
              </div>
            ) : openPrograms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  현재 모집 중인 프로그램이 없습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {openPrograms.map((program) => {
                  const IconComponent = programTypeIcons[program.programType] || Users;
                  const defaultBenefits = programTypeBenefits[program.programType] || [];
                  return (
                    <Card
                      key={program.id}
                      className="p-6 md:p-8"
                      data-testid={`program-${program.id}`}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {program.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {program.description}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {defaultBenefits.map((benefit, index) => (
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
                  );
                })}
              </div>
            )}
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

            {eventsError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                <Button variant="outline" onClick={() => refetchEvents()} data-testid="button-retry-events">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            ) : eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  예정된 행사가 없습니다.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </section>
      </main>
      <Footer />
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        account={selectedPost?.accountId ? accountsById[selectedPost.accountId] : null}
      />
    </div>
  );
}
