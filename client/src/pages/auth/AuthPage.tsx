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

const loginSchema = z.object({
    email: z.string().email("유효한 이메일을 입력해주세요."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

const registerSchema = z.object({
    email: z.string().email("유효한 이메일을 입력해주세요."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
    realName: z.string().min(2, "이름(실명)은 최소 2자 이상이어야 합니다."),
    nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다."),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const { loginMutation, registerMutation, user } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            realName: "",
            nickname: "",
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

    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            await loginMutation.mutateAsync({
                username: data.email,
                password: data.password
            });
        } catch (error: any) {
            // Error is handled by useAuth hook
        }
    };

    const onRegisterSubmit = async (data: RegisterFormData) => {
        try {
            await registerMutation.mutateAsync({
                username: data.email,
                password: data.password,
                realName: data.realName,
                nickname: data.nickname
            });
        } catch (error: any) {
            // Error is handled by useAuth hook
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
                            loginForm.reset();
                            registerForm.reset();
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">로그인</TabsTrigger>
                            <TabsTrigger value="register">회원가입</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                    <FormField
                                        control={loginForm.control}
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
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>비밀번호</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="••••••••"
                                                        type="password"
                                                        autoComplete="current-password"
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
                                        disabled={loginMutation.isPending}
                                    >
                                        {loginMutation.isPending ? "처리 중..." : "로그인"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register">
                            <Form {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                    <FormField
                                        control={registerForm.control}
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
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>비밀번호</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="••••••••"
                                                        type="password"
                                                        autoComplete="new-password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="realName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>이름 (실명)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="홍길동"
                                                        type="text"
                                                        autoComplete="name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="nickname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>닉네임</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="멋진닉네임"
                                                        type="text"
                                                        autoComplete="nickname"
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
                                        disabled={registerMutation.isPending}
                                    >
                                        {registerMutation.isPending ? "처리 중..." : "가입하기"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>


                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
