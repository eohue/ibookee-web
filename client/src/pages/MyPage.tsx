import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function MyPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        window.location.href = "/auth";
        return null;
    }

    return (
        <div className="container py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">마이페이지</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>내 프로필</CardTitle>
                        <CardDescription>기본 회원 정보를 확인합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>이름</Label>
                            <div className="p-3 bg-muted rounded-md text-sm">
                                {user.firstName} {user.lastName}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>이메일</Label>
                            <div className="p-3 bg-muted rounded-md text-sm">
                                {user.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>회원 등급</Label>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow">
                                    {user.role === 'admin' ? '관리자' :
                                        user.role === 'resident' ? '입주민' : '일반 회원'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>인증 상태</CardTitle>
                        <CardDescription>실명 인증 및 입주민 인증 현황입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>실명 인증</Label>
                            <div className="flex items-center gap-2 mt-1">
                                {user.isVerified ? (
                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                        ✓ 인증됨 ({user.realName})
                                    </span>
                                ) : (
                                    <div className="flex flex-col gap-2 w-full">
                                        <span className="text-muted-foreground text-sm">미인증 상태입니다.</span>
                                        <Button variant="outline" size="sm" disabled>
                                            실명 인증하기 (준비중)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>입주민 인증</Label>
                            <p className="text-sm text-muted-foreground">
                                현재 거주 중인 IBOOKEE 하우스가 있다면 관리자 승인 후 입주민 권한을 얻을 수 있습니다.
                            </p>
                            {user.role === 'admin' || user.role === 'resident' ? (
                                <span className="text-green-600 font-medium flex items-center gap-1 mt-2">
                                    ✓ 인증됨
                                </span>
                            ) : (
                                <Button variant="secondary" size="sm" className="mt-2" onClick={() => window.location.href = "/contact?type=resident_auth"}>
                                    입주민 인증 요청하기
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
