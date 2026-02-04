import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@shared/schema";

export default function CTASection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredHouse: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects?isLive=true"],
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: { type: string; name: string; email: string; phone: string; message: string; preferredProject?: string }) => {
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "신청이 완료되었습니다",
        description: "입주 가능한 매물이 생기면 안내해 드리겠습니다.",
      });
    },
    onError: () => {
      toast({
        title: "신청 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    inquiryMutation.mutate({
      type: "move-in",
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: "입주 대기 신청",
      preferredProject: formData.preferredHouse,
    });
  };

  const isSubmitting = inquiryMutation.isPending;

  return (
    <section className="py-20 md:py-24 bg-card" data-testid="section-cta">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
              Move-in Waiting List
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              따로 또 같이,<br />
              당신의 첫 번째 소셜 라이프
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              문을 열면 이웃이 있고, 문을 닫으면 온전한 휴식이 있는 곳.
              아이부키의 새로운 공간 소식을 누구보다 빠르게 받아보세요.
              혼자가 아니기에 더 특별한 일상이 시작됩니다.
            </p>
            <ul className="space-y-3">
              {[
                "커뮤니티 프로그램 우선 참여",
                "신규 프로젝트 사전 안내",
                "입주 상담 우선 예약",
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background rounded-lg p-6 md:p-8 border border-border">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  신청이 완료되었습니다
                </h3>
                <p className="text-muted-foreground">
                  입주 가능한 매물이 생기면 안내해 드리겠습니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  입주 대기 신청
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1.5"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1.5"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">연락처</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="mt-1.5"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredHouse">희망 입주 주택 (선택)</Label>
                    <Select
                      value={formData.preferredHouse}
                      onValueChange={(value) => setFormData({ ...formData, preferredHouse: value })}
                    >
                      <SelectTrigger className="mt-1.5" id="preferredHouse">
                        <SelectValue placeholder="입주 희망하는 주택을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.title}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={isSubmitting}
                    data-testid="button-submit-waitlist"
                  >
                    {isSubmitting ? "신청 중..." : "입주 대기 신청하기"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  개인정보는 입주 안내 목적으로만 사용됩니다.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
