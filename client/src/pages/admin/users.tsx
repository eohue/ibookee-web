import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/models/auth";
import { Loader2 } from "lucide-react";

export default function AdminUsers() {
    const { toast } = useToast();
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [verificationFilter, setVerificationFilter] = useState<string>("all");

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
            toast({ title: "Role updated successfully" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update role",
                description: error.message,
                variant: "destructive",
            });
        },
    });

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
                        <CardTitle>User Management</CardTitle>
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="resident">Resident</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="unverified">Unverified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Social</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created At</TableHead>
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
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                                                Unverified
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(value) =>
                                                updateRoleMutation.mutate({ id: user.id, role: value })
                                            }
                                            disabled={user.email === "lks@ibookee.kr"} // Prevent editing main admin
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="resident">Resident</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt!).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
