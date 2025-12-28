import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  FileText,
  MessageSquare,
  Users,
  Trash2,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import type { Inquiry } from "@shared/schema";

interface Stats {
  projectCount: number;
  inquiryCount: number;
  articleCount: number;
  communityPostCount: number;
}

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "로그인이 필요합니다",
        description: "관리자 페이지에 접근하려면 로그인해주세요.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "삭제 완료",
        description: "문의가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case "move-in":
        return "입주 문의";
      case "business":
        return "사업 제휴";
      case "recruit":
        return "채용 문의";
      default:
        return type;
    }
  };

  const getInquiryTypeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case "move-in":
        return "default";
      case "business":
        return "secondary";
      case "recruit":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/">
                  <Button variant="ghost" size="icon" data-testid="button-back-home">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  관리자 대시보드
                </h1>
              </div>
              {user && (
                <p className="text-muted-foreground">
                  환영합니다, {user.firstName || user.email || "관리자"}님
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-stat-projects">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  프로젝트
                </CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.projectCount || 0}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-inquiries">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  문의 내역
                </CardTitle>
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.inquiryCount || 0}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-articles">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  인사이트
                </CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.articleCount || 0}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-community">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  커뮤니티
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.communityPostCount || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              최근 문의 내역
            </h2>

            {inquiriesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                문의 내역을 불러오는 중...
              </div>
            ) : !inquiries || inquiries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  아직 접수된 문의가 없습니다.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant={getInquiryTypeVariant(inquiry.type)}>
                              {getInquiryTypeLabel(inquiry.type)}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {inquiry.createdAt
                                ? new Date(inquiry.createdAt).toLocaleDateString("ko-KR")
                                : "날짜 없음"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {inquiry.name}
                              {inquiry.company && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  ({inquiry.company})
                                </span>
                              )}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {inquiry.email}
                              </span>
                              {inquiry.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {inquiry.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {inquiry.message}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(inquiry.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-inquiry-${inquiry.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
