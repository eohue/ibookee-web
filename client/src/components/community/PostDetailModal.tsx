import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CommunityPost, SocialAccount, CommunityPostComment } from "@shared/schema";
import { Heart, MessageCircle, Send, MapPin, ExternalLink, MoreHorizontal, Bookmark, Smile } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Trash2 } from "lucide-react";
import DOMPurify from "dompurify";

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

    const { data: comments = [], isLoading: commentsLoading } = useQuery<CommunityPostComment[]>({
        queryKey: [`/api/community-posts/${post?.id}/comments`],
        enabled: !!post?.id,
    });

    const commentMutation = useMutation({
        mutationFn: async (data: { postId: string; content: string }) => {
            const res = await apiRequest("POST", `/api/community-posts/${data.postId}/comments`, {
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
        if (!commentText.trim() || !post?.id) return;
        commentMutation.mutate({ postId: post.id, content: commentText });
    };

    if (!post) return null;

    const postDate = post.postedAt ? new Date(post.postedAt) : (post.createdAt ? new Date(post.createdAt) : new Date());

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-[95vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0 sm:rounded-xl border-none outline-none bg-background">
                <DialogTitle className="sr-only">Post Detail</DialogTitle>

                {/* Left: Image Section */}
                <div className="w-full md:w-[60%] lg:w-[65%] bg-black flex items-center justify-center relative h-[45%] md:h-full shrink-0">
                    {post.embedCode ? (
                        <div
                            className="w-full h-full flex items-center justify-center overflow-hidden [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:aspect-video"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.embedCode, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] }) }}
                        />
                    ) : (post.images && post.images.length > 1) ? (
                        <Carousel className="w-full h-full">
                            <CarouselContent className="h-full">
                                {post.images.map((img, idx) => (
                                    <CarouselItem key={idx} className="flex items-center justify-center h-full p-0">
                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                            <img
                                                src={img}
                                                alt={`${post.caption || "Community post"} - ${idx + 1}`}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious
                                className="!absolute !left-4 !top-1/2 !-translate-y-1/2 z-50 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-black border-none shadow-sm transition-all opacity-70 hover:opacity-100"
                            />
                            <CarouselNext
                                className="!absolute !right-4 !top-1/2 !-translate-y-1/2 z-50 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-black border-none shadow-sm transition-all opacity-70 hover:opacity-100"
                            />
                        </Carousel>
                    ) : (
                        <img
                            src={post.images && post.images.length > 0 ? post.images[0] : (post.imageUrl || "")}
                            alt={post.caption || "Community post"}
                            className="max-h-full max-w-full object-contain"
                        />
                    )}
                </div>

                {/* Right: Content Section */}
                <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col bg-background h-[55%] md:h-full min-h-0 border-l border-border">
                    {/* Header: User Profile */}
                    <div className="p-3.5 flex items-center justify-between border-b shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-1 ring-border">
                                <AvatarImage src={account?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs bg-secondary">{account?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-center -space-y-0.5">
                                <span className="font-semibold text-sm hover:opacity-70 cursor-pointer transition-opacity">
                                    {account?.name || "ibookee"}
                                </span>
                                {post.location && (
                                    <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                                        {post.location}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* MoreHorizontal button removed - no functionality */}
                    </div>

                    {/* Scrollable Area: Caption & Comments */}
                    <ScrollArea className="flex-1 p-0">
                        <div className="p-4 space-y-5">
                            {/* Caption */}
                            <div className="flex gap-3 relative group">
                                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border mt-0.5">
                                    <AvatarImage src={account?.profileImageUrl || undefined} />
                                    <AvatarFallback className="text-xs bg-secondary">{account?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-sm pt-0.5">
                                    <div className="inline">
                                        <span className="font-semibold mr-2 hover:opacity-70 cursor-pointer transition-opacity">
                                            {account?.name || "ibookee"}
                                        </span>
                                        <span className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                                            {post.caption}
                                        </span>
                                    </div>
                                    {post.hashtags && post.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {post.hashtags.map((tag) => (
                                                <span key={tag} className="text-[#00376b] dark:text-blue-400 cursor-pointer hover:underline text-sm">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs text-muted-foreground font-medium">
                                        {formatDistanceToNow(postDate, { addSuffix: true, locale: ko })}
                                    </div>
                                </div>
                            </div>

                            {/* Comments List */}
                            {commentsLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
                                    <p className="text-xs text-muted-foreground mt-1">첫 번째 댓글을 남겨보세요.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 group">
                                            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border mt-0.5">
                                                <AvatarFallback className="text-xs">{comment.nickname.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 text-sm pt-0.5">
                                                <div className="inline">
                                                    <span className="font-semibold mr-2">{comment.nickname}</span>
                                                    <span className="text-foreground/90 leading-relaxed">{comment.content}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                                                    <span>{formatDistanceToNow(new Date(comment.createdAt || ""), { addSuffix: true, locale: ko })}</span>
                                                    {(comments.length > 0) && ( // Placeholder for reply feature
                                                        <span className="cursor-pointer hover:text-muted-foreground/80">답글 달기</span>
                                                    )}
                                                    {user?.role === 'admin' && (
                                                        <span
                                                            className="cursor-pointer text-destructive/80 hover:text-destructive ml-auto sm:ml-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                        >
                                                            삭제
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-4 w-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Heart className="w-3 h-3 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer: Actions, Likes, Date, Form */}
                    <div className="border-t bg-background shrink-0 p-3.5 pb-2">
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 hover:bg-transparent"
                                    onClick={handleLike}
                                    disabled={likeMutation.isPending}
                                >
                                    <Heart className={`w-7 h-7 transition-all hover:scale-110 active:scale-90 ${(post.likes || 0) > 0 ? "fill-red-500 text-red-500" : "text-foreground hover:text-muted-foreground"}`} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-transparent">
                                    <MessageCircle className="w-7 h-7 text-foreground hover:text-muted-foreground transition-all -rotate-90" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-transparent">
                                    <Send className="w-7 h-7 text-foreground hover:text-muted-foreground transition-all -rotate-12" />
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-transparent">
                                <Bookmark className="w-7 h-7 text-foreground hover:text-muted-foreground transition-all" />
                            </Button>
                        </div>

                        {/* Likes Count */}
                        <div className="mb-1.5 px-0.5">
                            <span className="font-semibold text-sm">좋아요 {post.likes || 0}개</span>
                        </div>

                        {/* Post Date */}
                        <div className="mb-3 px-0.5">
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                {format(postDate, "yyyy년 M월 d일")}
                            </span>
                        </div>

                        {/* Comment Form */}
                        {user ? (
                            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-3 border-t -mx-3.5 px-3.5 relative">
                                <div className="absolute top-3 left-3.5 md:left-3 cursor-pointer">
                                    <Smile className="w-6 h-6 text-foreground/80 hover:text-muted-foreground" />
                                </div>
                                <Input
                                    placeholder="댓글 달기..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="flex-1 h-10 border-none shadow-none focus-visible:ring-0 pl-8 pr-12 text-sm bg-transparent"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || commentMutation.isPending}
                                    className="absolute right-3.5 top-3 text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-default transition-colors"
                                >
                                    게시
                                </button>
                            </form>
                        ) : (
                            <div className="pt-3 border-t -mx-3.5 px-3.5 text-center">
                                <p className="text-xs text-muted-foreground py-2 cursor-pointer hover:text-primary transition-colors">
                                    로그인하고 댓글을 남겨보세요.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
