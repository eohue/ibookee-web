import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectUnit } from "@shared/schema";
import { MapPin, Home } from "lucide-react";

interface UnitCardProps {
    unit: ProjectUnit;
    projectName?: string;
    onApply: (unit: ProjectUnit) => void;
}

export function UnitCard({ unit, projectName, onApply }: UnitCardProps) {
    const statusLabels: Record<string, string> = {
        available: "입주 가능",
        occupied: "입주 완료",
        reserved: "예약 중",
        maintenance: "준비 중"
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {unit.photos && unit.photos.length > 0 ? (
                    <img
                        src={unit.photos[0]}
                        alt={unit.unitNumber}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <Home className="w-12 h-12" />
                    </div>
                )}
                <Badge
                    className="absolute top-3 left-3"
                    variant={unit.status === 'available' ? 'default' : 'secondary'}
                >
                    {statusLabels[unit.status as string] || unit.status}
                </Badge>
            </div>

            <CardContent className="p-5 space-y-4">
                {projectName && (
                    <div className="flex items-center text-sm text-muted-foreground font-medium">
                        <MapPin className="w-4 h-4 mr-1" />
                        {projectName}
                    </div>
                )}

                <div>
                    <h3 className="text-xl font-bold text-gray-900">{unit.type || unit.unitNumber}</h3>
                    <p className="text-sm text-gray-500 mt-1">{unit.area}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500">보증금</span>
                        <span className="font-semibold text-gray-900">{unit.deposit || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500">월 임대료</span>
                        <span className="font-semibold text-gray-900">{unit.monthlyRent || "-"}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button
                    className="w-full font-semibold"
                    disabled={unit.status !== 'available'}
                    onClick={() => onApply(unit)}
                    size="lg"
                >
                    {unit.status === 'available' ? '입주 신청하기' : '신청 불가'}
                </Button>
            </CardFooter>
        </Card>
    );
}
