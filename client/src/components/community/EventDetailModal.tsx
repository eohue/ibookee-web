import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@shared/schema";

interface EventDetailModalProps {
    event: Event | null;
    isOpen: boolean;
    onClose: () => void;
}

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

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
    if (!event) return null;

    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden flex flex-col bg-background" overlayClassName="bg-black/80">
                <DialogHeader className="p-6 shrink-0 border-b">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${statusColors[event.status || "upcoming"]} text-white hover:${statusColors[event.status || "upcoming"]}`}>
                            {statusLabels[event.status || "upcoming"]}
                        </Badge>
                        {formattedDate && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formattedDate}
                            </span>
                        )}
                        {event.location && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                            </span>
                        )}
                    </div>
                    <DialogTitle className="text-2xl font-bold leading-tight">
                        {event.title}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6">
                        {event.imageUrl && (
                            <div className="mb-6 rounded-lg overflow-hidden shadow-sm border">
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {event.description && (
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
