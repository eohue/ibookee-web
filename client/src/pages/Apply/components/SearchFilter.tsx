import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Project } from "@shared/schema";

interface SearchFilterProps {
    projects: Project[];
    filters: { projectId: string; status: string };
    onFilterChange: (key: string, value: string) => void;
}

export function SearchFilter({ projects, filters, onFilterChange }: SearchFilterProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 mb-8">
            <div className="space-y-2 flex-1">
                <Label>지점 선택</Label>
                <Select
                    value={filters.projectId || "all"}
                    onValueChange={(value) => onFilterChange('projectId', value === 'all' ? '' : value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="전체 지점" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 지점</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 flex-1">
                <Label>입주 상태</Label>
                <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => onFilterChange('status', value === 'all' ? '' : value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="전체 상태" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="available">입주 가능</SelectItem>
                        <SelectItem value="occupied">입주 완료</SelectItem>
                        <SelectItem value="reserved">예약 중</SelectItem>
                        <SelectItem value="maintenance">준비 중</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
