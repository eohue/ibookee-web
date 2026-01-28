import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Heart, Calendar, Users, ArrowRight, Gift, AlertCircle, RefreshCw, ExternalLink, Loader2, MessageCircle, Info, Home } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommunityPost, Event, ResidentProgram, SocialAccount, Project, HousingRecruitment } from "@shared/schema";
import { PostDetailModal } from "@/components/community/PostDetailModal";
import { ProgramApplicationModal } from "@/components/community/ProgramApplicationModal";
import { ReporterSubmissionModal } from "@/components/community/ReporterSubmissionModal";
import { ReporterArticleModal } from "@/components/community/ReporterArticleModal";
import { useAuth } from "@/hooks/use-auth";
import type { ResidentReporter } from "@shared/schema";

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
  const { user } = useAuth();
  const [activeHashtag, setActiveHashtag] = useState("all");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Omit<ResidentReporter, "content"> | ResidentReporter | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ResidentProgram | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data: socialAccounts = [], isLoading: accountsLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  const { data: recruitments = [], isLoading: recruitmentsLoading } = useQuery<HousingRecruitment[]>({
    queryKey: ["/api/recruitments"],
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

  const { data: reporterData } = useQuery<{ articles: Omit<ResidentReporter, "content">[], total: number }>({
    queryKey: ["/api/resident-reporter"],
  });

  const reporterArticles = reporterData?.articles || [];

  // Fetch full article details when selected
  const { data: fullArticle } = useQuery<ResidentReporter>({
    queryKey: ["/api/resident-reporter", selectedArticle?.id],
    queryFn: async () => {
      if (!selectedArticle?.id) throw new Error("No article selected");
      const res = await fetch(`/api/resident-reporter/${selectedArticle.id}`);
      if (!res.ok) throw new Error("Failed to fetch article");
      return res.json();
    },
    enabled: !!selectedArticle?.id,
  });

  return (
    <div className="min-h-screen" data-testid="page-community">
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-card" data-testid="section-community-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Life
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                입주민 라이프
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                아이부키 입주민들의 생생한 일상과 커뮤니티 활동을 만나보세요.<br />
                외롭지 않은 나만의 집, 함께 만들어가는 이야기입니다.
              </p>
            </div>
          </div>
        </section>

        {/* Housing Recruitment Section */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10" data-testid="section-housing-recruitment">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-primary font-medium text-sm uppercase tracking-widest">
                  Housing Recruitment
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  입주자 모집 공고
                </h2>
              </div>
            </div>

            {recruitmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-background rounded-lg p-4 border-2 border-border/80 animate-pulse">
                    <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : recruitments.length === 0 ? (
              <div className="bg-background rounded-lg p-8 border-2 border-border/80 text-center">
                <p className="text-muted-foreground">현재 모집 중인 공고가 없습니다.</p>
                <Link href="/space">
                  <Button variant="outline" className="mt-4">
                    프로젝트 둘러보기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recruitments.map((recruitment) => (
                  <div
                    key={recruitment.id}
                    className="bg-background rounded-lg p-4 border-2 border-border/80 hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {recruitment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {recruitment.createdAt
                            ? new Date(recruitment.createdAt).toLocaleDateString("ko-KR")
                            : ""}
                        </p>
                      </div>
                      {recruitment.fileUrl && (
                        <a
                          href={recruitment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex-shrink-0"
                        >
                          <ArrowRight className="w-4 h-4" />
                          공고문 보기
                        </a>
                      )}
                    </div>
                    {recruitment.content && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {recruitment.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                  소셜<br />스트림
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
                        className="group flex flex-col bg-card rounded-lg overflow-hidden border-2 border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        data-testid={`post-${post.id}`}
                        onClick={() => setSelectedPost(post)}
                      >
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.caption || "Community post"}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : post.embedCode ? (
                            (() => {
                              const youtubeId = getYouTubeVideoId(post.embedCode);
                              if (youtubeId) {
                                return (
                                  <img
                                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                    alt={post.caption || "YouTube video"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

                          {/* Type icon overlay */}
                          {post.images && post.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md backdrop-blur-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
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

                        <div className="p-4 flex flex-col flex-1 gap-3">
                          {/* Metadata Header */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {account ? (
                              <div className="flex items-center gap-1.5 text-foreground font-medium">
                                {account.platform === 'instagram' && <SiInstagram className="w-3.5 h-3.5" />}
                                <span className="truncate max-w-[100px]">{account.name}</span>
                              </div>
                            ) : (
                              <span>소셜 포스트</span>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{post.commentCount || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Caption */}
                          {post.caption && (
                            <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed h-[2.5rem]">
                              {post.caption}
                            </p>
                          )}

                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto pt-2">
                              {post.hashtags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-sm">
                                  #{tag}
                                </span>
                              ))}
                              {post.hashtags.length > 2 && (
                                <span className="text-[10px] text-muted-foreground px-1 py-0.5">+{post.hashtags.length - 2}</span>
                              )}
                            </div>
                          )}
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

        {/* Resident Reporter Section */}
        <section className="py-20 bg-muted/60" data-testid="section-resident-reporter">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                  Resident Reporter
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  입주민 기자단
                </h2>
              </div>
              <div className="flex gap-2">
                <a href="/resident-reporter-guide">
                  <Button variant="ghost" className="group text-muted-foreground hover:text-primary">
                    <Info className="w-4 h-4 mr-2" />
                    기자단이란?
                  </Button>
                </a>
                {user && (
                  <Button onClick={() => setIsReporterModalOpen(true)}>
                    기사 제보하기
                  </Button>
                )}
              </div>
            </div>

            {reporterArticles.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">아직 등록된 기사가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">첫 번째 기사의 주인공이 되어보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reporterArticles.map(article => (
                  <Card key={article.id} className="overflow-hidden cursor-pointer border-2 border-border shadow-lg hover:shadow-xl transition-all bg-card" onClick={() => setSelectedArticle(article)}>
                    {article.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden relative">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        {article.status === 'approved' && (
                          <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                            승인됨
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-primary font-medium">{article.authorName} 기자</span>
                        <span className="text-xs text-muted-foreground">{new Date(article.createdAt || "").toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 line-clamp-1">{article.title}</h3>
                      <p className="text-muted-foreground line-clamp-3 text-sm">
                        {"내용을 보려면 클릭하세요."}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
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
                      className="p-6 md:p-8 border-2 border-border shadow-lg hover:shadow-xl bg-background"
                      data-testid={`program-${program.id}`}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {program.title}
                      </h3>
                      <p className="text-foreground/80 mb-6">
                        {program.description}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {defaultBenefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-foreground/70">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full group"
                        data-testid={`button-apply-${program.id}`}
                        onClick={() => setSelectedProgram(program)}
                      >
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

        <section className="py-20 bg-muted/60" data-testid="section-events">
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
                  <a
                    key={event.id}
                    href={`/community/event/${event.id}`}
                    className="block"
                  >
                    <Card
                      className="overflow-hidden cursor-pointer h-full border-2 border-border shadow-lg hover:shadow-xl transition-all bg-card"
                      data-testid={`event-${event.id}`}
                    >
                      {event.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      </div>
                    </Card>
                  </a>
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
      <ReporterSubmissionModal
        isOpen={isReporterModalOpen}
        onClose={() => setIsReporterModalOpen(false)}
      />
      <ReporterArticleModal
        article={fullArticle || selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
      <ProgramApplicationModal
        program={selectedProgram}
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
      />
    </div>
  );
}
