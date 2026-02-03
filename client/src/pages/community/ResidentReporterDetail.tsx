import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, MessageSquare, Send, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import type { ResidentReporter, ResidentReporterComment } from "@shared/schema";

export default function ResidentReporterDetail() {
    const [, params] = useRoute("/story/reporter/:id");
    const articleId = params?.id;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [comment, setComment] = useState("");
    const [htmlContent, setHtmlContent] = useState("");

    const { data: article, isLoading, isError, refetch } = useQuery<ResidentReporter>({
        queryKey: ["/api/resident-reporter", articleId],
        queryFn: async () => {
            if (!articleId) throw new Error("No article ID");
            const res = await fetch(`/api/resident-reporter/${articleId}`);
            if (!res.ok) throw new Error("Failed to fetch article");
            return res.json();
        },
        enabled: !!articleId,
    });

    useEffect(() => {
        const parseMarkdown = async () => {
            if (article?.content) {
                const parsed = await marked.parse(article.content);
                setHtmlContent(parsed);
            } else {
                setHtmlContent("");
            }
        };
        parseMarkdown();
    }, [article?.content]);

    // Fetch comments
    const { data: comments = [] } = useQuery<ResidentReporterComment[]>({
        queryKey: [`/api/resident-reporter/${articleId}/comments`],
        enabled: !!articleId,
    });

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            if (!articleId) return;
            await apiRequest("POST", `/api/resident-reporter/${articleId}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter", articleId] }); // Update local article
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] }); // Update list
        },
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!articleId) return;
            await apiRequest("POST", `/api/resident-reporter/${articleId}/comments`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/resident-reporter/${articleId}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] });
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter", articleId] }); // Update whatever needs it
            setComment("");
            toast({
                title: "댓글 등록 완료",
                description: "댓글이 성공적으로 등록되었습니다.",
            });
        },
        onError: () => {
            toast({
                title: "댓글 등록 실패",
                description: "댓글 등록 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            if (!articleId) return;
            await apiRequest("DELETE", `/api/resident-reporter/${articleId}/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/resident-reporter/${articleId}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] });
            toast({
                title: "삭제 완료",
                description: "댓글이 삭제되었습니다.",
            });
        },
    });

    const handleLike = () => {
        likeMutation.mutate();
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        commentMutation.mutate(comment);
    };

    const timeAgo = (dateStr: string | Date | null) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "방금 전";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        return `${Math.floor(diffInSeconds / 86400)}일 전`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="pt-32 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Skeleton className="h-8 w-32 mb-8" />
                        <Skeleton className="aspect-video w-full rounded-lg mb-8" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (isError || !article) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="pt-32 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link href="/story/reporter">
                            <Button variant="ghost" className="mb-8">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                목록으로
                            </Button>
                        </Link>
                        <div className="text-center py-16">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">기사를 불러올 수 없습니다</h3>
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                다시 시도
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/story/reporter">
                        <Button variant="ghost" className="mb-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            목록으로
                        </Button>
                    </Link>

                    <article>
                        <header className="mb-8">
                            <div className="flex items-center gap-2 mb-3">
                                {article.status === 'approved' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        승인됨
                                    </span>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    {new Date(article.createdAt || "").toLocaleDateString("ko-KR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {article.authorName} 기자
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {article.imageUrl && (
                            <div className="mb-10 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/5">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        <div
                            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-xl mb-12"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(htmlContent, {
                                    ADD_TAGS: ['iframe'],
                                    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                                })
                            }}
                        />

                        <div className="flex items-center justify-center py-8 border-t border-b mb-12">
                            <Button
                                variant="outline"
                                size="lg"
                                className={`gap-2 rounded-full px-8 h-12 transition-all ${likeMutation.isPending ? 'opacity-70' : ''}`}
                                onClick={handleLike}
                                disabled={likeMutation.isPending}
                            >
                                <Heart className={`w-5 h-5 ${article.likes ? "fill-red-500 text-red-500" : ""}`} />
                                <span className="font-medium">좋아요 {article.likes || 0}</span>
                            </Button>
                        </div>

                        {/* Comments Section */}
                        <div className="max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                댓글 <span className="text-primary">{comments.length}</span>
                            </h3>

                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-10">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.profileImageUrl || ""} />
                                        <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-3">
                                        <Input
                                            placeholder="댓글을 남겨주세요..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="h-10"
                                        />
                                        <Button type="submit" disabled={!comment.trim() || commentMutation.isPending}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center p-6 mb-10 bg-muted/30 rounded-lg">
                                    <p className="text-muted-foreground">댓글을 작성하려면 로그인이 필요합니다.</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {comments.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{item.nickname[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-foreground">{item.nickname}</span>
                                                    <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                                                </div>
                                                {user?.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => deleteCommentMutation.mutate(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        첫 번째 댓글을 남겨보세요.
                                    </div>
                                )}
                            </div>
                        </div>

                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
