import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";
import { useState } from "react";
import { EventDetailModal } from "@/components/community/EventDetailModal";

export default function EventsPage() {
    const { data: events = [], isLoading, isError, refetch } = useQuery<Event[]>({
        queryKey: ["/api/events"],
    });

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const upcomingEvents = events.filter((event) =>
        event.published && (event.status === "upcoming" || event.status === "ongoing")
    );

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-12">
                        <Link href="/story">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-2">
                                Notice & Events
                            </p>
                            <h1 className="text-3xl font-bold">다가오는 행사</h1>
                        </div>
                    </div>

                    {isError ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                다시 시도
                            </Button>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Skeleton className="w-12 h-12 rounded-lg" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-5 w-32 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                </Card>
                            ))}
                        </div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-20 border rounded-lg">
                            <p className="text-muted-foreground">예정된 행사가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="block cursor-pointer"
                                >
                                    <Card className="overflow-hidden h-full border-2 border-border shadow-lg hover:shadow-xl transition-all bg-card">
                                        {event.imageUrl && (
                                            <div className="aspect-video w-full overflow-hidden">
                                                <img
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Calendar className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-primary">
                                                        {new Date(event.date).toLocaleDateString("ko-KR", {
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{event.location}</p>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <EventDetailModal
                event={selectedEvent}
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
}
