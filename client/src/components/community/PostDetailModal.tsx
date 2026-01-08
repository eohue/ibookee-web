import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CommunityPost, SocialAccount, CommunityPostComment } from "@shared/schema";
import { Heart, MessageCircle, Send, MapPin, ExternalLink } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Trash2 } from "lucide-react";

interface PostDetailModalProps {
    post: CommunityPost | null;
    isOpen: boolean;
    onClose: () => void;
    account?: SocialAccount | null;
}

export function PostDetailModal({ post, isOpen, onClose, account }: PostDetailModalProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();
    const [commentText, setCommentText] = useState("");
    const [nickname, setNickname] = useState("");

    const { data: comments = [], isLoading: commentsLoading } = useQuery<CommunityPostComment[]>({
        queryKey: [`/api/community-posts/${post?.id}/comments`],
        enabled: !!post?.id,
    });

    const commentMutation = useMutation({
        mutationFn: async (data: { postId: string; nickname: string; content: string }) => {
            const res = await apiRequest("POST", `/api/community-posts/${data.postId}/comments`, {
                nickname: data.nickname,
                content: data.content
            });
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [`/api/community-posts/${variables.postId}/comments`] });
            setCommentText("");
            toast({ title: "댓글이 등록되었습니다." });
        },
        onError: (error: Error) => {
            toast({
                title: "댓글 등록 실패",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await apiRequest("DELETE", `/api/community-posts/${post?.id}/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/community-posts/${post?.id}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] }); // to update comment count on lists if needed
            toast({ title: "댓글이 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "댓글 삭제 실패", variant: "destructive" });
        }
    });

    const likeMutation = useMutation({
        mutationFn: async () => {
            if (!post?.id) return;
            await apiRequest("POST", `/api/community-posts/${post.id}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
            // Optimistic update could be better, but invalidation is safer for now
        }
    });

    const handleLike = () => {
        likeMutation.mutate();
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !nickname.trim() || !post?.id) return;
        commentMutation.mutate({ postId: post.id, nickname, content: commentText });
    };

    if (!post) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden h-[80vh] flex flex-col md:flex-row gap-0">
                <DialogTitle className="sr-only">Post Detail</DialogTitle>
                {/* Left: Image */}
                <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative">
                    <img
                        src={post.imageUrl || ""}
                        alt={post.caption || "Community post"}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                {/* Right: Content & Comments */}
                <div className="w-full md:w-2/5 flex flex-col bg-background h-full max-h-[50vh] md:max-h-full">
                    {/* Header */}
                    <div className="p-4 flex items-center border-b shrink-0">
                        <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={account?.profileImageUrl || undefined} />
                            <AvatarFallback>{account?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{account?.name || "Anonymous"}</p>
                            {post.location && (
                                <p className="text-xs text-muted-foreground flex items-center truncate">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {post.location}
                                </p>
                            )}
                        </div>
                        {post.sourceUrl && (
                            <Button variant="ghost" size="icon" onClick={() => window.open(post.sourceUrl!, '_blank')} title="Original Post">
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Scrollable Area: Caption + Comments */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {/* Caption */}
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src={account?.profileImageUrl || undefined} />
                                    <AvatarFallback>{account?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <span className="font-semibold mr-2">{account?.name || "Anonymous"}</span>
                                    <span className="whitespace-pre-wrap">{post.caption}</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {post.hashtags?.map((tag) => (
                                            <span key={tag} className="text-blue-500">#{tag}</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {post.postedAt ? formatDistanceToNow(new Date(post.postedAt), { addSuffix: true, locale: ko }) :
                                            formatDistanceToNow(new Date(post.createdAt || ""), { addSuffix: true, locale: ko })}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Comments List */}
                            <div className="space-y-4">
                                {commentsLoading ? (
                                    <p className="text-sm text-muted-foreground text-center">댓글을 불러오는 중...</p>
                                ) : comments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">아직 댓글이 없습니다.</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 group">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarFallback>{comment.nickname.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 text-sm">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="font-semibold mr-2">{comment.nickname}</span>
                                                        <span>{comment.content}</span>
                                                    </div>
                                                    {user?.role === 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDistanceToNow(new Date(comment.createdAt || ""), { addSuffix: true, locale: ko })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer: Stats & Comment Form */}
                    <div className="border-t p-4 shrink-0 bg-background z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 hover:bg-transparent"
                                onClick={handleLike}
                                disabled={likeMutation.isPending}
                            >
                                <div className="flex items-center gap-1">
                                    <Heart className={`w-6 h-6 ${(post.likes || 0) > 0 ? "fill-red-500 text-red-500" : ""}`} />
                                    <span className="font-semibold text-sm">{post.likes || 0}</span>
                                </div>
                            </Button>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-6 h-6" />
                                <span className="font-semibold text-sm">{post.commentCount || 0}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                            <Input
                                placeholder="닉네임"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="h-8 text-sm"
                                required
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="댓글 달기..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="flex-1 h-9 text-sm"
                                    required
                                />
                                <Button type="submit" size="sm" disabled={!commentText.trim() || !nickname.trim() || commentMutation.isPending}>
                                    게시
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
