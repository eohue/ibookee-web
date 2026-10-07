import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import type { Mentor, MentoringConsultation } from "@shared/schema";
import { MentoringAskModal } from "@/components/community/MentoringAskModal";
import {
  Users,
  MessageSquare,
  Lock,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels: Record<string, string> = {
  all: "전체 분야",
  finance: "재무 / 세무 / 회계",
  law: "법률 / 임대차 계약",
  career: "진로 / 창업 / 취업",
  housing: "주거생활 / 커뮤니티",
};

const categoryBadgeColors: Record<string, string> = {
  finance: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  law: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  career: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  housing: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export default function MentoringPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [selectedMentorForModal, setSelectedMentorForModal] = useState<Mentor | null>(null);

  // 멘토 목록 조회
  const { data: mentors = [], isLoading: isMentorsLoading } = useQuery<Mentor[]>({
    queryKey: ["/api/mentors"],
  });

  // 상담 목록 조회
  const { data: consultations = [], isLoading: isConsultationsLoading } = useQuery<MentoringConsultation[]>({
    queryKey: ["/api/mentoring-consultations", activeCategory],
    queryFn: async () => {
      const url = activeCategory === "all"
        ? "/api/mentoring-consultations"
        : `/api/mentoring-consultations?category=${activeCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch consultations");
      return res.json();
    },
  });

  const handleOpenAskModal = (mentor?: Mentor) => {
    setSelectedMentorForModal(mentor || null);
    setIsAskModalOpen(true);
  };

  // 통계 계산
  const totalCount = consultations.length;
  const answeredCount = consultations.filter((c) => c.status === "answered").length;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        {/* 관리자 테스트 모드 배너 */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-300 py-2.5 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>🧪 <strong>내부 테스트 모드:</strong> 본 코너는 정식 오픈 전 사전 검증을 진행 중인 1:1 멘토링 공간입니다.</span>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 hidden sm:inline-flex">
              {isAdmin ? "Admin Mode" : "Preview Mode"}
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* 1. 히어로 헤더 */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted/40 p-8 sm:p-12 border border-primary/20 shadow-sm mb-12">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>사는 이야기 • 상호부조 지식 나눔</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                  아이부키 이웃 멘토링
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                  사회공헌 회계사·법무사부터 선배 입주민까지. 세무, 주거 권리, 재무 고민을 함께 풀고 이웃들과 지식을 나눕니다.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => handleOpenAskModal()}
                    className="gap-2 rounded-xl shadow-md font-semibold"
                  >
                    <MessageSquare className="w-4 h-4" />
                    멘토에게 질문하기
                  </Button>
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground ml-2">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-primary" /> 기본 공개 상담
                    </span>
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" /> 비밀글 선택 가능
                    </span>
                  </div>
                </div>
              </div>

              {/* 통계 카드 미니 배너 */}
              <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <div className="text-xs text-muted-foreground">활동 멘토</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{mentors.length}명</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">누적 상담</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{totalCount}건</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">답변 완료율</div>
                  <div className="text-xl sm:text-2xl font-bold text-primary mt-0.5">
                    {totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 100}%
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 멘토 라인업 쇼케이스 */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">참여 멘토</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    사회주택 입주민을 위해 재능기부와 멘토링을 실천하는 전문가들입니다.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAskModal()}
                  className="gap-1.5 hidden sm:flex"
                >
                  <PlusCircle className="w-4 h-4 text-primary" />
                  상담 신청
                </Button>
              </div>

              {isMentorsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentors.map((mentor) => (
                    <Card
                      key={mentor.id}
                      className="group overflow-hidden rounded-2xl border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/60 backdrop-blur-sm"
                    >
                      <CardContent className="p-6 sm:p-7">
                        <div className="flex items-start gap-4">
                          <img
                            src={mentor.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                            alt={mentor.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-border shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="outline" className={categoryBadgeColors[mentor.category] || ""}>
                                {categoryLabels[mentor.category] || mentor.category}
                              </Badge>
                              {mentor.organization && (
                                <span className="text-xs text-muted-foreground">{mentor.organization}</span>
                              )}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-foreground">
                              {mentor.name}{" "}
                              <span className="text-sm font-normal text-muted-foreground">
                                {mentor.title}
                              </span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {mentor.availableSchedule || "온라인 및 대면 상담 가능"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-foreground/80 mt-4 leading-relaxed line-clamp-3">
                          {mentor.bio}
                        </p>

                        {/* 전문 키워드 태그 */}
                        {mentor.expertiseTopics && mentor.expertiseTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {mentor.expertiseTopics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                              >
                                #{topic}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 무료 재능기부 멘토링
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleOpenAskModal(mentor)}
                            className="gap-1.5 rounded-lg text-xs"
                          >
                            이 멘토에게 상담 요청
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* 3. 상담 피드 (질의응답 아카이브) */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">이웃 상담 피드</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    공개된 질문과 답변을 통해 이웃들의 지식을 함께 나눕니다.
                  </p>
                </div>

                <Button
                  onClick={() => handleOpenAskModal()}
                  className="gap-2 rounded-xl self-start sm:self-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  새 상담 질문 등록
                </Button>
              </div>

              {/* 카테고리 필터 탭 */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={activeCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(key)}
                    className="rounded-full text-xs whitespace-nowrap"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* 상담 목록 리스트 */}
              {isConsultationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </Card>
                  ))}
                </div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-base font-semibold text-foreground">아직 등록된 상담이 없습니다.</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    첫 번째 질문의 주인공이 되어보세요!
                  </p>
                  <Button onClick={() => handleOpenAskModal()} size="sm">
                    첫 질문 작성하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((item) => {
                    const isAnswered = item.status === "answered";
                    return (
                      <Link key={item.id} href={`/story/mentoring/${item.id}`}>
                        <Card className="p-5 sm:p-6 rounded-2xl border hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-md bg-card/80">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge variant="outline" className={`text-xs ${categoryBadgeColors[item.category] || ""}`}>
                                  {categoryLabels[item.category] || item.category}
                                </Badge>

                                {item.isSecret ? (
                                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 border-amber-500/20 text-xs">
                                    <Lock className="w-3 h-3" /> 비공개 상담
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary gap-1 border-primary/20 text-xs">
                                    <Globe className="w-3 h-3" /> 공개 상담
                                  </Badge>
                                )}

                                {isAnswered ? (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> 답변 완료
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground text-xs gap-1">
                                    <Clock className="w-3 h-3" /> 답변 대기
                                  </Badge>
                                )}

                                {item.requestMeeting && (
                                  <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs">
                                    1:1 미팅 희망
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>

                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {item.content}
                              </p>

                              {/* 답변 요약 프리뷰 (공개글이면서 답변이 있을 때) */}
                              {!item.isSecret && item.answer && (
                                <div className="mt-3.5 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground/80 leading-relaxed flex items-start gap-2">
                                  <span className="font-semibold text-primary flex-shrink-0">멘토 답변:</span>
                                  <span className="line-clamp-2">{item.answer}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                <span>작성자: <strong>{item.authorNickname}</strong></span>
                                <span>•</span>
                                <span>{new Date(item.createdAt!).toLocaleDateString("ko-KR")}</span>
                                <span>•</span>
                                <span>조회 {item.views || 0}</span>
                              </div>
                            </div>

                            <ChevronRight className="w-5 h-5 text-muted-foreground self-center flex-shrink-0" />
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 4. 자발적 멘토 모집 안내 카드 */}
            <section className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-muted/80 to-muted/40 border text-center">
              <h3 className="text-xl font-bold mb-2">사회주택 이웃 멘토로 함께해 주세요</h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed mb-5">
                청년 입주민들에게 경험과 노하우를 나누어 줄 회계사, 법무사, 시니어 전문가 및 거쳐간 선배 입주민의 참여를 기다립니다.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="gap-2">
                  멘토 참여 문의하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </section>
          </div>
      </main>

      {/* 상담 작성 모달 */}
      <MentoringAskModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        mentors={mentors}
        defaultMentorId={selectedMentorForModal?.id}
        defaultCategory={selectedMentorForModal?.category}
      />

      <Footer />
    </div>
  );
}
