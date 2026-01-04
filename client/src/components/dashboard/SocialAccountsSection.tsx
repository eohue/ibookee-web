import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ExternalLink, Share2 } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import type { SocialAccount } from "@shared/schema";

export function SocialAccountsSection() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: accounts, isLoading } = useQuery<SocialAccount[]>({
        queryKey: ["/api/admin/social-accounts"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/social-accounts", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/social-accounts"] });
            toast({ title: "소셜 계정이 등록되었습니다." });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "등록 실패", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/admin/social-accounts/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/social-accounts"] });
            toast({ title: "소셜 계정이 삭제되었습니다." });
        },
        onError: () => {
            toast({ title: "삭제 실패", variant: "destructive" });
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            await apiRequest("PUT", `/api/admin/social-accounts/${id}`, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/social-accounts"] });
            toast({ title: "상태가 변경되었습니다." });
        },
        onError: () => {
            toast({ title: "변경 실패", variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            platform: formData.get("platform") as string,
            username: formData.get("username") as string,
            profileUrl: formData.get("profileUrl") as string || undefined,
            profileImageUrl: formData.get("profileImageUrl") as string || undefined,
            isActive: true,
        };
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">소셜 계정 관리</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        아이부키 공식 및 지점별 인스타그램/블로그 계정을 등록하세요.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-add-social-account">
                            <Plus className="w-4 h-4 mr-2" />
                            계정 등록
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>새 소셜 계정 등록</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">계정 이름</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="예: 아이부키 공식, 안암생활"
                                    required
                                    data-testid="input-account-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="platform">플랫폼</Label>
                                <Select name="platform" defaultValue="instagram">
                                    <SelectTrigger data-testid="select-account-platform">
                                        <SelectValue placeholder="플랫폼 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="blog">Blog</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">사용자명/URL</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="@ibookee_official 또는 블로그 URL"
                                    required
                                    data-testid="input-account-username"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profileUrl">프로필 링크</Label>
                                <Input
                                    id="profileUrl"
                                    name="profileUrl"
                                    placeholder="https://instagram.com/ibookee_official"
                                    data-testid="input-account-profile-url"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profileImageUrl">프로필 이미지 URL</Label>
                                <Input
                                    id="profileImageUrl"
                                    name="profileImageUrl"
                                    placeholder="프로필 이미지 URL (선택사항)"
                                    data-testid="input-account-profile-image"
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-account">
                                    등록
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
            ) : !accounts || accounts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        등록된 소셜 계정이 없습니다.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                        <Card key={account.id} data-testid={`card-social-account-${account.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {account.profileImageUrl ? (
                                                <img src={account.profileImageUrl} alt={account.name} className="w-full h-full object-cover" />
                                            ) : account.platform === 'instagram' ? (
                                                <SiInstagram className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <Share2 className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-foreground">{account.name}</h3>
                                            <p className="text-sm text-muted-foreground">{account.username}</p>
                                        </div>
                                    </div>
                                    <Badge variant={account.isActive ? "default" : "secondary"}>
                                        {account.isActive ? "활성" : "비활성"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActiveMutation.mutate({ id: account.id, isActive: !account.isActive })}
                                            data-testid={`button-toggle-account-${account.id}`}
                                        >
                                            {account.isActive ? "비활성화" : "활성화"}
                                        </Button>
                                        {account.profileUrl && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(account.profileUrl!, '_blank')}
                                                data-testid={`button-open-account-${account.id}`}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteMutation.mutate(account.id)}
                                        data-testid={`button-delete-account-${account.id}`}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
