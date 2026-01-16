import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, User, ShieldCheck, Mail, Phone, Calendar, ClipboardList, CheckCircle2, XCircle, Clock, Newspaper, Camera, Edit } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProgramApplication, ResidentReporter } from "@shared/schema";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";

function RealNameVerificationModal({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const mutation = useMutation({
        mutationFn: async (data: { realName: string; phoneNumber: string }) => {
            const res = await apiRequest("POST", "/api/users/verify-real-name", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({ title: "실명 인증이 완료되었습니다." });
            setOpen(false);
        },
        onError: () => {
            toast({
                title: "인증 실패",
                description: "다시 시도해주세요.",
                variant: "destructive"
            });
        }
    });

    const handleVerify = () => {
        if (!name || !phone) {
            toast({ title: "이름과 연락처를 모두 입력해주세요.", variant: "destructive" });
            return;
        }
        mutation.mutate({ realName: name, phoneNumber: phone });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>실명 인증</DialogTitle>
                    <DialogDescription>
                        원활한 서비스 이용을 위해 실명 인증을 진행해주세요.<br />
                        (현재는 테스트 모드로 입력한 정보로 즉시 인증됩니다.)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">이름</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">연락처</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleVerify} disabled={mutation.isPending}>
                        {mutation.isPending ? "인증 중..." : "인증하기"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ProfileImageUpload({ currentImageUrl, onSuccess }: { currentImageUrl?: string | null; onSuccess: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState(currentImageUrl || "");

    const mutation = useMutation({
        mutationFn: async (profileImageUrl: string) => {
            const res = await apiRequest("POST", "/api/users/profile-image", { profileImageUrl });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "프로필 사진이 업데이트되었습니다." });
            onSuccess();
            setIsOpen(false);
        },
        onError: () => {
            toast({ title: "업데이트 실패", variant: "destructive" });
        }
    });

    const handleSave = () => {
        if (!imageUrl) {
            toast({ title: "이미지를 업로드해주세요.", variant: "destructive" });
            return;
        }
        mutation.mutate(imageUrl);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105">
                    <Camera className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>프로필 사진 변경</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <ImageUpload
                        value={imageUrl}
                        onChange={(url) => setImageUrl(typeof url === 'string' ? url : url[0])}
                        maxFiles={1}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
                    <Button onClick={handleSave} disabled={mutation.isPending}>
                        {mutation.isPending ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReporterArticlesHistory() {
    const { data: articles, isLoading } = useQuery<ResidentReporter[]>({
        queryKey: ["/api/my/reporter-articles"],
    });

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> 승인됨
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> 반려됨
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        <Clock className="w-3 h-3" /> 승인대기
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5" /> 나의 기사
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" /> 나의 기사
                </CardTitle>
                <CardDescription>
                    입주민 리포터로 제보한 기사 목록입니다.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {articles && articles.length > 0 ? (
                    <div className="space-y-3">
                        {articles.map((article) => (
                            <div key={article.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 gap-4 hover:bg-muted transition-colors">
                                <div className="flex gap-4 items-start">
                                    {article.imageUrl && (
                                        <img src={article.imageUrl} alt={article.title} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                                    )}
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground truncate">{article.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(article.createdAt || "").toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{article.content?.replace(/<[^>]*>/g, '').substring(0, 50)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {getStatusBadge(article.status)}
                                    {article.status === 'pending' && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>제보한 기사가 없습니다.</p>
                        <p className="text-sm mt-1">커뮤니티 페이지에서 기사를 제보해보세요!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ApplicationHistory() {
    const { data: applications, isLoading } = useQuery<ProgramApplication[]>({
        queryKey: ["/api/my-applications"],
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> 승인됨
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> 반려됨
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        <Clock className="w-3 h-3" /> 검토중
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" /> 프로그램 신청 내역
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" /> 프로그램 신청 내역
                </CardTitle>
                <CardDescription>
                    참여 신청한 프로그램 및 입주 문의 내역입니다.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {applications && applications.length > 0 ? (
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 gap-4 hover:bg-muted transition-colors">
                                <div className="space-y-1 min-w-0">
                                    <h4 className="font-semibold text-foreground">{app.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        신청일: {new Date(app.createdAt!).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric"
                                        })}
                                    </p>
                                    {app.message && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">"{app.message}"</p>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    {getStatusBadge(app.status!)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>신청한 내역이 없습니다.</p>
                        <p className="text-sm mt-1">다양한 프로그램에 참여해보세요!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function MyPage() {
    const { user, isLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        window.location.href = "/auth";
        return null;
    }

    const handleProfileImageSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-12 md:pt-32 md:pb-20">
                <div className="container max-w-6xl mx-auto px-4">
                    {/* Hero Section */}
                    <div className="mb-10">
                        <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">
                            My Page
                        </p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">마이페이지</h1>
                        <p className="text-muted-foreground mt-3 text-lg">회원 정보 및 활동 내역을 관리합니다.</p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* Left Sidebar: Profile Summary */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Profile Card */}
                            <Card className="overflow-hidden border-0 shadow-lg">
                                <div className="h-20 lg:h-28 bg-gradient-to-br from-primary via-primary/80 to-primary/60 relative">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
                                </div>
                                <CardContent className="relative pt-0 pb-4 lg:pb-6 text-center">
                                    <div className="absolute -top-10 lg:-top-14 left-1/2 transform -translate-x-1/2">
                                        <div className="relative h-20 w-20 lg:h-28 lg:w-28 rounded-full border-4 border-background bg-background shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
                                            {user.profileImageUrl ? (
                                                <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-10 w-10 lg:h-14 lg:w-14 text-muted-foreground/50" />
                                            )}
                                            <ProfileImageUpload
                                                currentImageUrl={user.profileImageUrl}
                                                onSuccess={handleProfileImageSuccess}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-14 lg:mt-18 pt-2">
                                        <h2 className="text-xl lg:text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                                        <div className="mt-3 lg:mt-4 inline-flex items-center gap-1.5 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium bg-primary/10 text-primary">
                                            <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4" />
                                            {user.role === 'admin' ? '관리자' :
                                                user.role === 'resident' ? '입주민' : '일반 회원'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Navigation - Horizontal on mobile, Vertical on desktop */}
                            <Card className="overflow-hidden">
                                <CardContent className="p-2">
                                    <nav className="flex lg:flex-col text-sm font-medium overflow-x-auto gap-1 lg:gap-0">
                                        <a href="#profile" className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg bg-primary/10 text-primary transition-colors whitespace-nowrap shrink-0">
                                            <User className="h-4 w-4" />
                                            내 프로필
                                        </a>
                                        <a href="#articles" className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap shrink-0">
                                            <Newspaper className="h-4 w-4" />
                                            나의 기사
                                        </a>
                                        <a href="#applications" className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap shrink-0">
                                            <ClipboardList className="h-4 w-4" />
                                            신청 내역
                                        </a>
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Content: Details */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Basic Info Card */}
                            <Card id="profile">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" /> 기본 정보
                                    </CardTitle>
                                    <CardDescription>회원님의 기본 정보를 확인하세요.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <User className="h-4 w-4" /> 이름
                                            </Label>
                                            <div className="p-3.5 bg-muted/50 rounded-xl text-sm font-medium border border-border/50">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Mail className="h-4 w-4" /> 이메일
                                            </Label>
                                            <div className="p-3.5 bg-muted/50 rounded-xl text-sm font-medium border border-border/50">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Phone className="h-4 w-4" /> 연락처
                                            </Label>
                                            <div className="p-3.5 bg-muted/50 rounded-xl text-sm font-medium border border-border/50 text-muted-foreground">
                                                {user.phoneNumber || '등록된 연락처가 없습니다.'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Calendar className="h-4 w-4" /> 가입일
                                            </Label>
                                            <div className="p-3.5 bg-muted/50 rounded-xl text-sm font-medium border border-border/50">
                                                {new Date(user.createdAt!).toLocaleDateString("ko-KR", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Verification Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-primary" /> 인증 및 권한
                                    </CardTitle>
                                    <CardDescription>서비스 이용에 필요한 인증 상태입니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                                실명 인증
                                            </h4>
                                            <p className="text-sm text-muted-foreground">투명한 커뮤니티 활동을 위해 실명 인증이 필요합니다.</p>
                                        </div>
                                        <div>
                                            {user.isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> 인증됨
                                                </span>
                                            ) : (
                                                <RealNameVerificationModal>
                                                    <Button size="sm">인증하기</Button>
                                                </RealNameVerificationModal>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                                입주민 인증
                                            </h4>
                                            <p className="text-sm text-muted-foreground">IBOOKEE 입주민 전용 혜택을 이용할 수 있습니다.</p>
                                        </div>
                                        <div>
                                            {user.role === 'admin' || user.role === 'resident' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> 인증됨
                                                </span>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (!user.isVerified) {
                                                            toast({
                                                                title: "실명 인증 필요",
                                                                description: "입주민 인증 신청을 위해 먼저 실명 인증을 완료해주세요.",
                                                                variant: "destructive"
                                                            });
                                                            return;
                                                        }
                                                        window.location.href = "/contact?type=resident_auth";
                                                    }}
                                                >
                                                    신청하기
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div id="articles">
                                <ReporterArticlesHistory />
                            </div>

                            <div id="applications">
                                <ApplicationHistory />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
