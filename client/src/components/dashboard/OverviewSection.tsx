import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    MessageSquare,
    FileText,
    CalendarDays,
    BookOpen,
    Image as ImageIcon,
    Users,
    Newspaper,
    Clock,
    CheckCircle,
    ClipboardList,
    Handshake,
    History,
    ArrowRight,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import type { Stats } from "./types";
import type { Section } from "./constants";

interface OverviewSectionProps {
    stats?: Stats;
    statsLoading: boolean;
    setActiveSection: (section: Section) => void;
}

export function OverviewSection({ stats, statsLoading, setActiveSection }: OverviewSectionProps) {
    const mainStats: { label: string; value: number; icon: any; color: string; bgColor: string; section: Section }[] = [
        {
            label: "프로젝트",
            value: stats?.projectCount || 0,
            icon: Building2,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            section: "projects"
        },
        {
            label: "인사이트",
            value: stats?.articleCount || 0,
            icon: FileText,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            section: "articles"
        },
        {
            label: "소셜 스트림",
            value: stats?.communityPostCount || 0,
            icon: ImageIcon,
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
            section: "community"
        },
        {
            label: "행사/이벤트",
            value: stats?.eventCount || 0,
            icon: CalendarDays,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            section: "events"
        },
        {
            label: "입주민 프로그램",
            value: stats?.programCount || 0,
            icon: BookOpen,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            section: "programs"
        },
        {
            label: "협력사",
            value: stats?.partnerCount || 0,
            icon: Handshake,
            color: "text-cyan-500",
            bgColor: "bg-cyan-500/10",
            section: "partners"
        },
    ];

    const userStats: { label: string; value: number; icon: any; color: string; section: Section }[] = [
        {
            label: "전체 회원",
            value: stats?.userCount || 0,
            icon: Users,
            color: "text-indigo-500",
            section: "users"
        },
        {
            label: "관리자",
            value: stats?.adminCount || 0,
            icon: Users,
            color: "text-red-500",
            section: "users"
        },
        {
            label: "입주민",
            value: stats?.residentCount || 0,
            icon: Users,
            color: "text-green-500",
            section: "users"
        },
    ];

    const pendingItems: { label: string; value: number; total?: number; icon: any; color: string; section: Section }[] = [
        {
            label: "대기 중인 기사",
            value: stats?.pendingReporterCount || 0,
            total: stats?.reporterArticleCount || 0,
            icon: Newspaper,
            color: "text-yellow-500",
            section: "reporter"
        },
        {
            label: "대기 중인 신청",
            value: stats?.pendingApplicationCount || 0,
            total: stats?.applicationCount || 0,
            icon: ClipboardList,
            color: "text-yellow-500",
            section: "programs"
        },
        {
            label: "문의 내역",
            value: stats?.inquiryCount || 0,
            icon: MessageSquare,
            color: "text-blue-500",
            section: "inquiries"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">대시보드 개요</h2>
                <p className="text-muted-foreground">
                    IBOOKEE 관리자 대시보드에 오신 것을 환영합니다.
                </p>
            </div>

            {/* Pending Items Alert */}
            {((stats?.pendingReporterCount || 0) > 0 || (stats?.pendingApplicationCount || 0) > 0) && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-5 h-5" />
                            처리 대기 항목
                        </CardTitle>
                        <CardDescription>승인 또는 검토가 필요한 항목이 있습니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {(stats?.pendingReporterCount || 0) > 0 && (
                                <Button
                                    variant="outline"
                                    className="border-yellow-500/50 hover:bg-yellow-500/10"
                                    onClick={() => setActiveSection("reporter")}
                                >
                                    <Newspaper className="w-4 h-4 mr-2 text-yellow-500" />
                                    대기 중인 기사 {stats?.pendingReporterCount}건
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                            {(stats?.pendingApplicationCount || 0) > 0 && (
                                <Button
                                    variant="outline"
                                    className="border-yellow-500/50 hover:bg-yellow-500/10"
                                    onClick={() => setActiveSection("applications")}
                                >
                                    <ClipboardList className="w-4 h-4 mr-2 text-yellow-500" />
                                    대기 중인 신청 {stats?.pendingApplicationCount}건
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Stats */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    콘텐츠 현황
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mainStats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setActiveSection(stat.section)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div className="text-3xl font-bold">
                                        {statsLoading ? "..." : stat.value}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                                        관리 <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            회원 현황
                        </CardTitle>
                        <CardDescription>등록된 회원 및 역할별 현황</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => setActiveSection(stat.section)}
                                >
                                    <div className="flex items-center gap-3">
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        <span className="font-medium">{stat.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">
                                            {statsLoading ? "..." : stat.value}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Items & Inquiries */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            처리 현황
                        </CardTitle>
                        <CardDescription>승인 대기 및 문의 관리</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => setActiveSection(item.section)}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            {item.total !== undefined && (
                                                <div className="text-xs text-muted-foreground">
                                                    전체 {item.total}건 중
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-bold ${item.value > 0 ? item.color : ''}`}>
                                            {statsLoading ? "..." : item.value}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        사이트 설정
                    </CardTitle>
                    <CardDescription>회사 정보 및 페이지 설정 관리</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2"
                            onClick={() => setActiveSection("history")}
                        >
                            <History className="w-5 h-5" />
                            <span className="text-sm">연혁 관리</span>
                            <span className="text-xs text-muted-foreground">{stats?.milestoneCount || 0}개 항목</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2"
                            onClick={() => setActiveSection("page-images")}
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-sm">페이지 이미지</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2"
                            onClick={() => setActiveSection("partners")}
                        >
                            <Handshake className="w-5 h-5" />
                            <span className="text-sm">협력사</span>
                            <span className="text-xs text-muted-foreground">{stats?.partnerCount || 0}개 기관</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2"
                            onClick={() => setActiveSection("site-settings")}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="text-sm">사이트 설정</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Reporter Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-primary" />
                        입주민 기자단 현황
                    </CardTitle>
                    <CardDescription>입주민 기자단 기사 승인 현황</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div
                            className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setActiveSection("reporter")}
                        >
                            <div className="text-3xl font-bold text-yellow-500">
                                {statsLoading ? "..." : stats?.pendingReporterCount || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">대기 중</div>
                        </div>
                        <div
                            className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setActiveSection("reporter")}
                        >
                            <div className="text-3xl font-bold text-green-500">
                                {statsLoading ? "..." : stats?.approvedReporterCount || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">승인됨</div>
                        </div>
                        <div
                            className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setActiveSection("reporter")}
                        >
                            <div className="text-3xl font-bold">
                                {statsLoading ? "..." : stats?.reporterArticleCount || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">전체</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
