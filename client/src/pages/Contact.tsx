import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Home, Briefcase, Users, ArrowRight, CheckCircle, Mail, Phone, MapPin, Lock, FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { useFooterSettings } from "@/hooks/use-site-settings";
import type { Project, Inquiry } from "@shared/schema";

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

import { IbookeeSubNav } from "@/components/layout/IbookeeSubNav";

export default function Contact() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeForm, setActiveForm] = useState<FormType>("move-in");
  const [viewMode, setViewMode] = useState<"list" | "write" | "read">("list");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [page, setPage] = useState(1);

  // Read mode state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Common Form Fields
  const [commonFields, setCommonFields] = useState({
    title: "",
    password: "",
  });

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
    unitInfo: "",
  });

  const { footer: footerSettings } = useFooterSettings();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "resident_auth" || type === "resident-auth") {
      setActiveForm("resident-auth");
    }
  }, []);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects?isLive=true"],
  });

  const { data: inquiriesData, isLoading: isLoadingInquiries, refetch: refetchInquiries } = useQuery<{ inquiries: any[], total: number }>({
    queryKey: ["/api/inquiries", { type: activeForm, page, limit: 10 }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/inquiries?type=${activeForm}&page=${page}&limit=10`);
      return res.json();
    }
  });

  const verifyPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await apiRequest("POST", `/api/inquiries/${id}/verify`, { password });
      return res.json();
    },
    onSuccess: (data) => {
      setSelectedInquiry(data);
      setViewMode("read");
      setPasswordModalOpen(false);
      setInputPassword("");
      toast({ title: "비밀번호 확인 완료" });
    },
    onError: () => {
      toast({ title: "비밀번호가 일치하지 않습니다.", variant: "destructive" });
    }
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      refetchInquiries();
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
        title: commonFields.title,
        password: commonFields.password,
        name: moveInData.name,
        email: moveInData.email,
        phone: moveInData.phone,
        message: moveInData.message,
        preferredProject: moveInData.preferredLocation,
      };
    } else if (activeForm === "business") {
      data = {
        type: "business",
        title: commonFields.title,
        password: commonFields.password,
        name: businessData.name,
        email: businessData.email,
        phone: businessData.phone,
        company: businessData.company,
        message: `문의유형: ${businessData.inquiryType}\n\n${businessData.message}`,
      };
    } else if (activeForm === "recruit") {
      data = {
        type: "recruit",
        title: commonFields.title,
        password: commonFields.password,
        name: recruitData.name,
        email: recruitData.email,
        phone: recruitData.phone,
        message: `지원직무: ${recruitData.position}\n\n${recruitData.message}`,
      };
    } else {
      data = {
        type: "resident-auth",
        title: commonFields.title,
        password: commonFields.password,
        name: residentAuthData.name,
        email: "resident-auth@ibookee.kr",
        phone: residentAuthData.phone,
        message: `입주민 인증 신청: ${residentAuthData.unitInfo}`,
      }
    }

    inquiryMutation.mutate(data);
  };

  const isSubmitting = inquiryMutation.isPending;

  const resetForm = () => {
    setIsSubmitted(false);
    setCommonFields({ title: "", password: "" });
    setMoveInData({ name: "", email: "", phone: "", preferredLocation: "", message: "" });
    setBusinessData({ name: "", company: "", email: "", phone: "", inquiryType: "", message: "" });
    setRecruitData({ name: "", email: "", phone: "", position: "", message: "" });
    setResidentAuthData({ name: "", phone: "", unitInfo: "" });
  };

  const handleRowClick = (inquiry: any) => {
    if (inquiry.isSecret) {
      setVerifyingId(inquiry.id);
      setInputPassword("");
      setPasswordModalOpen(true);
    } else {
      setSelectedInquiry(inquiry);
      setViewMode("read");
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingId) return;
    verifyPasswordMutation.mutate({ id: verifyingId, password: inputPassword });
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
        <IbookeeSubNav />

        <section className="py-12 bg-background" data-testid="section-contact-info">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {viewMode === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">주소</h3>
                  <p className="text-sm text-muted-foreground">
                    {footerSettings.address}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">전화</h3>
                  <p className="text-sm text-muted-foreground">
                    {footerSettings.phone}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">이메일</h3>
                  <p className="text-sm text-muted-foreground">
                    {footerSettings.email}
                  </p>
                </Card>
              </div>
            )}

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
                        setViewMode("list");
                        setPage(1);
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
                <Card className="p-6 md:p-8 min-h-[500px]">
                  {viewMode === "list" && (
                    <div>
                      <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-xl font-semibold text-foreground">
                          {formTypes.find((t) => t.id === activeForm)?.title} 게시판
                        </h2>
                        <Button onClick={() => setViewMode("write")}>
                          <FileText className="w-4 h-4 mr-2" />
                          글쓰기
                        </Button>
                      </div>

                      <div className="space-y-0">
                        <div className="grid grid-cols-12 gap-4 py-3 border-b text-sm font-medium text-muted-foreground text-center">
                          <div className="col-span-2 hidden md:block">상태</div>
                          <div className="col-span-8 md:col-span-6 text-left">제목</div>
                          <div className="col-span-2 hidden md:block">작성자</div>
                          <div className="col-span-4 md:col-span-2">작성일</div>
                        </div>

                        {isLoadingInquiries ? (
                          <div className="py-12 text-center text-muted-foreground text-sm">
                            로딩 중...
                          </div>
                        ) : inquiriesData?.inquiries.length === 0 ? (
                          <div className="py-12 text-center text-muted-foreground text-sm">
                            등록된 내용이 없습니다.
                          </div>
                        ) : (
                          inquiriesData?.inquiries.map((inq) => (
                            <div
                              key={inq.id}
                              onClick={() => handleRowClick(inq)}
                              className="grid grid-cols-12 gap-4 py-4 border-b text-sm group cursor-pointer hover:bg-muted/30 transition-colors items-center text-center"
                            >
                              <div className="col-span-2 hidden md:block">
                                <Badge variant={inq.status === 'answered' ? 'default' : 'secondary'} className="font-normal text-[11px] px-2">
                                  {inq.status === 'answered' ? '답변완료' : '대기중'}
                                </Badge>
                              </div>
                              <div className="col-span-8 md:col-span-6 text-left font-medium flex items-center gap-2">
                                {inq.isSecret && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                <span className="truncate group-hover:text-primary transition-colors">
                                  {inq.title || "(제목 없음)"}
                                </span>
                              </div>
                              <div className="col-span-2 hidden md:block text-muted-foreground truncate">{inq.name}</div>
                              <div className="col-span-4 md:col-span-2 text-muted-foreground text-[13px]">
                                {format(new Date(inq.createdAt), "yyyy.MM.dd")}
                              </div>
                            </div>
                          ))
                        )}

                        {/* Pagination */}
                        {inquiriesData && inquiriesData.total > 0 && Math.ceil(inquiriesData.total / 10) > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              disabled={page === 1}
                            >
                              이전
                            </Button>
                            <span className="text-sm text-muted-foreground mx-2">
                              {page} / {Math.ceil(inquiriesData.total / 10)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(p => Math.min(Math.ceil(inquiriesData.total / 10), p + 1))}
                              disabled={page >= Math.ceil(inquiriesData.total / 10)}
                            >
                              다음
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === "read" && selectedInquiry && (
                    <div>
                      <Button variant="ghost" className="mb-6 -ml-4" onClick={() => {
                        setSelectedInquiry(null);
                        setViewMode("list");
                      }}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        목록으로
                      </Button>

                      <div className="border-b pb-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={selectedInquiry.status === "answered" ? "default" : "secondary"}>
                            {selectedInquiry.status === "answered" ? "답변완료" : "답변 대기중"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(selectedInquiry.createdAt || new Date()), "yyyy-MM-dd HH:mm")}
                          </span>
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">
                          {selectedInquiry.title}
                        </h2>
                        <div className="flex gap-4 text-sm text-muted-foreground bg-muted/20 p-3 rounded flex-wrap">
                          <div><span className="font-medium mr-1 text-foreground">작성자:</span> {selectedInquiry.name}</div>
                          {selectedInquiry.preferredProject &&
                            <div className="text-primary font-medium"><span className="text-foreground mr-1">희망 주택:</span> {selectedInquiry.preferredProject}</div>
                          }
                        </div>
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed min-h-[150px] text-[15px]">
                        {selectedInquiry.message}
                      </div>

                      {selectedInquiry.answer && (
                        <div className="mt-8 bg-muted/40 rounded-xl p-6 border text-[15px]">
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                              A
                            </div>
                            <div>
                              <div className="font-semibold">아이부키 담당자</div>
                              <div className="text-xs text-muted-foreground">
                                {selectedInquiry.answeredAt ? format(new Date(selectedInquiry.answeredAt), "yyyy-MM-dd HH:mm") : ""}
                              </div>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {selectedInquiry.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {viewMode === "write" && (
                    <>
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
                          <Button onClick={() => setViewMode("list")} variant="outline">
                            목록으로 돌아가기
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-6">
                            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setViewMode("list")}>
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <h2 className="text-xl font-semibold text-foreground">
                              {formTypes.find((t) => t.id === activeForm)?.title} 양식
                            </h2>
                          </div>

                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-5 border rounded-lg bg-muted/20 space-y-5">
                              <h3 className="font-medium text-sm text-primary flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                게시물 비밀번호 설정
                              </h3>
                              <div>
                                <Label htmlFor="common-title">제목 <span className="text-red-500">*</span></Label>
                                <Input
                                  id="common-title"
                                  value={commonFields.title}
                                  onChange={(e) => setCommonFields({ ...commonFields, title: e.target.value })}
                                  required
                                  className="mt-1.5"
                                  placeholder="문의 제목을 입력해주세요"
                                />
                              </div>
                              <div>
                                <Label htmlFor="common-password">비밀번호 <span className="text-red-500">*</span></Label>
                                <Input
                                  id="common-password"
                                  type="password"
                                  value={commonFields.password}
                                  onChange={(e) => setCommonFields({ ...commonFields, password: e.target.value })}
                                  required
                                  className="mt-1.5 max-w-sm"
                                  placeholder="나의 문의 내역을 확인할 때 필요합니다"
                                />
                                <p className="text-xs text-muted-foreground mt-2">이 게시판의 모든 문의는 비밀글로 등록되어 본인과 관리자만 열람 가능합니다.</p>
                              </div>
                            </div>

                            <div className="border-t pt-6" />

                            {activeForm === "move-in" && (
                              <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <Label htmlFor="move-name">이름 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="move-name"
                                      value={moveInData.name}
                                      onChange={(e) => setMoveInData({ ...moveInData, name: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="move-phone">연락처 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="move-phone"
                                      type="tel"
                                      value={moveInData.phone}
                                      onChange={(e) => setMoveInData({ ...moveInData, phone: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="move-email">이메일 <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="move-email"
                                    type="email"
                                    value={moveInData.email}
                                    onChange={(e) => setMoveInData({ ...moveInData, email: e.target.value })}
                                    required
                                    className="mt-1.5"
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
                                      {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.title}>
                                          {project.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="move-message">문의 내용 <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    id="move-message"
                                    value={moveInData.message}
                                    onChange={(e) => setMoveInData({ ...moveInData, message: e.target.value })}
                                    placeholder="입주 관련 문의 사항을 적어주세요"
                                    className="mt-1.5 min-h-32"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {activeForm === "business" && (
                              <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <Label htmlFor="biz-name">담당자명 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="biz-name"
                                      value={businessData.name}
                                      onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="biz-company">회사/기관명 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="biz-company"
                                      value={businessData.company}
                                      onChange={(e) => setBusinessData({ ...businessData, company: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <Label htmlFor="biz-email">이메일 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="biz-email"
                                      type="email"
                                      value={businessData.email}
                                      onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="biz-phone">연락처 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="biz-phone"
                                      type="tel"
                                      value={businessData.phone}
                                      onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                      required
                                      className="mt-1.5"
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
                                  <Label htmlFor="biz-message">문의 내용 <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    id="biz-message"
                                    value={businessData.message}
                                    onChange={(e) => setBusinessData({ ...businessData, message: e.target.value })}
                                    placeholder="제휴 관련 문의 사항을 적어주세요"
                                    className="mt-1.5 min-h-32"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {activeForm === "recruit" && (
                              <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <Label htmlFor="recruit-name">이름 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="recruit-name"
                                      value={recruitData.name}
                                      onChange={(e) => setRecruitData({ ...recruitData, name: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="recruit-phone">연락처 <span className="text-red-500">*</span></Label>
                                    <Input
                                      id="recruit-phone"
                                      type="tel"
                                      value={recruitData.phone}
                                      onChange={(e) => setRecruitData({ ...recruitData, phone: e.target.value })}
                                      required
                                      className="mt-1.5"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="recruit-email">이메일 <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="recruit-email"
                                    type="email"
                                    value={recruitData.email}
                                    onChange={(e) => setRecruitData({ ...recruitData, email: e.target.value })}
                                    required
                                    className="mt-1.5"
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
                                  <Label htmlFor="recruit-message">자기소개 <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    id="recruit-message"
                                    value={recruitData.message}
                                    onChange={(e) => setRecruitData({ ...recruitData, message: e.target.value })}
                                    placeholder="간단한 자기소개와 지원 동기를 적어주세요"
                                    className="mt-1.5 min-h-32"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {activeForm === "resident-auth" && (
                              <div className="space-y-5">
                                <div>
                                  <Label htmlFor="resident-name">이름 (실명) <span className="text-red-500">*</span></Label>
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
                                  <Label htmlFor="resident-phone">연락처 <span className="text-red-500">*</span></Label>
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
                                  <Label htmlFor="resident-unit">동/호수 정보 <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="resident-unit"
                                    value={residentAuthData.unitInfo}
                                    onChange={(e) => setResidentAuthData({ ...residentAuthData, unitInfo: e.target.value })}
                                    required
                                    className="mt-1.5"
                                    placeholder="예: 101동 1004호"
                                  />
                                </div>
                              </div>
                            )}

                            <Button type="submit" className="w-full mt-6" disabled={isSubmitting} size="lg">
                              {isSubmitting ? "전송 중..." : "등록하기"}
                              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                          </form>
                        </>
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

      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 확인</DialogTitle>
            <DialogDescription>
              작성자 본인만 확인할 수 있는 비밀글입니다. 작성 시 입력하신 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyPassword} className="space-y-4 pt-4">
            <div>
              <Input
                type="password"
                placeholder="비밀번호"
                required
                value={inputPassword}
                onChange={e => setInputPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPasswordModalOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={verifyPasswordMutation.isPending}>
                {verifyPasswordMutation.isPending ? "확인 중..." : "확인"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
