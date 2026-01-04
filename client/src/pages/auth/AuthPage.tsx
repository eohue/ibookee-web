import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
    email: z.string().email("유효한 이메일을 입력해주세요."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

type FormData = z.infer<typeof formSchema>;

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const { loginMutation, registerMutation, user } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        if (error) {
            let message = "로그인 중 오류가 발생했습니다.";
            if (error === "google_login_failed") message = "Google 로그인에 실패했습니다.";
            if (error === "naver_login_failed") message = "Naver 로그인에 실패했습니다.";
            if (error === "kakao_login_failed") message = "Kakao 로그인에 실패했습니다.";

            toast({
                title: "로그인 실패",
                description: message,
                variant: "destructive",
            });
            // Clear the query param to avoid showing toast on refresh (optional, but good UX)
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [toast]);

    if (user) {
        if (user.role === "admin") {
            setLocation("/dashboard");
        } else {
            setLocation("/");
        }
        return null;
    }

    const onSubmit = async (data: FormData) => {
        try {
            if (activeTab === "login") {
                await loginMutation.mutateAsync({
                    username: data.email, // Passport local strategy uses 'username'
                    password: data.password
                });
            } else {
                await registerMutation.mutateAsync({
                    username: data.email,
                    password: data.password
                });
            }
            // Success is handled by useAuth hook (query invalidation)
        } catch (error: any) {
            // Error is handled by useAuth hook mainly, but we can show extra toast if needed
            // The hook usually shows toast on error.
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">IBOOKEE Admin</CardTitle>
                    <CardDescription>
                        {activeTab === "login"
                            ? "관리자 계정으로 로그인해주세요"
                            : "새로운 관리자 계정을 생성합니다"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => {
                            setActiveTab(v as "login" | "register");
                            form.reset();
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">로그인</TabsTrigger>
                            <TabsTrigger value="register">회원가입</TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이메일</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>비밀번호</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    autoComplete={
                                                        activeTab === "login"
                                                            ? "current-password"
                                                            : "new-password"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loginMutation.isPending || registerMutation.isPending}
                                >
                                    {loginMutation.isPending || registerMutation.isPending
                                        ? "처리 중..."
                                        : activeTab === "login"
                                            ? "로그인"
                                            : "가입하기"}
                                </Button>
                            </form>
                        </Form>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/google"} className="w-full">
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Google로 계속하기
                            </Button>
                            <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/naver"} className="w-full bg-[#03C75A] text-white hover:bg-[#02b351] hover:text-white border-none">
                                <span className="mr-2 font-bold">N</span>
                                Naver로 계속하기
                            </Button>
                            <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/kakao"} className="w-full bg-[#FEE500] text-black hover:bg-[#e6cf00] hover:text-black border-none">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3C5.9 3 1 6.9 1 11.8c0 2.8 1.6 5.3 4.1 6.9-.1.6-.4 2.2-.4 2.3 0 .2.2.3.4.2 0 0 2.9-1.9 3.3-2.1.6.1 1.2.2 1.8.2 6.1 0 11-3.9 11-8.8C21.2 6.9 16.3 3 12 3z" />
                                </svg>
                                Kakao로 계속하기
                            </Button>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
