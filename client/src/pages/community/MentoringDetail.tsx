import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MentoringConsultation, Mentor } from "@shared/schema";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Globe,
  MessageSquare,
  Sparkles,
  User,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels: Record<string, string> = {
  finance: "재무 / 세무 / 회계",
  law: "법률 / 임대차 계약",
  career: "진로 / 창업 / 취업",
  housing: "주거생활 / 커뮤니티",
};

export default function MentoringDetail() {
  const [, params] = useRoute("/story/mentoring/:id");
  const consultationId = params?.id;

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [answerText, setAnswerText] = useState("");
  const [selectedAnswererMentorId, setSelectedAnswererMentorId] = useState<string>("");

  // 1. 상담 데이터 조회
  const {
    data: consultation,
    isLoading,
    isError,
    error,
  } = useQuery<MentoringConsultation>({
    queryKey: [`/api/mentoring-consultations/${consultationId}`],
    queryFn: async () => {
      const res = await fetch(`/api/mentoring-consultations/${consultationId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "상담 내역을 불러오지 못했습니다.");
      }
      return res.json();
    },
    enabled: !!consultationId,
  });

  // 2. 멘토 목록 조회 (답변 작성 시 멘토 선택용)
  const { data: mentors = [] } = useQuery<Mentor[]>({
    queryKey: ["/api/mentors"],
    enabled: isAdmin,
  });

  // 3. 답변 등록 Mutation
  const answerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/mentoring-consultations/${consultationId}/answer`,
        {
          answer: answerText,
          answeredBy: selectedAnswererMentorId || consultation?.mentorId || null,
        }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/mentoring-consultations/${consultationId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/mentoring-consultations"],
      });
      toast({
        title: "답변이 등록되었습니다",
        description: "멘토의 전문 답변이 성공적으로 저장되었습니다.",
      });
      setAnswerText("");
    },
    onError: (err: any) => {
      toast({
        title: "답변 등록 실패",
        description: err.message || "오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 4. 상태 변경 Mutation
  const statusMutation = useMutation({
    mutationFn: async (meetingStatus: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/mentoring-consultations/${consultationId}`,
        { meetingStatus }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/mentoring-consultations/${consultationId}`],
      });
      toast({ title: "미팅 상태가 변경되었습니다." });
    },
  });

  const assignedMentor = mentors.find((m) => m.id === consultation?.mentorId);
  const answeredMentor = mentors.find((m) => m.id === consultation?.answeredBy);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* 상단 뒤로가기 링크 */}
          <div className="mb-6">
            <Link href="/story/mentoring">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                이웃 멘토링 목록으로 돌아가기
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border p-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">상담을 열람할 수 없습니다</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                {(error as Error).message || "비공개 상담이거나 존재하지 않는 게시글입니다."}
              </p>
              <Link href="/story/mentoring">
                <Button>목록으로 이동</Button>
              </Link>
            </div>
          ) : consultation ? (
            <div className="space-y-8">
              {/* 질문 본문 카드 */}
              <Card className="rounded-2xl border shadow-sm overflow-hidden bg-card">
                <CardContent className="p-6 sm:p-8">
                  {/* 메타 배지 */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <Badge variant="outline">
                      {categoryLabels[consultation.category] || consultation.category}
                    </Badge>
                    {consultation.isSecret ? (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 border-amber-500/20 text-xs">
                        <Lock className="w-3 h-3" /> 비공개 상담
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-primary/10 text-primary gap-1 border-primary/20 text-xs">
                        <Globe className="w-3 h-3" /> 공개 상담
                      </Badge>
                    )}
                    {consultation.status === "answered" ? (
                      <Badge className="bg-emerald-600 text-white text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 답변 완료
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs gap-1">
                        <Clock className="w-3 h-3" /> 답변 대기 중
                      </Badge>
                    )}
                  </div>

                  {/* 제목 */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4">
                    {consultation.title}
                  </h1>

                  {/* 작성자 정보 */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pb-6 border-b border-border/60">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <User className="w-3.5 h-3.5" /> {consultation.authorNickname}
                    </span>
                    <span>•</span>
                    <span>{new Date(consultation.createdAt!).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
                    <span>•</span>
                    <span>조회 {consultation.views || 0}</span>
                  </div>

                  {/* 본문 */}
                  <div className="py-6 text-foreground/90 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                    {consultation.content}
                  </div>

                  {/* 1:1 심층 미팅 희망 사항 안내 (있을 경우) */}
                  {consultation.requestMeeting && (
                    <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs sm:text-sm">
                      <div className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-4 h-4" />
                        1:1 심층 미팅(대면/화상) 희망 사안
                      </div>
                      <p className="text-muted-foreground">
                        희망 일정: <strong>{consultation.preferredSchedule || "일정 협의"}</strong>
                      </p>
                      {isAdmin && consultation.meetingStatus && (
                        <div className="mt-3 flex items-center gap-3">
                          <span className="font-medium text-xs">진행 상태:</span>
                          <Select
                            value={consultation.meetingStatus}
                            onValueChange={(val) => statusMutation.mutate(val)}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="requested">미팅 접수</SelectItem>
                              <SelectItem value="scheduled">일정 확정</SelectItem>
                              <SelectItem value="completed">상담 완료</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 비공개 연락처 (관리자에게만 노출) */}
                  {isAdmin && consultation.authorContact && (
                    <div className="mt-3 p-3 rounded-lg bg-muted text-xs text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>관리자 확인용 연락처: <strong>{consultation.authorContact}</strong></span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 멘토의 답변 카드 (답변이 있는 경우) */}
              {consultation.answer && (
                <Card className="rounded-2xl border-2 border-primary/20 shadow-md overflow-hidden bg-primary/5 dark:bg-primary/10">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Mentor Answer
                        </div>
                        <h2 className="text-lg font-bold text-foreground">
                          {answeredMentor ? `${answeredMentor.name} ${answeredMentor.title}` : "전문 멘토 답변"}
                        </h2>
                      </div>
                      {consultation.answeredAt && (
                        <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(consultation.answeredAt).toLocaleDateString("ko-KR")}
                        </div>
                      )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line text-base">
                      {consultation.answer}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 관리자 / 멘토 답변 등록 에디터 (관리자일 때 노출) */}
              {isAdmin && (
                <Card className="rounded-2xl border border-dashed border-primary/40 bg-card p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">
                      {consultation.answer ? "답변 수정하기 (관리자)" : "멘토 답변 등록하기 (관리자)"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        답변 작성 멘토 선택
                      </label>
                      <Select
                        value={selectedAnswererMentorId || consultation.mentorId || ""}
                        onValueChange={setSelectedAnswererMentorId}
                      >
                        <SelectTrigger className="w-full sm:w-72">
                          <SelectValue placeholder="답변 멘토 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {mentors.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.title})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        답변 내용
                      </label>
                      <Textarea
                        rows={6}
                        placeholder="입주민을 위한 따뜻하고 전문적인 조언을 작성해 주세요."
                        defaultValue={consultation.answer || ""}
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => answerMutation.mutate()}
                        disabled={answerMutation.isPending || !answerText.trim()}
                        className="gap-2"
                      >
                        {answerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            저장 중...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {consultation.answer ? "답변 수정 완료" : "답변 등록하기"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
