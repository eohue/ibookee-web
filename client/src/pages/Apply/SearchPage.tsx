import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SearchFilter } from "./components/SearchFilter";
import { UnitList } from "./components/UnitList";
import type { Project, ProjectUnit } from "@shared/schema";

export default function SearchPage() {
    const [filters, setFilters] = useState({
        projectId: "",
        status: ""
    });

    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ["/api/projects"],
    });

    const { data: units = [], isLoading } = useQuery<ProjectUnit[]>({
        queryKey: ["/api/units/search", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.projectId) params.append("projectId", filters.projectId);
            if (filters.status) params.append("status", filters.status);
            const res = await fetch(`/api/units/search?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch units");
            return res.json();
        }
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-screen-xl mx-auto">
                    <div className="mb-12 text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">입주 공실 찾기</h1>
                        <p className="text-gray-500 text-lg md:text-xl font-light">나에게 딱 맞는 공간을 찾아보세요.</p>
                    </div>

                    <SearchFilter
                        projects={projects}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    <UnitList
                        units={units}
                        projects={projects}
                        isLoading={isLoading}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
