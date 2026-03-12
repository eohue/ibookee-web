import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { HousingRecruitment } from "@shared/schema";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
                        <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {recruitments.map((recruitment) => (
                                    <AccordionItem
                                        key={recruitment.id}
                                        value={recruitment.id.toString()}
                                        className="bg-card rounded-lg border-2 border-border/80 hover:border-primary/50 transition-all overflow-hidden"
                                    >
                                        <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]]:bg-muted/30">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full pr-4 text-left">
                                                <h3 className="text-xl font-semibold w-full md:w-auto">
                                                    {recruitment.title}
                                                </h3>
                                                <span className="text-sm text-muted-foreground font-normal shrink-0">
                                                    {recruitment.createdAt ? new Date(recruitment.createdAt).toLocaleDateString("ko-KR") : ""}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        
                                        <AccordionContent className="px-6 pb-6 pt-4 border-t bg-muted/10">
                                            <div className="space-y-6">
                                                {recruitment.content && (
                                                    <div
                                                        className="text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[100px]"
                                                        dangerouslySetInnerHTML={{ __html: recruitment.content }}
                                                    />
                                                )}

                                                {recruitment.fileUrl && (
                                                    <div className="pt-4 flex justify-end">
                                                        <a
                                                            href={recruitment.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                                                        >
                                                            공고문 보기
                                                            <ArrowRight className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
