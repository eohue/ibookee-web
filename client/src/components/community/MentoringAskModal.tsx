import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Mentor } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lock, Globe, MessageSquare, Sparkles, Loader2, Calendar } from "lucide-react";

interface MentoringAskModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
  defaultMentorId?: string;
  defaultCategory?: string;
}

interface FormData {
  mentorId: string;
  category: string;
  title: string;
  content: string;
  authorNickname: string;
  authorContact: string;
  isSecret: boolean;
  requestMeeting: boolean;
  preferredSchedule: string;
}

export function MentoringAskModal({
  isOpen,
  onClose,
  mentors,
  defaultMentorId,
  defaultCategory = "finance",
}: MentoringAskModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      mentorId: defaultMentorId || "all",
      category: defaultCategory,
      title: "",
      content: "",
      authorNickname: user?.nickname || user?.realName || "",
      authorContact: user?.phoneNumber || user?.email || "",
      isSecret: false,
      requestMeeting: false,
      preferredSchedule: "",
    },
  });

  const isSecret = watch("isSecret");
  const requestMeeting = watch("requestMeeting");
  const selectedMentorId = watch("mentorId");
  const selectedCategory = watch("category");

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        mentorId: data.mentorId === "all" ? null : data.mentorId,
        userId: user?.id || null,
        meetingStatus: data.requestMeeting ? "requested" : "none",
      };
      const res = await apiRequest("POST", "/api/mentoring-consultations", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentoring-consultations"] });
      toast({
        title: "상담 질문이 등록되었습니다",
        description: isSecret
          ? "비밀글로 안전하게 접수되었습니다. 멘토와 관리자만 열람할 수 있습니다."
          : "질문이 등록되었습니다. 멘토가 확인 후 정성스럽게 답변해 드립니다.",
      });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast({
        title: "질문 등록 실패",
        description: err.message || "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              Neighbor Mentoring
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            멘토에게 상담 질문하기
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            사회공헌 멘토에게 재무·세무, 법률, 주거 고민을 문의해 보세요. 기본은 공개 상담으로 지식을 나누며, 민감한 사안은 비공개로 보호받으실 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 멘토 선택 및 카테고리 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">상담 멘토 지정</Label>
              <Select
                value={selectedMentorId}
                onValueChange={(val) => setValue("mentorId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="멘토를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 멘토 (분야별 추천)</SelectItem>
                  {mentors.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.title})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">상담 분야</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setValue("category", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="분야 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">재무 / 세무 / 회계</SelectItem>
                  <SelectItem value="law">법률 / 임대차 / 계약</SelectItem>
                  <SelectItem value="career">진로 / 취업 / 창업</SelectItem>
                  <SelectItem value="housing">주거생활 / 입주생활</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 질문 제목 */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-foreground/80">
              상담 제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="예: 사회초년생 첫 연말정산 월세 공제 혜택 문의"
              {...register("title", { required: "제목을 입력해주세요." })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* 질문 내용 */}
          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-xs font-medium text-foreground/80">
              구체적인 고민 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              rows={5}
              placeholder="현재 겪고 계신 구체적인 상황과 궁금한 점을 적어주세요. (주민등록번호나 계좌번호 등 민감한 개인정보는 적지 마세요)"
              {...register("content", { required: "상담 내용을 입력해주세요." })}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* 작성자 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="authorNickname" className="text-xs font-medium text-foreground/80">
                표시용 닉네임 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="authorNickname"
                placeholder="예: 보린3호_청년, 독립러"
                {...register("authorNickname", { required: "닉네임을 입력해주세요." })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="authorContact" className="text-xs font-medium text-foreground/80">
                연락처 또는 이메일 (비공개 운영용)
              </Label>
              <Input
                id="authorContact"
                placeholder="답변 알림 및 일정 조율용"
                {...register("authorContact")}
              />
            </div>
          </div>

          {/* 핵심: 공개 / 비공개 설정 토글 */}
          <div className={`p-4 rounded-xl border transition-colors ${
            isSecret ? "bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/20" : "bg-muted/40 border-border"
          }`}>
            <div className="flex items-start gap-3">
              <Checkbox
                id="isSecret"
                checked={isSecret}
                onCheckedChange={(checked) => setValue("isSecret", !!checked)}
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label htmlFor="isSecret" className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                  {isSecret ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">비공개 상담으로 등록하기</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 text-primary" />
                      <span>기본 공개 상담 (이웃 지식 나눔)</span>
                    </>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSecret
                    ? "🔒 작성자 본인, 답변 멘토, 관리자만 내용을 열람할 수 있습니다. 개인 재무/법률 분쟁 등 민감한 내용에 권장합니다."
                    : "💡 체크하지 않으시면 공개글로 등록되어 비슷한 고민을 가진 다른 입주민들에게도 큰 도움이 됩니다."}
                </p>
              </div>
            </div>
          </div>

          {/* 1:1 심층 미팅 희망 옵션 */}
          <div className={`p-4 rounded-xl border transition-colors ${
            requestMeeting ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border"
          }`}>
            <div className="flex items-start gap-3">
              <Checkbox
                id="requestMeeting"
                checked={requestMeeting}
                onCheckedChange={(checked) => setValue("requestMeeting", !!checked)}
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label htmlFor="requestMeeting" className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>1:1 심층 미팅(화상/대면/유선)도 함께 희망합니다</span>
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  게시판 서면 답변뿐 아니라, 멘토와 직접 대화하며 심층 상담을 받고 싶으신 경우 체크해 주세요.
                </p>

                {requestMeeting && (
                  <div className="pt-2">
                    <Input
                      placeholder="희망 요일 및 시간대 (예: 평일 저녁 7시 이후, 주말 오후 등)"
                      className="bg-background text-sm"
                      {...register("preferredSchedule")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2 px-6">
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  상담 신청하기
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
