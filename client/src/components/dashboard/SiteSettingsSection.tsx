import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SiteSetting } from "@shared/schema";
import type { CompanyStats, FooterSettings, CeoMessage } from "./types";

export function SiteSettingsSection() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"stats" | "footer" | "ceo">("stats");

    const { data: settings, isLoading } = useQuery<SiteSetting[]>({
        queryKey: ["/api/admin/settings"],
    });

    const updateMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: any }) => {
            return apiRequest("PUT", `/api/admin/settings/${key}`, { value });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
            toast({ title: "설정이 저장되었습니다" });
        },
        onError: () => {
            toast({ title: "설정 저장 실패", variant: "destructive" });
        },
    });

    const getSetting = (key: string): any => {
        const setting = settings?.find(s => s.key === key);
        return setting?.value || null;
    };

    const defaultStats: CompanyStats = {
        projectCount: { value: "32+", label: "프로젝트" },
        householdCount: { value: "2,500+", label: "세대" },
        yearsInBusiness: { value: "13", label: "년" },
        awardCount: { value: "15+", label: "수상" },
    };

    const defaultFooter: FooterSettings = {
        companyName: "(주)아이부키",
        address: "서울시 성동구 왕십리로 115 헤이그라운드 서울숲점 G409",
        phone: "02-6352-5730",
        email: "hello@ibookee.kr",
        businessNumber: "110-81-77570",
        copyright: "2024 IBOOKEE. All rights reserved.",
    };

    const defaultCeo: CeoMessage = {
        title: "CEO 인사말",
        ceoName: "",
        quote: "주거는 상품이 아니라, 지속 가능한 삶을 담는 그릇이어야 합니다.",
        paragraphs: [
            "아이부키는 사회주택 전문 기업으로서 주거 취약계층의 주거 안정과 삶의 질 향상을 위해 노력하고 있습니다.",
            "우리는 단순히 집을 짓는 것이 아닌, 커뮤니티를 만들고 이웃과 함께하는 삶의 가치를 실현합니다.",
        ],
        signature: "아이부키 대표",
    };

    const handleStatsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const stats: CompanyStats = {
            projectCount: { value: formData.get("projectValue") as string, label: formData.get("projectLabel") as string },
            householdCount: { value: formData.get("householdValue") as string, label: formData.get("householdLabel") as string },
            yearsInBusiness: { value: formData.get("yearsValue") as string, label: formData.get("yearsLabel") as string },
            awardCount: { value: formData.get("awardValue") as string, label: formData.get("awardLabel") as string },
        };
        updateMutation.mutate({ key: "company_stats", value: stats });
    };

    const handleFooterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const footer: FooterSettings = {
            companyName: formData.get("companyName") as string,
            address: formData.get("address") as string,
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
            businessNumber: formData.get("businessNumber") as string,
            copyright: formData.get("copyright") as string,
        };
        updateMutation.mutate({ key: "footer_settings", value: footer });
    };

    const handleCeoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const paragraphsText = formData.get("paragraphs") as string;
        const ceo: CeoMessage = {
            title: formData.get("title") as string,
            ceoName: formData.get("ceoName") as string,
            quote: formData.get("quote") as string,
            paragraphs: paragraphsText.split("\n").filter(p => p.trim()),
            signature: formData.get("signature") as string,
        };
        updateMutation.mutate({ key: "ceo_message", value: ceo });
    };

    const currentStats = getSetting("company_stats") || defaultStats;
    const currentFooter = getSetting("footer_settings") || defaultFooter;
    const currentCeo = getSetting("ceo_message") || defaultCeo;

    if (isLoading) {
        return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">사이트 설정</h2>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === "stats" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("stats")}
                        data-testid="tab-stats"
                    >
                        회사 성과
                    </Button>
                    <Button
                        variant={activeTab === "footer" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("footer")}
                        data-testid="tab-footer"
                    >
                        푸터 정보
                    </Button>
                    <Button
                        variant={activeTab === "ceo" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("ceo")}
                        data-testid="tab-ceo"
                    >
                        CEO 메시지
                    </Button>
                </div>
            </div>

            {activeTab === "stats" && (
                <Card>
                    <CardHeader>
                        <CardTitle>회사 성과 지표</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleStatsSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>프로젝트 수</Label>
                                    <div className="flex gap-2">
                                        <Input name="projectValue" defaultValue={currentStats.projectCount?.value} placeholder="32+" data-testid="input-stats-project-value" />
                                        <Input name="projectLabel" defaultValue={currentStats.projectCount?.label} placeholder="프로젝트" data-testid="input-stats-project-label" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>세대 수</Label>
                                    <div className="flex gap-2">
                                        <Input name="householdValue" defaultValue={currentStats.householdCount?.value} placeholder="2,500+" data-testid="input-stats-household-value" />
                                        <Input name="householdLabel" defaultValue={currentStats.householdCount?.label} placeholder="세대" data-testid="input-stats-household-label" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>업력</Label>
                                    <div className="flex gap-2">
                                        <Input name="yearsValue" defaultValue={currentStats.yearsInBusiness?.value} placeholder="13" data-testid="input-stats-years-value" />
                                        <Input name="yearsLabel" defaultValue={currentStats.yearsInBusiness?.label} placeholder="년" data-testid="input-stats-years-label" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>수상 실적</Label>
                                    <div className="flex gap-2">
                                        <Input name="awardValue" defaultValue={currentStats.awardCount?.value} placeholder="15+" data-testid="input-stats-award-value" />
                                        <Input name="awardLabel" defaultValue={currentStats.awardCount?.label} placeholder="수상" data-testid="input-stats-award-label" />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-stats">
                                저장
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeTab === "footer" && (
                <Card>
                    <CardHeader>
                        <CardTitle>푸터 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFooterSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">회사명</Label>
                                <Input id="companyName" name="companyName" defaultValue={currentFooter.companyName} data-testid="input-footer-company" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">주소</Label>
                                <Input id="address" name="address" defaultValue={currentFooter.address} data-testid="input-footer-address" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">전화번호</Label>
                                    <Input id="phone" name="phone" defaultValue={currentFooter.phone} data-testid="input-footer-phone" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">이메일</Label>
                                    <Input id="email" name="email" defaultValue={currentFooter.email} data-testid="input-footer-email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessNumber">사업자등록번호</Label>
                                <Input id="businessNumber" name="businessNumber" defaultValue={currentFooter.businessNumber} data-testid="input-footer-business" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="copyright">저작권 문구</Label>
                                <Input id="copyright" name="copyright" defaultValue={currentFooter.copyright} data-testid="input-footer-copyright" />
                            </div>
                            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-footer">
                                저장
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeTab === "ceo" && (
                <Card>
                    <CardHeader>
                        <CardTitle>CEO 메시지</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCeoSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">제목</Label>
                                <Input id="title" name="title" defaultValue={currentCeo.title} data-testid="input-ceo-title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ceoName">CEO 이름</Label>
                                <Input id="ceoName" name="ceoName" defaultValue={currentCeo.ceoName} placeholder="홍길동" data-testid="input-ceo-name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quote">강조 문구 (슬로건)</Label>
                                <Textarea
                                    id="quote"
                                    name="quote"
                                    rows={2}
                                    defaultValue={currentCeo.quote}
                                    placeholder="주거는 상품이 아니라..."
                                    data-testid="input-ceo-quote"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paragraphs">본문 (줄바꿈으로 문단 구분)</Label>
                                <Textarea
                                    id="paragraphs"
                                    name="paragraphs"
                                    rows={6}
                                    defaultValue={currentCeo.paragraphs?.join("\n") || ""}
                                    data-testid="input-ceo-paragraphs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signature">서명</Label>
                                <Input id="signature" name="signature" defaultValue={currentCeo.signature} data-testid="input-ceo-signature" />
                            </div>
                            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-ceo">
                                저장
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
