import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import type { ResidentReporter } from "@shared/schema";

export function ReporterSection() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: articles = [], isLoading } = useQuery<ResidentReporter[]>({
        queryKey: ["/api/admin/resident-reporter"],
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/resident-reporter/${id}/status`, { status });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/resident-reporter"] });
            toast({
                title: "상태 업데이트 성공",
                description: "기사 상태가 변경되었습니다.",
            });
        },
        onError: () => {
            toast({
                title: "업데이트 실패",
                description: "상태 변경 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        },
    });

    const handleStatusChange = (id: string, status: string) => {
        statusMutation.mutate({ id, status });
    };

    const pendingArticles = articles.filter(a => a.status === "pending");
    const approvedArticles = articles.filter(a => a.status === "approved");
    const rejectedArticles = articles.filter(a => a.status === "rejected");

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">입주민 기자단 관리</h2>
                <p className="text-muted-foreground">
                    접수된 입주민 기사를 검토하고 승인합니다.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>대기 중인 기사 ({pendingArticles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ArticleTable
                        articles={pendingArticles}
                        onApprove={(id) => handleStatusChange(id, "approved")}
                        onReject={(id) => handleStatusChange(id, "rejected")}
                        showActions
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>승인된 기사 ({approvedArticles.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ArticleTable articles={approvedArticles} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>반려된 기사 ({rejectedArticles.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ArticleTable articles={rejectedArticles} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ArticleTable({ articles, onApprove, onReject, showActions }: { articles: ResidentReporter[], onApprove?: (id: string) => void, onReject?: (id: string) => void, showActions?: boolean }) {
    if (articles.length === 0) {
        return <p className="text-muted-foreground text-sm py-4">데이터가 없습니다.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>작성일</TableHead>
                    {showActions && <TableHead>관리</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {articles.map((article) => (
                    <TableRow key={article.id}>
                        <TableCell>
                            <div className="font-medium">{article.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{article.content}</div>
                        </TableCell>
                        <TableCell>{article.authorName}</TableCell>
                        <TableCell>{new Date(article.createdAt || "").toLocaleDateString()}</TableCell>
                        {showActions && (
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => onApprove?.(article.id)}>
                                        <CheckCircle className="w-4 h-4 mr-1" /> 승인
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onReject?.(article.id)}>
                                        <XCircle className="w-4 h-4 mr-1" /> 반려
                                    </Button>
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
