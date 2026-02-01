import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectUnit } from "@shared/schema";

interface UnitApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    unit: ProjectUnit | null;
    projectTitle: string;
}

export function UnitApplicationModal({ isOpen, onClose, unit, projectTitle }: UnitApplicationModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [moveInDate, setMoveInDate] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inquiryMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/inquiries", data);
        },
        onSuccess: () => {
            toast({
                title: "문의가 접수되었습니다",
                description: "담당자가 확인 후 연락드리겠습니다. 감사합니다.",
            });
            resetForm();
            onClose();
        },
        onError: () => {
            toast({
                title: "접수 실패",
                description: "잠시 후 다시 시도해주세요.",
                variant: "destructive",
            });
        },
        onSettled: () => {
            setIsSubmitting(false);
        }
    });

    const resetForm = () => {
        setName("");
        setPhone("");
        setEmail("");
        setMoveInDate("");
        setMessage("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const fullMessage = `
[입주/대기 신청]
프로젝트: ${projectTitle}
호실: ${unit?.unitNumber} (${unit?.type || "타입 미지정"})
희망 입주/방문일: ${moveInDate}

문의내용:
${message}
        `.trim();

        inquiryMutation.mutate({
            type: "move-in", // Using existing InquiryType
            name,
            email,
            phone,
            message: fullMessage,
        });
    };

    if (!unit) return null;

    const isAvailable = unit.status === "available";
    const title = isAvailable ? "입주 상담 신청" : "대기 알림 신청";
    const description = isAvailable
        ? `${projectTitle} ${unit.unitNumber} 입주에 대해 궁금하신 점을 남겨주세요.`
        : `${projectTitle} ${unit.unitNumber}는 현재 입주가 완료되었습니다. 공실 발생 시 안내를 원하시면 남겨주세요.`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름 *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">연락처 *</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="010-0000-0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">이메일 *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="moveInDate">희망 입주/방문일</Label>
                        <Input
                            id="moveInDate"
                            type="date"
                            value={moveInDate}
                            onChange={(e) => setMoveInDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">추가 문의사항</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="궁금한 점을 자유롭게 적어주세요."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "전송 중..." : "신청하기"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
