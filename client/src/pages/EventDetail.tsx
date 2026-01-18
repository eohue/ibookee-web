import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Event } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, MapPin, Clock, AlertCircle, RefreshCw } from "lucide-react";

const statusLabels: Record<string, string> = {
    upcoming: "예정",
    ongoing: "진행중",
    completed: "종료",
};

const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500",
    ongoing: "bg-green-500",
    completed: "bg-gray-500",
};

export default function EventDetail() {
    const [, params] = useRoute("/community/event/:id");
    const eventId = params?.id || null;

    const { data: event, isLoading, isError, refetch } = useQuery<Event>({
        queryKey: ["/api/events", eventId],
        queryFn: async () => {
            const response = await fetch(`/api/events/${eventId}`);
            if (!response.ok) throw new Error("Event not found");
            return response.json();
        },
        enabled: eventId !== null,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen" data-testid="page-event-detail">
                <Header />
                <main className="pt-24 pb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Skeleton className="h-8 w-32 mb-8" />
                        <Skeleton className="aspect-[16/9] w-full rounded-lg mb-8" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (isError || !event) {
        return (
            <div className="min-h-screen" data-testid="page-event-detail">
                <Header />
                <main className="pt-24 pb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link href="/community">
                            <Button variant="ghost" className="mb-8" data-testid="button-back">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                목록으로
                            </Button>
                        </Link>
                        <div className="text-center py-16">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {isError ? "데이터를 불러올 수 없습니다" : "행사를 찾을 수 없습니다"}
                            </h3>
                            <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요.</p>
                            {isError && (
                                <Button variant="outline" onClick={() => refetch()} data-testid="button-retry">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    다시 시도
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    return (
        <div className="min-h-screen" data-testid="page-event-detail">
            <Header />
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/community">
                        <Button variant="ghost" className="mb-8" data-testid="button-back">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            목록으로
                        </Button>
                    </Link>

                    <article>
                        <header className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className={`${statusColors[event.status || "upcoming"]} text-white`}>
                                    {statusLabels[event.status || "upcoming"]}
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-event-title">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                {formattedDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formattedDate}</span>
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </header>

                        {event.imageUrl && (
                            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {event.description && (
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-event-description">
                                    {event.description}
                                </p>
                            </div>
                        )}
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
