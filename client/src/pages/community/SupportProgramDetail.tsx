import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { ResidentProgram } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, RefreshCw, Users, Gift } from "lucide-react";
import { ProgramApplicationModal } from "@/components/community/ProgramApplicationModal";

const programTypeIcons: Record<string, typeof Users> = {
    "small-group": Users,
    "space-sharing": Gift,
};

const programTypeLabels: Record<string, string> = {
    "small-group": "소모임 지원 프로그램",
    "space-sharing": "공간 공유 공모전",
};

const programTypeBenefits: Record<string, string[]> = {
    "small-group": ["월 10만원 활동비 지원", "공용 공간 무료 이용", "홍보물 제작 지원"],
    "space-sharing": ["최대 50만원 실행 예산", "전문가 멘토링", "기획 컨설팅"],
};

export default function SupportProgramDetail() {
    const [, params] = useRoute("/story/programs/:id");
    const programId = params?.id || null;
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    const { data: program, isLoading, isError, refetch } = useQuery<ResidentProgram>({
        queryKey: ["/api/programs", programId],
        queryFn: async () => {
            const response = await fetch(`/api/programs/${programId}`);
            if (!response.ok) throw new Error("Program not found");
            return response.json();
        },
        enabled: programId !== null,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen" data-testid="page-program-detail">
                <Header />
                <main className="pt-32 pb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Skeleton className="h-8 w-32 mb-8" />
                        <div className="bg-card rounded-xl border border-border p-8 md:p-12 mb-8 shadow-sm">
                            <Skeleton className="w-16 h-16 rounded-full mb-6" />
                            <Skeleton className="h-10 w-3/4 mb-4" />
                            <Skeleton className="h-6 w-full mb-8" />
                            <div className="space-y-4 mb-8">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-12 w-full mt-8" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (isError || !program) {
        return (
            <div className="min-h-screen" data-testid="page-program-detail">
                <Header />
                <main className="pt-32 pb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link href="/story">
                            <Button variant="ghost" className="mb-8" data-testid="button-back">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                목록으로
                            </Button>
                        </Link>
                        <div className="text-center py-16">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {isError ? "데이터를 불러올 수 없습니다" : "프로그램을 찾을 수 없습니다"}
                            </h3>
                            <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                            {isError && (
                                <Button variant="outline" onClick={() => refetch()} data-testid="button-retry">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    다시 시도
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const IconComponent = programTypeIcons[program.programType] || Users;
    const defaultBenefits = programTypeBenefits[program.programType] || [];
    const label = programTypeLabels[program.programType] || "지원 프로그램";
    const isOpen = program.status === "open";

    return (
        <div className="min-h-screen" data-testid="page-program-detail">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/story">
                        <Button variant="ghost" className="mb-8" data-testid="button-back">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            목록으로
                        </Button>
                    </Link>

                    <article className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
                        <header className="p-8 md:p-12 border-b border-border bg-gradient-to-br from-primary/5 to-transparent relative">
                            {!isOpen && (
                                <div className="absolute top-6 right-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground shadow-sm">
                                    마감됨
                                </div>
                            )}
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 border-4 border-background shadow-sm">
                                <IconComponent className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-primary font-medium text-sm mb-2">{label}</p>
                            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                                {program.title}
                            </h1>
                            <p className="text-xl text-foreground/80 leading-relaxed max-w-2xl">
                                {program.description}
                            </p>
                        </header>

                        <div className="p-8 md:p-12">
                            <h3 className="text-xl font-bold mb-6">프로그램 혜택</h3>
                            <ul className="space-y-4 mb-12 bg-muted/30 p-8 rounded-xl border border-muted">
                                {defaultBenefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-4 text-base text-foreground/80">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                                        <span className="font-medium">{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-center pt-6 border-t border-border mt-8 gap-4">
                                {isOpen ? (
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[200px] text-lg px-8 py-6 h-auto"
                                        onClick={() => setIsApplicationModalOpen(true)}
                                    >
                                        프로그램 신청하기
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        disabled
                                        className="w-full sm:w-auto min-w-[200px] text-lg px-8 py-6 h-auto"
                                    >
                                        모집이 마감되었습니다
                                    </Button>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
            
            <ProgramApplicationModal
                program={program}
                isOpen={isApplicationModalOpen}
                onClose={() => setIsApplicationModalOpen(false)}
            />
        </div>
    );
}
