import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ResidentReporter } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { ReporterSubmissionModal } from "@/components/community/ReporterSubmissionModal";

export default function ResidentReporterPage() {
    const { user } = useAuth();
    const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);

    const { data: reporterData } = useQuery<{ articles: Omit<ResidentReporter, "content">[], total: number }>({
        queryKey: ["/api/resident-reporter"],
    });

    const reporterArticles = reporterData?.articles || [];



    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <Link href="/story">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-2">
                                    Resident Reporter
                                </p>
                                <h1 className="text-3xl font-bold">입주민 기자단</h1>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <a href="/resident-reporter-guide">
                                <Button variant="ghost" className="group text-muted-foreground hover:text-primary">
                                    <Info className="w-4 h-4 mr-2" />
                                    기자단이란?
                                </Button>
                            </a>
                            {user && (
                                <Button onClick={() => setIsReporterModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    기사 제보하기
                                </Button>
                            )}
                        </div>
                    </div>

                    {reporterArticles.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground">아직 등록된 기사가 없습니다.</p>
                            <p className="text-sm text-muted-foreground mt-2">첫 번째 기사의 주인공이 되어보세요!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reporterArticles.map(article => (
                                <Link href={`/story/reporter/${article.id}`} key={article.id}>
                                    <Card className="overflow-hidden cursor-pointer border-2 border-border shadow-lg hover:shadow-xl transition-all bg-card">
                                        {article.imageUrl && (
                                            <div className="aspect-video w-full overflow-hidden relative">
                                                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                                {article.status === 'approved' && (
                                                    <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                                                        승인됨
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-primary font-medium">{article.authorName} 기자</span>
                                                <span className="text-xs text-muted-foreground">{new Date(article.postedAt || article.createdAt || "").toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 line-clamp-1">{article.title}</h3>
                                            <p className="text-muted-foreground line-clamp-3 text-sm">
                                                {"내용을 보려면 클릭하세요."}
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <ReporterSubmissionModal
                isOpen={isReporterModalOpen}
                onClose={() => setIsReporterModalOpen(false)}
            />
            <ReporterSubmissionModal
                isOpen={isReporterModalOpen}
                onClose={() => setIsReporterModalOpen(false)}
            />
        </div>
    );
}
