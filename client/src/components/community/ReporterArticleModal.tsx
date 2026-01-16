import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ResidentReporter } from "@shared/schema";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReporterArticleModalProps {
    article: ResidentReporter | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ReporterArticleModal({ article, isOpen, onClose }: ReporterArticleModalProps) {
    if (!article) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 pb-0 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            {article.status === 'approved' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white mb-3">
                                    승인됨
                                </span>
                            )}
                            <DialogTitle className="text-2xl font-bold">{article.title}</DialogTitle>
                            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                                <span className="font-medium text-primary">{article.authorName} 기자</span>
                                <span>•</span>
                                <span>{new Date(article.createdAt || "").toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0 overflow-auto">
                    <div className="px-6 pb-6">
                        {article.imageUrl && (
                            <div className="my-6 rounded-lg overflow-hidden">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        <div
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: article.content || "" }}
                        />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
