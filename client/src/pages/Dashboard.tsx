import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { menuItems, type Section } from "@/components/dashboard/constants";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { ArticlesSection } from "@/components/dashboard/ArticlesSection";
import { EventsSection } from "@/components/dashboard/EventsSection";
import { ProgramsSection } from "@/components/dashboard/ProgramsSection";
import { InquiriesSection } from "@/components/dashboard/InquiriesSection";
import { SocialAccountsSection } from "@/components/dashboard/SocialAccountsSection";
import { CommunitySection } from "@/components/dashboard/CommunitySection";
import { PartnersSection } from "@/components/dashboard/PartnersSection";
import { HistorySection } from "@/components/dashboard/HistorySection";
import { PageImagesSection } from "@/components/dashboard/PageImagesSection";
import { SiteSettingsSection } from "@/components/dashboard/SiteSettingsSection";
import { ResourcesSection } from "@/components/dashboard/ResourcesSection";
import { ReporterSection } from "@/components/dashboard/ReporterSection";
import { RecruitmentsSection } from "@/components/dashboard/RecruitmentsSection";
import UsersSection from "@/pages/admin/users";
import type { Stats } from "@/components/dashboard/types";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const { user, isLoading: authLoading, isAuthenticated, logoutMutation } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <div className="p-4 border-b">
                <Link href="/">
                  <span className="text-lg font-bold text-primary cursor-pointer" data-testid="link-home">
                    IBOOKEE
                  </span>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">관리자</p>
              </div>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>콘텐츠 관리</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems
                    .filter(item => {
                      if (user?.role === "admin") return true;
                      // Resident/User can see Overview (+ Inquiries if resident? for now strictly just Overview)
                      return ["overview"].includes(item.id);
                    })
                    .map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.id)}
                          isActive={activeSection === item.id}
                          data-testid={`nav-${item.id}`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => logoutMutation.mutate()} data-testid="button-logout">
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">
                {menuItems.find((item) => item.id === activeSection)?.title || "대시보드"}
              </h1>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <ModeToggle />
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">
                    {user.firstName || user.email || "관리자"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Role: {user.role || "unknown"} {user.role === "admin" ? "(Admin)" : ""}
                  </span>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === "overview" && (
              <OverviewSection stats={stats} statsLoading={statsLoading} setActiveSection={setActiveSection} />
            )}
            {activeSection === "projects" && <ProjectsSection />}
            {activeSection === "articles" && <ArticlesSection />}
            {activeSection === "resources" && <ResourcesSection />}
            {activeSection === "events" && <EventsSection />}
            {activeSection === "programs" && <ProgramsSection />}
            {activeSection === "inquiries" && <InquiriesSection />}
            {activeSection === "social-accounts" && <SocialAccountsSection />}
            {activeSection === "community" && <CommunitySection />}
            {activeSection === "partners" && <PartnersSection />}
            {activeSection === "history" && <HistorySection />}
            {activeSection === "page-images" && <PageImagesSection />}
            {activeSection === "site-settings" && <SiteSettingsSection />}
            {activeSection === "users" && <UsersSection />}
            {activeSection === "reporter" && <ReporterSection />}
            {activeSection === "recruitment" && <RecruitmentsSection />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
