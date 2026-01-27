import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResidentReporter, ResidentReporterComment } from "@shared/schema";
import { X, Heart, MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { marked } from "marked";
import { useEffect } from "react";

interface ReporterArticleModalProps {
    article: (ResidentReporter | (Omit<ResidentReporter, "content"> & { content?: string })) | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ReporterArticleModal({ article, isOpen, onClose }: ReporterArticleModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const { user } = useAuth();

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
        queryKey: [`/api/resident-reporter/${article?.id}/comments`],
        enabled: !!article?.id && isOpen,
    });

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            if (!article) return;
            await apiRequest("POST", `/api/resident-reporter/${article.id}/like`);
        },
        onSuccess: () => {
            // Invalidate list to update like count on card if needed, 
            // but mainly we want to update the local article state or refetch the list that provided the article.
            // Since 'article' prop comes from parent, we might need to invalidate the parent query.
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] });
            queryClient.invalidateQueries({ queryKey: ["/api/my/reporter-articles"] });
            // Also if we want live update in modal, we might need to fetch single article or rely on parent update.
        },
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!article) return;
            await apiRequest("POST", `/api/resident-reporter/${article.id}/comments`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/resident-reporter/${article?.id}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] }); // Update comment count on list
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
            if (!article) return;
            await apiRequest("DELETE", `/api/resident-reporter/${article.id}/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/resident-reporter/${article?.id}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] });
            toast({
                title: "삭제 완료",
                description: "댓글이 삭제되었습니다.",
            });
        },
    });

    if (!article) return null;

    const handleLike = () => {
        likeMutation.mutate();
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        commentMutation.mutate(comment);
    };

    // Calculate time ago
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden flex flex-col bg-background">
                <DialogHeader className="p-6 pb-4 shrink-0 border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                                {article.status === 'approved' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        승인됨
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {new Date(article.createdAt || "").toLocaleDateString("ko-KR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </span>
                            </div>

                            <DialogTitle className="text-2xl font-bold leading-tight mb-2">
                                {article.title}
                            </DialogTitle>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm text-foreground">
                                        {article.authorName} 기자
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0 bg-secondary/5">
                    <div className="max-w-2xl mx-auto px-6 py-8">
                        {article.imageUrl && (
                            <div className="mb-8 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/5">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        <div
                            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        <div className="mt-12 pt-8 border-t flex items-center justify-center">
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
                    </div>

                    <div className="max-w-2xl mx-auto px-6 pb-12">
                        <div className="bg-background rounded-xl border p-6 shadow-sm">
                            <h3 className="font-bold mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                댓글 <span className="text-primary">{comments.length}</span>
                            </h3>

                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-8">
                                    <Avatar className="h-9 w-9 mt-0.5">
                                        <AvatarImage src={user?.profileImageUrl || ""} />
                                        <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            placeholder="댓글을 남겨주세요..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={!comment.trim() || commentMutation.isPending}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center p-4 mb-8 bg-muted/30 rounded-lg">
                                    <p className="text-sm text-muted-foreground">댓글을 작성하려면 로그인이 필요합니다.</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {comments.map((item) => (
                                    <div key={item.id} className="flex gap-3 group">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{item.nickname[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{item.nickname}</span>
                                                    <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                                                </div>
                                                {user?.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => deleteCommentMutation.mutate(item.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        첫 번째 댓글을 남겨보세요.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
