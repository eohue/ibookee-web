import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/models/auth";
import { Loader2, Eye, Trash2, KeyRound } from "lucide-react";

export default function AdminUsers() {
    const { toast } = useToast();
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [verificationFilter, setVerificationFilter] = useState<string>("all");

    // Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    const filteredUsers = users?.filter(user => {
        if (roleFilter !== "all" && user.role !== roleFilter) return false;
        if (verificationFilter === "verified" && !user.isVerified) return false;
        if (verificationFilter === "unverified" && user.isVerified) return false;
        return true;
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: string; role: string }) => {
            const res = await fetch(`/api/admin/users/${id}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "역할이 변경되었습니다" });
        },
        onError: (error: Error) => {
            toast({
                title: "역할 변경 실패",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async ({ id, password }: { id: string; password: string }) => {
            const res = await fetch(`/api/admin/users/${id}/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "비밀번호가 변경되었습니다" });
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (error: Error) => {
            toast({
                title: "비밀번호 변경 실패",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "사용자가 삭제되었습니다" });
            setIsDeleteOpen(false);
            setIsDetailOpen(false);
            setSelectedUser(null);
        },
        onError: (error: Error) => {
            toast({
                title: "삭제 실패",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const openUserDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
        setNewPassword("");
        setConfirmPassword("");
    };

    const handlePasswordChange = () => {
        if (!selectedUser) return;
        if (newPassword.length < 6) {
            toast({ title: "비밀번호는 최소 6자 이상이어야 합니다", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "비밀번호가 일치하지 않습니다", variant: "destructive" });
            return;
        }
        updatePasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
    };

    const handleDeleteUser = () => {
        if (!selectedUser) return;
        deleteUserMutation.mutate(selectedUser.id);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>사용자 관리</CardTitle>
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="전체 역할" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체 역할</SelectItem>
                                    <SelectItem value="admin">관리자</SelectItem>
                                    <SelectItem value="resident">입주민</SelectItem>
                                    <SelectItem value="user">사용자</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="전체 상태" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체 상태</SelectItem>
                                    <SelectItem value="verified">인증됨</SelectItem>
                                    <SelectItem value="unverified">미인증</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>이메일</TableHead>
                                <TableHead>소셜</TableHead>
                                <TableHead>인증</TableHead>
                                <TableHead>역할</TableHead>
                                <TableHead>가입일</TableHead>
                                <TableHead>관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{user.firstName} {user.lastName}</span>
                                            {user.realName && (
                                                <span className="text-xs text-muted-foreground">({user.realName})</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {user.googleId && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold border" title="Google">G</span>
                                            )}
                                            {user.naverId && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#03C75A] text-white text-[10px] font-bold" title="Naver">N</span>
                                            )}
                                            {user.kakaoId && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FEE500] text-black text-[10px] font-bold" title="Kakao">K</span>
                                            )}
                                            {!user.googleId && !user.naverId && !user.kakaoId && (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.isVerified ? (
                                            <span className="inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                인증됨
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                                                미인증
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(value) =>
                                                updateRoleMutation.mutate({ id: user.id, role: value })
                                            }
                                            disabled={user.email === "kslee@ibookee.kr"}
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">사용자</SelectItem>
                                                <SelectItem value="resident">입주민</SelectItem>
                                                <SelectItem value="admin">관리자</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt!).toLocaleDateString("ko-KR")}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openUserDetail(user)}
                                            title="상세보기"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* User Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>사용자 상세 정보</DialogTitle>
                        <DialogDescription>
                            사용자 정보를 확인하고 비밀번호를 변경하거나 삭제할 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">이메일</Label>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">이름</Label>
                                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">실명</Label>
                                    <p className="font-medium">{selectedUser.realName || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">전화번호</Label>
                                    <p className="font-medium">{selectedUser.phoneNumber || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">역할</Label>
                                    <p className="font-medium capitalize">{selectedUser.role}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">인증 상태</Label>
                                    <p className="font-medium">{selectedUser.isVerified ? "인증됨" : "미인증"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">가입일</Label>
                                    <p className="font-medium">{new Date(selectedUser.createdAt!).toLocaleString("ko-KR")}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">소셜 로그인</Label>
                                    <p className="font-medium">
                                        {[
                                            selectedUser.googleId && "Google",
                                            selectedUser.naverId && "Naver",
                                            selectedUser.kakaoId && "Kakao"
                                        ].filter(Boolean).join(", ") || "-"}
                                    </p>
                                </div>
                            </div>

                            {/* Password Change */}
                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <KeyRound className="h-4 w-4" />
                                    <h4 className="font-semibold">비밀번호 변경</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="newPassword">새 비밀번호</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="최소 6자 이상"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="비밀번호 재입력"
                                        />
                                    </div>
                                    <Button
                                        onClick={handlePasswordChange}
                                        disabled={updatePasswordMutation.isPending || !newPassword || !confirmPassword}
                                        className="w-full"
                                    >
                                        {updatePasswordMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : null}
                                        비밀번호 변경
                                    </Button>
                                </div>
                            </div>

                            {/* Delete Button */}
                            {selectedUser.email !== "kslee@ibookee.kr" && (
                                <div className="border-t pt-4">
                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsDeleteOpen(true)}
                                        className="w-full"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        사용자 삭제
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 <strong>{selectedUser?.email}</strong> 사용자를 삭제하시겠습니까?
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteUserMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
