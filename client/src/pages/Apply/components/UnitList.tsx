import type { ProjectUnit, Project } from "@shared/schema";
import { UnitCard } from "./UnitCard";
import { Skeleton } from "@/components/ui/skeleton";

interface UnitListProps {
    units: ProjectUnit[];
    projects: Project[];
    isLoading: boolean;
    onApply?: (unit: ProjectUnit) => void;
}

export function UnitList({ units, projects, isLoading, onApply }: UnitListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (units.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">조건에 맞는 공실 검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-1">검색 조건을 변경하여 다시 확인해보세요.</p>
            </div>
        );
    }

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.title;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
                <UnitCard
                    key={unit.id}
                    unit={unit}
                    projectName={getProjectName(unit.projectId)}
                    onApply={(u) => onApply ? onApply(u) : alert(`[준비 중] ${u.unitNumber} 입주 신청 기능은 개발 중입니다.`)}
                />
            ))}
        </div>
    );
}
