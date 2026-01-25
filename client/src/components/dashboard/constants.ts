import {
    LayoutDashboard,
    Building2,
    FileText,
    CalendarDays,
    BookOpen,
    MessageSquare,
    Share2,
    Image as ImageIcon,
    Users,
    History,
    Settings,
    UserCog,
    Home,
} from "lucide-react";

export type Section = "overview" | "projects" | "articles" | "resources" | "events" | "programs" | "inquiries" | "social-accounts" | "community" | "site-settings" | "history" | "partners" | "page-images" | "users" | "reporter" | "applications" | "recruitment";

export const menuItems = [
    { id: "overview" as Section, title: "개요", icon: LayoutDashboard },
    { id: "users" as Section, title: "사용자 관리", icon: UserCog },
    { id: "projects" as Section, title: "프로젝트(Space)", icon: Building2 },
    { id: "recruitment" as Section, title: "입주자 모집 공고", icon: Home },
    { id: "articles" as Section, title: "인사이트", icon: FileText },
    { id: "reporter" as Section, title: "입주민 기자단", icon: FileText }, // Added
    { id: "resources" as Section, title: "자료실 관리", icon: FileText },
    { id: "events" as Section, title: "행사 관리", icon: CalendarDays },
    { id: "programs" as Section, title: "입주민 프로그램", icon: BookOpen },
    { id: "inquiries" as Section, title: "문의 관리", icon: MessageSquare },
    { id: "social-accounts" as Section, title: "소셜 계정", icon: Share2 },
    { id: "community" as Section, title: "소셜 스트림", icon: ImageIcon },
    { id: "partners" as Section, title: "파트너 관리", icon: Users },
    { id: "history" as Section, title: "연혁 관리", icon: History },
    { id: "page-images" as Section, title: "페이지 이미지", icon: ImageIcon },
    { id: "site-settings" as Section, title: "사이트 설정", icon: Settings },
];
