import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MyPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        window.location.href = "/auth";
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-5xl mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">마이페이지</h1>
                        <p className="text-gray-500 mt-2">회원 정보 및 활동 내역을 관리합니다.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Left Sidebar: Profile Summary */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-6">
                            <Card className="overflow-hidden">
                                <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                                <CardContent className="relative pt-0 pb-6 text-center">
                                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                                        <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                            {user.profileImageUrl ? (
                                                <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-12 w-12 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-14">
                                        <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {user.role === 'admin' ? '관리자' :
                                                user.role === 'resident' ? '입주민' : '일반 회원'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-0">
                                    <nav className="flex flex-col text-sm font-medium text-gray-600">
                                        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary border-l-2 border-primary">
                                            <User className="h-4 w-4" />
                                            내 프로필
                                        </a>
                                        {/* Future items */}
                                        <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 hover:text-gray-900 transition-colors pointer-events-none opacity-50">
                                            <Calendar className="h-4 w-4" />
                                            신청 내역 (준비중)
                                        </a>
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Content: Details */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>기본 정보</CardTitle>
                                    <CardDescription>회원님의 기본 정보를 확인하세요.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-gray-500">
                                                <User className="h-4 w-4" /> 이름
                                            </Label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium border border-gray-100">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-gray-500">
                                                <Mail className="h-4 w-4" /> 이메일
                                            </Label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium border border-gray-100">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-gray-500">
                                                <Phone className="h-4 w-4" /> 연락처
                                            </Label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium border border-gray-100 text-gray-400">
                                                {user.phoneNumber || '등록된 연락처가 없습니다.'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-4 w-4" /> 가입일
                                            </Label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium border border-gray-100">
                                                {new Date(user.createdAt!).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>인증 및 권한</CardTitle>
                                    <CardDescription>서비스 이용에 필요한 인증 상태입니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="space-y-1">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-gray-500" />
                                                실명 인증
                                            </h4>
                                            <p className="text-sm text-gray-500">투명한 커뮤니티 활동을 위해 실명 인증이 필요합니다.</p>
                                        </div>
                                        <div>
                                            {user.isVerified ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    인증됨
                                                </span>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled>인증하기</Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="space-y-1">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-gray-500" />
                                                입주민 인증
                                            </h4>
                                            <p className="text-sm text-gray-500">IBOOKEE 입주민 전용 혜택을 이용할 수 있습니다.</p>
                                        </div>
                                        <div>
                                            {user.role === 'admin' || user.role === 'resident' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    인증됨
                                                </span>
                                            ) : (
                                                <Button variant="secondary" size="sm" onClick={() => window.location.href = "/contact?type=resident_auth"}>
                                                    신청하기
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
