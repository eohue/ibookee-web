import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImagePlus, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload"; // Assuming this exists or similar

import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface ReporterSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReporterSubmissionModal({ isOpen, onClose }: ReporterSubmissionModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState(""); // User should input their reporter name or use real name
    const [imageUrl, setImageUrl] = useState("");

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/resident-reporter", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "제보 완료",
                description: "기사가 성공적으로 제보되었습니다. 관리자 승인 후 게시됩니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/resident-reporter"] });
            onClose();
            // Reset form
            setTitle("");
            setContent("");
            setAuthorName("");
            setImageUrl("");
        },
        onError: (error: any) => {
            // Error handling in apiRequest throws an Error object with the response text
            // The format from lib/queryClient is usually "Status: Text"
            // But if we return JSON, we might want to parse it if possible, or just rely on the message.
            // Let's rely on the message for now, assuming apiRequest might have parsed it or just use what we have.
            // Actually, queryClient's throwIfResNotOk throws "500: {...json string...}"

            let message = "기사 제보 중 오류가 발생했습니다.";
            try {
                // Try to extract JSON from error message if it looks like "500: {...}"
                const parts = error.message.split(': ');
                if (parts.length > 1) {
                    const jsonStr = parts.slice(1).join(': ');
                    const data = JSON.parse(jsonStr);
                    if (data.details) message = `오류: ${data.details}`;
                    else if (data.error) message = `오류: ${data.error}`;
                } else {
                    message = error.message;
                }
            } catch (e) {
                message = error.message;
            }

            toast({
                title: "제보 실패",
                description: message,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitMutation.mutate({
            title,
            content,
            authorName,
            imageUrl,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader>
                    <DialogTitle>입주민 리포터 기사 제보</DialogTitle>
                    <DialogDescription>
                        입주민 여러분의 생생한 이야기를 들려주세요.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="authorName">리포터 활동명</Label>
                        <Input
                            id="authorName"
                            placeholder="홍길동"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">기사 제목</Label>
                        <Input
                            id="title"
                            placeholder="흥미로운 제목을 입력해주세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">기사 내용</Label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            className="min-h-[200px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>이미지 첨부 (필수)</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(typeof url === 'string' ? url : url[0])}
                            maxFiles={1}
                        />
                        {!imageUrl && (
                            <p className="text-xs text-destructive">
                                기사에는 이미지가 반드시 포함되어야 합니다.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button type="submit" disabled={submitMutation.isPending || !imageUrl}>
                            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            제보하기
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
