export const PROJECT_CATEGORIES = [
    { id: "youth", label: "청년 주택", labelEn: "Youth Housing" },
    { id: "single", label: "1인 가구", labelEn: "Single Household" },
    { id: "social-mix", label: "소셜 믹스", labelEn: "Social Mix" },
    { id: "local-anchor", label: "지역 앵커", labelEn: "Local Anchor" },
    { id: "senior", label: "고령자", labelEn: "Senior" },
    { id: "newlyweds", label: "신혼부부", labelEn: "Newlyweds" },
    { id: "startup", label: "창업", labelEn: "Startup" },
    { id: "disabled", label: "장애인", labelEn: "Disabled" },
    { id: "purchase-agreement", label: "매입약정", labelEn: "Purchase Agreement" },
    { id: "land-lease", label: "토지임대부", labelEn: "Land Lease" },
    { id: "urban-regeneration", label: "도시재생", labelEn: "Urban Regeneration" },
    { id: "LH", label: "LH", labelEn: "LH" },
    { id: "SH", label: "SH", labelEn: "SH" },
    { id: "HUG", label: "HUG", labelEn: "HUG" },
    { id: "seoul", label: "서울시", labelEn: "Seoul" },
    { id: "gyeonggi", label: "경기도", labelEn: "Gyeonggi" },
    { id: "IH", label: "IH", labelEn: "IH" },
    { id: "GH", label: "GH", labelEn: "GH" },
    { id: "children", label: "어린이", labelEn: "Children" },
    { id: "arts", label: "문화예술", labelEn: "Arts" },
];

export const CATEGORY_LABELS: Record<string, string> = PROJECT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.label;
    return acc;
}, {} as Record<string, string>);
