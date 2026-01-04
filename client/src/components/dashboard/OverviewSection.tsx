import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MessageSquare, FileText, CalendarDays, BookOpen, Image as ImageIcon } from "lucide-react";
import type { Stats } from "./types";

interface OverviewSectionProps {
    stats?: Stats;
    statsLoading: boolean;
}

export function OverviewSection({ stats, statsLoading }: OverviewSectionProps) {
    const statCards = [
        { label: "프로젝트", value: stats?.projectCount || 0, icon: Building2 },
        { label: "문의 내역", value: stats?.inquiryCount || 0, icon: MessageSquare },
        { label: "인사이트", value: stats?.articleCount || 0, icon: FileText },
        { label: "행사", value: stats?.eventCount || 0, icon: CalendarDays },
        { label: "프로그램", value: stats?.programCount || 0, icon: BookOpen },
        { label: "커뮤니티", value: stats?.communityPostCount || 0, icon: ImageIcon },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} data-testid={`card-stat-${stat.label}`}>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statsLoading ? "..." : stat.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
