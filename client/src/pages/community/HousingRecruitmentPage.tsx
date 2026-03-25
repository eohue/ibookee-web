import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { HousingRecruitment } from "@shared/schema";
import {
    Card,
} from "@/components/ui/card";

export default function HousingRecruitmentPage() {
    const { data: recruitments = [], isLoading } = useQuery<HousingRecruitment[]>({
        queryKey: ["/api/recruitments"],
    });

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/story">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <p className="text-primary font-medium text-sm uppercase tracking-widest">
                                Housing Recruitment
                            </p>
                            <h1 className="text-3xl font-bold">입주자 모집 공고</h1>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : recruitments.length === 0 ? (
                        <div className="text-center py-20 border rounded-lg">
                            <p className="text-muted-foreground">현재 모집 중인 공고가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recruitments.map((recruitment) => (
                                <Link href={`/story/recruitment/${recruitment.id}`} key={recruitment.id}>
                                    <Card className="overflow-hidden cursor-pointer border-2 border-border shadow-lg hover:shadow-xl transition-all bg-card h-full flex flex-col">
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-primary font-medium">입주자 모집 공고</span>
                                                <span className="text-xs text-muted-foreground">{recruitment.createdAt ? new Date(recruitment.createdAt).toLocaleDateString("ko-KR") : ""}</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 line-clamp-2">{recruitment.title}</h3>
                                            <p className="text-muted-foreground line-clamp-3 text-sm mt-auto">
                                                자세한 공고 내용과 첨부문서를 확인하려면 클릭하세요.
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
        </div>
    );
}
