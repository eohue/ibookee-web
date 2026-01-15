import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Home, Briefcase, Users, ArrowRight, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type FormType = "move-in" | "business" | "recruit" | "resident-auth";

const formTypes = [
  {
    id: "move-in" as FormType,
    title: "입주 문의",
    description: "새로운 입주를 희망하시는 분",
    icon: Home,
  },
  {
    id: "business" as FormType,
    title: "사업 제휴",
    description: "토지주, 건물주, 투자자, 공공기관",
    icon: Briefcase,
  },
  {
    id: "recruit" as FormType,
    title: "인재 채용",
    description: "아이부키와 함께하실 분",
    icon: Users,
  },
  {
    id: "resident-auth" as FormType,
    title: "입주민 인증",
    description: "입주민 권한 신청",
    icon: CheckCircle,
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeForm, setActiveForm] = useState<FormType>("move-in");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [moveInData, setMoveInData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLocation: "",
    message: "",
  });

  const [businessData, setBusinessData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
  });

  const [recruitData, setRecruitData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
  });

  const [residentAuthData, setResidentAuthData] = useState({
    name: "",
    phone: "",
    unitInfo: "", // Dong-Ho
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "resident_auth" || type === "resident-auth") {
      setActiveForm("resident-auth");
    }
  }, []);

  const inquiryMutation = useMutation({
    mutationFn: async (data: { type: string; name: string; email: string; phone?: string; company?: string; message: string }) => {
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "문의가 접수되었습니다",
        description: "담당자가 확인 후 연락드리겠습니다.",
      });
    },
    onError: () => {
      toast({
        title: "문의 접수 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let data;
    if (activeForm === "move-in") {
      data = {
        type: "move-in",
        name: moveInData.name,
        email: moveInData.email,
        phone: moveInData.phone,
        message: `희망지역: ${moveInData.preferredLocation}\n\n${moveInData.message}`,
      };
    } else if (activeForm === "business") {
      data = {
        type: "business",
        name: businessData.name,
        email: businessData.email,
        phone: businessData.phone,
        company: businessData.company,
        message: `문의유형: ${businessData.inquiryType}\n\n${businessData.message}`,
      };
    } else if (activeForm === "recruit") {
      data = {
        type: "recruit",
        name: recruitData.name,
        email: recruitData.email,
        phone: recruitData.phone,
        message: `지원직무: ${recruitData.position}\n\n${recruitData.message}`,
      };
    } else {
      // resident-auth
      data = {
        type: "resident-auth",
        name: residentAuthData.name,
        email: "resident-auth@ibookee.kr", // Placeholder or fetch from user
        phone: residentAuthData.phone,
        message: `입주민 인증 신청: ${residentAuthData.unitInfo}`,
      }
    }

    inquiryMutation.mutate(data);
  };

  const isSubmitting = inquiryMutation.isPending;

  const resetForm = () => {
    setIsSubmitted(false);
    setMoveInData({ name: "", email: "", phone: "", preferredLocation: "", message: "" });
    setBusinessData({ name: "", company: "", email: "", phone: "", inquiryType: "", message: "" });
    setRecruitData({ name: "", email: "", phone: "", position: "", message: "" });
    setResidentAuthData({ name: "", phone: "", unitInfo: "" });
  };

  return (
    <div className="min-h-screen" data-testid="page-contact">
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-card" data-testid="section-contact-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
                Contact
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                문의하기
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                아이부키에 대해 궁금한 점이 있으시면 언제든지 연락주세요.
                담당자가 빠르게 답변드리겠습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background" data-testid="section-contact-info">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">주소</h3>
                <p className="text-sm text-muted-foreground">
                  서울특별시 성동구 왕십리로 115
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">전화</h3>
                <p className="text-sm text-muted-foreground">
                  02-1234-5678
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">이메일</h3>
                <p className="text-sm text-muted-foreground">
                  contact@ibookee.kr
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-foreground mb-6">문의 유형</h2>
                <div className="space-y-4">
                  {formTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={`p-4 cursor-pointer transition-all ${activeForm === type.id
                        ? "border-primary bg-primary/5"
                        : "hover-elevate"
                        }`}
                      onClick={() => {
                        setActiveForm(type.id);
                        resetForm();
                      }}
                      data-testid={`tab-${type.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeForm === type.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                          }`}>
                          <type.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{type.title}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card className="p-6 md:p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        문의가 접수되었습니다
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.
                      </p>
                      <Button onClick={resetForm} variant="outline" data-testid="button-new-inquiry">
                        새 문의하기
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-foreground mb-6">
                        {formTypes.find((t) => t.id === activeForm)?.title}
                      </h2>

                      {activeForm === "move-in" && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <Label htmlFor="move-name">이름</Label>
                              <Input
                                id="move-name"
                                value={moveInData.name}
                                onChange={(e) => setMoveInData({ ...moveInData, name: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-move-name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="move-phone">연락처</Label>
                              <Input
                                id="move-phone"
                                type="tel"
                                value={moveInData.phone}
                                onChange={(e) => setMoveInData({ ...moveInData, phone: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-move-phone"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="move-email">이메일</Label>
                            <Input
                              id="move-email"
                              type="email"
                              value={moveInData.email}
                              onChange={(e) => setMoveInData({ ...moveInData, email: e.target.value })}
                              required
                              className="mt-1.5"
                              data-testid="input-move-email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="move-location">희망 지역</Label>
                            <Select
                              value={moveInData.preferredLocation}
                              onValueChange={(value) => setMoveInData({ ...moveInData, preferredLocation: value })}
                            >
                              <SelectTrigger className="mt-1.5" data-testid="select-move-location">
                                <SelectValue placeholder="선택해주세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seoul">서울</SelectItem>
                                <SelectItem value="gyeonggi">경기</SelectItem>
                                <SelectItem value="incheon">인천</SelectItem>
                                <SelectItem value="other">기타</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="move-message">문의 내용</Label>
                            <Textarea
                              id="move-message"
                              value={moveInData.message}
                              onChange={(e) => setMoveInData({ ...moveInData, message: e.target.value })}
                              placeholder="입주 관련 문의 사항을 적어주세요"
                              className="mt-1.5 min-h-32"
                              data-testid="textarea-move-message"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-move">
                            {isSubmitting ? "전송 중..." : "문의하기"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </form>
                      )}

                      {activeForm === "business" && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <Label htmlFor="biz-name">담당자명</Label>
                              <Input
                                id="biz-name"
                                value={businessData.name}
                                onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-biz-name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="biz-company">회사/기관명</Label>
                              <Input
                                id="biz-company"
                                value={businessData.company}
                                onChange={(e) => setBusinessData({ ...businessData, company: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-biz-company"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <Label htmlFor="biz-email">이메일</Label>
                              <Input
                                id="biz-email"
                                type="email"
                                value={businessData.email}
                                onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-biz-email"
                              />
                            </div>
                            <div>
                              <Label htmlFor="biz-phone">연락처</Label>
                              <Input
                                id="biz-phone"
                                type="tel"
                                value={businessData.phone}
                                onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-biz-phone"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="biz-type">문의 유형</Label>
                            <Select
                              value={businessData.inquiryType}
                              onValueChange={(value) => setBusinessData({ ...businessData, inquiryType: value })}
                            >
                              <SelectTrigger className="mt-1.5" data-testid="select-biz-type">
                                <SelectValue placeholder="선택해주세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="land">토지/건물 위탁</SelectItem>
                                <SelectItem value="public">공공사업 협력</SelectItem>
                                <SelectItem value="invest">투자 문의</SelectItem>
                                <SelectItem value="other">기타</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="biz-message">문의 내용</Label>
                            <Textarea
                              id="biz-message"
                              value={businessData.message}
                              onChange={(e) => setBusinessData({ ...businessData, message: e.target.value })}
                              placeholder="제휴 관련 문의 사항을 적어주세요"
                              className="mt-1.5 min-h-32"
                              data-testid="textarea-biz-message"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-biz">
                            {isSubmitting ? "전송 중..." : "문의하기"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </form>
                      )}

                      {activeForm === "recruit" && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <Label htmlFor="recruit-name">이름</Label>
                              <Input
                                id="recruit-name"
                                value={recruitData.name}
                                onChange={(e) => setRecruitData({ ...recruitData, name: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-recruit-name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="recruit-phone">연락처</Label>
                              <Input
                                id="recruit-phone"
                                type="tel"
                                value={recruitData.phone}
                                onChange={(e) => setRecruitData({ ...recruitData, phone: e.target.value })}
                                required
                                className="mt-1.5"
                                data-testid="input-recruit-phone"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="recruit-email">이메일</Label>
                            <Input
                              id="recruit-email"
                              type="email"
                              value={recruitData.email}
                              onChange={(e) => setRecruitData({ ...recruitData, email: e.target.value })}
                              required
                              className="mt-1.5"
                              data-testid="input-recruit-email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="recruit-position">지원 직무</Label>
                            <Select
                              value={recruitData.position}
                              onValueChange={(value) => setRecruitData({ ...recruitData, position: value })}
                            >
                              <SelectTrigger className="mt-1.5" data-testid="select-recruit-position">
                                <SelectValue placeholder="선택해주세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dev">개발/IT</SelectItem>
                                <SelectItem value="design">디자인</SelectItem>
                                <SelectItem value="pm">기획/PM</SelectItem>
                                <SelectItem value="operation">운영</SelectItem>
                                <SelectItem value="other">기타</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="recruit-message">자기소개</Label>
                            <Textarea
                              id="recruit-message"
                              value={recruitData.message}
                              onChange={(e) => setRecruitData({ ...recruitData, message: e.target.value })}
                              placeholder="간단한 자기소개와 지원 동기를 적어주세요"
                              className="mt-1.5 min-h-32"
                              data-testid="textarea-recruit-message"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-recruit">
                            {isSubmitting ? "전송 중..." : "지원하기"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </form>
                      )}

                      {activeForm === "resident-auth" && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div>
                            <Label htmlFor="resident-name">이름 (실명)</Label>
                            <Input
                              id="resident-name"
                              value={residentAuthData.name}
                              onChange={(e) => setResidentAuthData({ ...residentAuthData, name: e.target.value })}
                              required
                              className="mt-1.5"
                              placeholder="홍길동"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resident-phone">연락처</Label>
                            <Input
                              id="resident-phone"
                              type="tel"
                              value={residentAuthData.phone}
                              onChange={(e) => setResidentAuthData({ ...residentAuthData, phone: e.target.value })}
                              required
                              className="mt-1.5"
                              placeholder="010-1234-5678"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resident-unit">동/호수 정보</Label>
                            <Input
                              id="resident-unit"
                              value={residentAuthData.unitInfo}
                              onChange={(e) => setResidentAuthData({ ...residentAuthData, unitInfo: e.target.value })}
                              required
                              className="mt-1.5"
                              placeholder="예: 101동 1004호"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "전송 중..." : "인증 신청하기"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </form>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
