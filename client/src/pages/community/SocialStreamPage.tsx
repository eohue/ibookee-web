import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Heart, MessageCircle, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommunityPost, SocialAccount } from "@shared/schema";
import { PostDetailModal } from "@/components/community/PostDetailModal";

const defaultHashtags = [
    { id: "all", label: "전체" },
    { id: "소모임", label: "#소모임" },
    { id: "파티", label: "#파티" },
    { id: "원데이클래스", label: "#원데이클래스" },
    { id: "입주민일상", label: "#입주민일상" },
    { id: "플리마켓", label: "#플리마켓" },
];

const getYouTubeVideoId = (embedCode: string): string | null => {
    const embedMatch = embedCode.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const watchMatch = embedCode.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = embedCode.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    const shortsMatch = embedCode.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
    return null;
};

export default function SocialStreamPage() {
    const [activeHashtag, setActiveHashtag] = useState("all");
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const observerRef = useRef<HTMLDivElement>(null);

    const { data: socialAccounts = [] } = useQuery<SocialAccount[]>({
        queryKey: ["/api/social-accounts"],
    });

    const {
        data: postsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: postsLoading,
        isError: postsError,
        refetch: refetchPosts
    } = useInfiniteQuery({
        queryKey: ["/api/community-posts", activeHashtag],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams();
            params.append("page", String(pageParam));
            params.append("limit", "20");
            if (activeHashtag !== "all") {
                params.append("hashtag", activeHashtag);
            }
            const response = await fetch(`/api/community-posts?${params.toString()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json() as Promise<{ posts: CommunityPost[], total: number }>;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loadedPosts = allPages.flatMap(p => p.posts).length;
            if (loadedPosts < lastPage.total) {
                return allPages.length + 1;
            }
            return undefined;
        },
    });

    const communityPosts = useMemo(() => {
        return postsData?.pages.flatMap(page => page.posts) || [];
    }, [postsData]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allHashtags = useMemo(() => {
        const tagSet = new Set<string>();
        communityPosts.forEach(post => {
            post.hashtags?.forEach(tag => tagSet.add(tag));
        });
        const dynamicTags = Array.from(tagSet).map(tag => ({ id: tag, label: `#${tag}` }));
        const combined = [...defaultHashtags];
        dynamicTags.forEach(tag => {
            if (!combined.find(t => t.id === tag.id)) {
                combined.push(tag);
            }
        });
        return combined;
    }, [communityPosts]);

    const accountsById = useMemo(() => {
        const map: Record<string, SocialAccount> = {};
        socialAccounts.forEach(acc => { map[acc.id] = acc; });
        return map;
    }, [socialAccounts]);

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/community">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <p className="text-primary font-medium text-sm uppercase tracking-widest mb-1">
                                    Ibookee Life
                                </p>
                                <h1 className="text-3xl font-bold">소셜 스트림</h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 max-w-2xl justify-end">
                            {allHashtags.map((tag) => (
                                <Button
                                    key={tag.id}
                                    variant={activeHashtag === tag.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveHashtag(tag.id)}
                                    className="rounded-full"
                                >
                                    {tag.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {postsError ? (
                        <div className="text-center py-16">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                            <Button variant="outline" onClick={() => refetchPosts()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                다시 시도
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {communityPosts.map((post) => {
                                    const account = post.accountId ? accountsById[post.accountId] : null;
                                    return (
                                        <div
                                            key={post.id}
                                            className="group flex flex-col bg-card rounded-lg overflow-hidden border-2 border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-muted">
                                                {post.imageUrl ? (
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.caption || "Community post"}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : post.embedCode ? (
                                                    (() => {
                                                        const youtubeId = getYouTubeVideoId(post.embedCode);
                                                        if (youtubeId) {
                                                            return (
                                                                <img
                                                                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                                                    alt={post.caption || "YouTube video"}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4 text-muted-foreground bg-gray-100">
                                                                <SiInstagram className="w-8 h-8 mb-2 opacity-50" />
                                                                <span className="text-xs font-medium">View Post</span>
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                                        <span className="text-muted-foreground text-xs">No Image</span>
                                                    </div>
                                                )}

                                                {post.images && post.images.length > 1 && (
                                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md backdrop-blur-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                            <path d="M3 9h18" />
                                                            <path d="M9 21V9" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 flex flex-col flex-1 gap-3">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    {account ? (
                                                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                            {account.platform === 'instagram' && <SiInstagram className="w-3.5 h-3.5" />}
                                                            <span className="truncate max-w-[100px]">{account.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span>소셜 포스트</span>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <Heart className="w-3.5 h-3.5" />
                                                            <span>{post.likes || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                            <span>{post.commentCount || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {post.caption && (
                                                    <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed h-[2.5rem]">
                                                        {post.caption}
                                                    </p>
                                                )}

                                                {post.hashtags && post.hashtags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-auto pt-2">
                                                        {post.hashtags.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-sm">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {post.hashtags.length > 2 && (
                                                            <span className="text-[10px] text-muted-foreground px-1 py-0.5">+{post.hashtags.length - 2}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(postsLoading || isFetchingNextPage) && (
                                    [...Array(4)].map((_, i) => (
                                        <Skeleton key={`skeleton-${i}`} className="aspect-square rounded-lg" />
                                    ))
                                )}
                            </div>
                            {!postsLoading && communityPosts.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-muted-foreground">등록된 게시물이 없습니다.</p>
                                </div>
                            )}
                            <div ref={observerRef} className="h-10 w-full" />
                        </>
                    )}
                </div>
            </main>
            <Footer />
            <PostDetailModal
                post={selectedPost}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                account={selectedPost?.accountId ? accountsById[selectedPost.accountId] : null}
            />
        </div>
    );
}
