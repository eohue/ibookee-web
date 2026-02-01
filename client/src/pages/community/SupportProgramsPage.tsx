import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, ArrowRight, Users, Gift, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResidentProgram } from "@shared/schema";
import { ProgramApplicationModal } from "@/components/community/ProgramApplicationModal";

const programTypeIcons: Record<string, typeof Users> = {
    "small-group": Users,
    "space-sharing": Gift,
};

const programTypeBenefits: Record<string, string[]> = {
    "small-group": ["월 10만원 활동비 지원", "공용 공간 무료 이용", "홍보물 제작 지원"],
    "space-sharing": ["최대 50만원 실행 예산", "전문가 멘토링", "기획 컨설팅"],
};

export default function SupportProgramsPage() {
    const [selectedProgram, setSelectedProgram] = useState<ResidentProgram | null>(null);

    const { data: programs = [], isLoading, isError, refetch } = useQuery<ResidentProgram[]>({
        queryKey: ["/api/programs"],
    });

    const openPrograms = programs.filter((program) =>
        program.published && program.status === "open"
    );

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-12">
                        <Link href="/community">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-2">
                                Support Program
                            </p>
                            <h1 className="text-3xl font-bold">입주민 지원 프로그램</h1>
                        </div>
                    </div>

                    {isError ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                다시 시도
                            </Button>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="p-6 md:p-8">
                                    <Skeleton className="w-14 h-14 rounded-full mb-6" />
                                    <Skeleton className="h-6 w-48 mb-3" />
                                    <Skeleton className="h-4 w-full mb-6" />
                                    <Skeleton className="h-10 w-full" />
                                </Card>
                            ))}
                        </div>
                    ) : openPrograms.length === 0 ? (
                        <div className="text-center py-20 border rounded-lg">
                            <p className="text-muted-foreground">현재 모집 중인 프로그램이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {openPrograms.map((program) => {
                                const IconComponent = programTypeIcons[program.programType] || Users;
                                const defaultBenefits = programTypeBenefits[program.programType] || [];
                                return (
                                    <Card
                                        key={program.id}
                                        className="p-6 md:p-8 border-2 border-border shadow-lg hover:shadow-xl bg-card"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                                            <IconComponent className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3">
                                            {program.title}
                                        </h3>
                                        <p className="text-foreground/80 mb-6">
                                            {program.description}
                                        </p>
                                        <ul className="space-y-2 mb-6">
                                            {defaultBenefits.map((benefit, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-foreground/70">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className="w-full group"
                                            onClick={() => setSelectedProgram(program)}
                                        >
                                            신청하기
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <ProgramApplicationModal
                program={selectedProgram}
                isOpen={!!selectedProgram}
                onClose={() => setSelectedProgram(null)}
            />
        </div>
    );
}
