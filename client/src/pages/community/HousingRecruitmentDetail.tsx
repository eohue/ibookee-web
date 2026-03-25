import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { HousingRecruitment } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, RefreshCw, ArrowRight, Home } from "lucide-react";
import type { FileAttachment } from "@/components/ui/multi-file-upload";

export default function HousingRecruitmentDetail() {
    const [, params] = useRoute("/story/recruitment/:id");
    const recruitmentId = params?.id || null;

    const { data: recruitment, isLoading, isError, refetch } = useQuery<HousingRecruitment>({
        queryKey: ["/api/admin/recruitments", recruitmentId],
        queryFn: async () => {
            const response = await fetch(`/api/admin/recruitments/${recruitmentId}`);
            if (!response.ok) throw new Error("Recruitment not found");
            return response.json();
        },
        enabled: recruitmentId !== null,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen" data-testid="page-recruitment-detail">
                <Header />
                <main className="pt-32 pb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Skeleton className="h-8 w-32 mb-8" />
                        <Skeleton className="h-10 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-1/4 mb-8" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (isError || !recruitment) {
        return (
            <div className="min-h-screen" data-testid="page-recruitment-detail">
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
                                {isError ? "데이터를 불러올 수 없습니다" : "공고를 찾을 수 없습니다"}
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

    const formattedDate = recruitment.createdAt
        ? new Date(recruitment.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    const files = (recruitment.files as FileAttachment[]) || [];

    return (
        <div className="min-h-screen" data-testid="page-recruitment-detail">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/story">
                        <Button variant="ghost" className="mb-8" data-testid="button-back">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            목록으로
                        </Button>
                    </Link>

                    <article className="bg-card rounded-xl border-2 border-border shadow-sm overflow-hidden">
                        <header className="p-8 md:p-12 border-b border-border bg-muted/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Home className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-primary font-medium text-sm uppercase tracking-widest">
                                    Housing Recruitment
                                </p>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                                {recruitment.title}
                            </h1>
                            {formattedDate && (
                                <p className="text-muted-foreground flex items-center gap-2 font-medium">
                                    {formattedDate}
                                </p>
                            )}
                        </header>

                        <div className="p-8 md:p-12">
                            {recruitment.content && (
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none mb-12"
                                    dangerouslySetInnerHTML={{ __html: recruitment.content }}
                                />
                            )}

                            {files.length > 0 && (
                                <div className="pt-8 border-t border-border mt-8">
                                    <h3 className="text-lg font-semibold mb-4">첨부 파일</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {files.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors group"
                                            >
                                                <span className="truncate font-medium text-sm sm:text-base mr-4 line-clamp-1">{file.originalName}</span>
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
