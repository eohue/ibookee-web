import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { ResidentProgram } from "@shared/schema";

interface ProgramApplicationModalProps {
    program: ResidentProgram | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProgramApplicationModal({ program, isOpen, onClose }: ProgramApplicationModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const applicationMutation = useMutation({
        mutationFn: async (data: {
            programId: string;
            name: string;
            email: string;
            phone?: string;
            message?: string;
        }) => {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "신청에 실패했습니다.");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "신청 완료",
                description: "프로그램 신청이 완료되었습니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
            handleClose();
        },
        onError: (error: Error) => {
            toast({
                title: "신청 실패",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleClose = () => {
        setFormData({ name: "", email: "", phone: "", message: "" });
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!program) return;

        if (!formData.name.trim() || !formData.email.trim()) {
            toast({
                title: "입력 오류",
                description: "이름과 이메일은 필수 입력 항목입니다.",
                variant: "destructive",
            });
            return;
        }

        applicationMutation.mutate({
            programId: program.id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            message: formData.message.trim() || undefined,
        });
    };

    if (!program) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>프로그램 신청</DialogTitle>
                    <DialogDescription>
                        {program.title}에 신청합니다.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">이름 *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="홍길동"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">이메일 *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">연락처</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="010-1234-5678"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">신청 메시지</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="신청 동기나 참여 계획을 간략히 적어주세요."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            취소
                        </Button>
                        <Button type="submit" disabled={applicationMutation.isPending}>
                            {applicationMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            신청하기
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
