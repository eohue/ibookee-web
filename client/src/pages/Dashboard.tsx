import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Building2,
  FileText,
  MessageSquare,
  Trash2,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Plus,
  Edit,
  CalendarDays,
  BookOpen,
  Image,
  LayoutDashboard,
  Share2,
  ExternalLink,
  Settings,
  History,
  Users,
} from "lucide-react";
import { SiInstagram } from "react-icons/si";
import type { 
  Project, 
  Inquiry, 
  Article, 
  Event, 
  ResidentProgram, 
  CommunityPost,
  SocialAccount,
  Partner,
  HistoryMilestone,
  SiteSetting,
  PageImage,
} from "@shared/schema";

interface Stats {
  projectCount: number;
  inquiryCount: number;
  articleCount: number;
  communityPostCount: number;
  eventCount: number;
  programCount: number;
}

type Section = "overview" | "projects" | "articles" | "events" | "programs" | "inquiries" | "social-accounts" | "community" | "site-settings" | "history" | "partners" | "page-images";

const menuItems = [
  { id: "overview" as Section, title: "개요", icon: LayoutDashboard },
  { id: "projects" as Section, title: "프로젝트(Space)", icon: Building2 },
  { id: "articles" as Section, title: "인사이트", icon: FileText },
  { id: "events" as Section, title: "행사 관리", icon: CalendarDays },
  { id: "programs" as Section, title: "입주민 프로그램", icon: BookOpen },
  { id: "inquiries" as Section, title: "문의 관리", icon: MessageSquare },
  { id: "social-accounts" as Section, title: "소셜 계정", icon: Share2 },
  { id: "community" as Section, title: "소셜 스트림", icon: Image },
  { id: "partners" as Section, title: "파트너 관리", icon: Users },
  { id: "history" as Section, title: "연혁 관리", icon: History },
  { id: "page-images" as Section, title: "페이지 이미지", icon: Image },
  { id: "site-settings" as Section, title: "사이트 설정", icon: Settings },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

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
                  {menuItems.map((item) => (
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
                    <SidebarMenuButton onClick={() => logout()} data-testid="button-logout">
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
              <span className="text-sm text-muted-foreground">
                {user.firstName || user.email || "관리자"}
              </span>
            )}
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === "overview" && (
              <OverviewSection stats={stats} statsLoading={statsLoading} />
            )}
            {activeSection === "projects" && <ProjectsSection />}
            {activeSection === "articles" && <ArticlesSection />}
            {activeSection === "events" && <EventsSection />}
            {activeSection === "programs" && <ProgramsSection />}
            {activeSection === "inquiries" && <InquiriesSection />}
            {activeSection === "social-accounts" && <SocialAccountsSection />}
            {activeSection === "community" && <CommunitySection />}
            {activeSection === "partners" && <PartnersSection />}
            {activeSection === "history" && <HistorySection />}
            {activeSection === "page-images" && <PageImagesSection />}
            {activeSection === "site-settings" && <SiteSettingsSection />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function OverviewSection({ stats, statsLoading }: { stats?: Stats; statsLoading: boolean }) {
  const statCards = [
    { label: "프로젝트", value: stats?.projectCount || 0, icon: Building2 },
    { label: "문의 내역", value: stats?.inquiryCount || 0, icon: MessageSquare },
    { label: "인사이트", value: stats?.articleCount || 0, icon: FileText },
    { label: "행사", value: stats?.eventCount || 0, icon: CalendarDays },
    { label: "프로그램", value: stats?.programCount || 0, icon: BookOpen },
    { label: "커뮤니티", value: stats?.communityPostCount || 0, icon: Image },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} data-testid={`card-stat-${stat.label}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection() {
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("youth");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "프로젝트가 생성되었습니다." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "생성 실패", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/admin/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "프로젝트가 수정되었습니다." });
      setEditingProject(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "수정 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "프로젝트가 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const openDialog = (project: Project | null) => {
    setEditingProject(project);
    setSelectedCategory(project?.category || "youth");
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      titleEn: formData.get("titleEn") as string,
      location: formData.get("location") as string,
      category: selectedCategory,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      year: parseInt(formData.get("year") as string),
      units: parseInt(formData.get("units") as string) || undefined,
      featured: false,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categoryLabels: Record<string, string> = {
    youth: "청년 주택",
    single: "1인 가구",
    "social-mix": "소셜 믹스",
    "local-anchor": "지역 앵커",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">프로젝트 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} data-testid="button-add-project">
              <Plus className="w-4 h-4 mr-2" />
              새 프로젝트
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "프로젝트 수정" : "새 프로젝트"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">프로젝트명 (한글)</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingProject?.title}
                    required
                    data-testid="input-project-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleEn">프로젝트명 (영문)</Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    defaultValue={editingProject?.titleEn || ""}
                    data-testid="input-project-title-en"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">위치</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingProject?.location}
                    required
                    data-testid="input-project-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-project-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">청년 주택</SelectItem>
                      <SelectItem value="single">1인 가구</SelectItem>
                      <SelectItem value="social-mix">소셜 믹스</SelectItem>
                      <SelectItem value="local-anchor">지역 앵커</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProject?.description}
                  required
                  data-testid="input-project-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  defaultValue={editingProject?.imageUrl}
                  required
                  data-testid="input-project-image"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">준공 연도</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={editingProject?.year || new Date().getFullYear()}
                    required
                    data-testid="input-project-year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units">세대 수</Label>
                  <Input
                    id="units"
                    name="units"
                    type="number"
                    defaultValue={editingProject?.units || ""}
                    data-testid="input-project-units"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-project">
                  {editingProject ? "수정" : "생성"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 프로젝트가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} data-testid={`card-project-${project.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium">{project.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[project.category] || project.category}
                      </Badge>
                      {project.featured && <Badge>추천</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {project.location} | {project.year}년 | {project.units}세대
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(project)}
                      data-testid={`button-edit-project-${project.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(project.id)}
                      data-testid={`button-delete-project-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticlesSection() {
  const { toast } = useToast();
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("column");
  const [isFeatured, setIsFeatured] = useState(false);

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/articles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "게시글이 생성되었습니다." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "생성 실패", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/admin/articles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: "게시글이 수정되었습니다." });
      setEditingArticle(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "수정 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "게시글이 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const openDialog = (article: Article | null) => {
    setEditingArticle(article);
    setSelectedCategory(article?.category || "column");
    setIsFeatured(article?.featured || false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imageUrlStr = (formData.get("imageUrl") as string)?.trim();
    
    const data: Record<string, any> = {
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      author: formData.get("author") as string,
      category: selectedCategory,
      featured: isFeatured,
    };
    
    if (imageUrlStr) data.imageUrl = imageUrlStr;

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categoryLabels: Record<string, string> = {
    column: "칼럼",
    media: "미디어",
    library: "자료실",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">인사이트 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} data-testid="button-add-article">
              <Plus className="w-4 h-4 mr-2" />
              새 게시글
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "게시글 수정" : "새 게시글"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingArticle?.title}
                  required
                  data-testid="input-article-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">작성자</Label>
                  <Input
                    id="author"
                    name="author"
                    defaultValue={editingArticle?.author}
                    required
                    data-testid="input-article-author"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-article-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="column">칼럼</SelectItem>
                      <SelectItem value="media">미디어</SelectItem>
                      <SelectItem value="library">자료실</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">요약</Label>
                <Input
                  id="excerpt"
                  name="excerpt"
                  defaultValue={editingArticle?.excerpt}
                  required
                  data-testid="input-article-excerpt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingArticle?.content}
                  required
                  className="min-h-[200px]"
                  data-testid="input-article-content"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  defaultValue={editingArticle?.imageUrl || ""}
                  data-testid="input-article-image"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                  data-testid="checkbox-article-featured"
                />
                <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                  추천 게시글로 설정
                </Label>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-article">
                  {editingArticle ? "수정" : "생성"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !articles || articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 게시글이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id} data-testid={`card-article-${article.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[article.category] || article.category}
                      </Badge>
                      {article.featured && <Badge>추천</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {article.author} | {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("ko-KR") : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(article)}
                      data-testid={`button-edit-article-${article.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(article.id)}
                      data-testid={`button-delete-article-${article.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EventsSection() {
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("upcoming");

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/admin/events"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "행사가 생성되었습니다." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "생성 실패", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/admin/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({ title: "행사가 수정되었습니다." });
      setEditingEvent(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "수정 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "행사가 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const openDialog = (event: Event | null) => {
    setEditingEvent(event);
    setSelectedStatus(event?.status || "upcoming");
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateValue = formData.get("date") as string;
    if (!dateValue) {
      toast({ title: "일시를 선택해주세요", variant: "destructive" });
      return;
    }
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const registrationUrl = (formData.get("registrationUrl") as string)?.trim();
    const data: Record<string, any> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: new Date(dateValue).toISOString(),
      location: formData.get("location") as string,
      status: selectedStatus,
    };
    if (imageUrl) data.imageUrl = imageUrl;
    if (registrationUrl) data.registrationUrl = registrationUrl;

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const statusLabels: Record<string, string> = {
    upcoming: "예정",
    ongoing: "진행중",
    completed: "종료",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">행사 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} data-testid="button-add-event">
              <Plus className="w-4 h-4 mr-2" />
              새 행사
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "행사 수정" : "새 행사"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">행사명</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingEvent?.title}
                  required
                  data-testid="input-event-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">일시</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    defaultValue={editingEvent?.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ""}
                    required
                    data-testid="input-event-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger data-testid="select-event-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">예정</SelectItem>
                      <SelectItem value="ongoing">진행중</SelectItem>
                      <SelectItem value="completed">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingEvent?.location}
                  required
                  data-testid="input-event-location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingEvent?.description}
                  required
                  data-testid="input-event-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  defaultValue={editingEvent?.imageUrl || ""}
                  data-testid="input-event-image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationUrl">신청 링크</Label>
                <Input
                  id="registrationUrl"
                  name="registrationUrl"
                  defaultValue={editingEvent?.registrationUrl || ""}
                  data-testid="input-event-registration"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-event">
                  {editingEvent ? "수정" : "생성"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 행사가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} data-testid={`card-event-${event.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {statusLabels[event.status || "upcoming"] || event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.location} | {event.date ? new Date(event.date).toLocaleDateString("ko-KR") : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(event)}
                      data-testid={`button-edit-event-${event.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(event.id)}
                      data-testid={`button-delete-event-${event.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramsSection() {
  const { toast } = useToast();
  const [editingProgram, setEditingProgram] = useState<ResidentProgram | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("small-group");
  const [selectedStatus, setSelectedStatus] = useState("open");

  const { data: programs, isLoading } = useQuery<ResidentProgram[]>({
    queryKey: ["/api/admin/programs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/programs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "프로그램이 생성되었습니다." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "생성 실패", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/admin/programs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      toast({ title: "프로그램이 수정되었습니다." });
      setEditingProgram(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "수정 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "프로그램이 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const openDialog = (program: ResidentProgram | null) => {
    setEditingProgram(program);
    setSelectedType(program?.programType || "small-group");
    setSelectedStatus(program?.status || "open");
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDateStr = (formData.get("startDate") as string)?.trim();
    const endDateStr = (formData.get("endDate") as string)?.trim();
    const maxParticipantsStr = (formData.get("maxParticipants") as string)?.trim();
    const contentStr = (formData.get("content") as string)?.trim();
    const imageUrlStr = (formData.get("imageUrl") as string)?.trim();
    
    const maxParticipants = maxParticipantsStr ? parseInt(maxParticipantsStr, 10) : null;
    
    const data: Record<string, any> = {
      programType: selectedType,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: selectedStatus,
    };
    
    if (contentStr) data.content = contentStr;
    if (imageUrlStr) data.imageUrl = imageUrlStr;
    if (startDateStr) data.startDate = new Date(startDateStr).toISOString();
    if (endDateStr) data.endDate = new Date(endDateStr).toISOString();
    if (maxParticipants !== null && !isNaN(maxParticipants)) {
      data.maxParticipants = maxParticipants;
    }

    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const typeLabels: Record<string, string> = {
    "small-group": "소모임 지원",
    "space-sharing": "공간 공유 공모전",
  };

  const statusLabels: Record<string, string> = {
    open: "모집중",
    closed: "마감",
    completed: "종료",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">입주민 프로그램 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} data-testid="button-add-program">
              <Plus className="w-4 h-4 mr-2" />
              새 프로그램
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgram ? "프로그램 수정" : "새 프로그램"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programType">프로그램 유형</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="select-program-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small-group">소모임 지원</SelectItem>
                      <SelectItem value="space-sharing">공간 공유 공모전</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger data-testid="select-program-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">모집중</SelectItem>
                      <SelectItem value="closed">마감</SelectItem>
                      <SelectItem value="completed">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">프로그램명</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingProgram?.title}
                  required
                  data-testid="input-program-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">간단 설명</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingProgram?.description}
                  required
                  data-testid="input-program-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">상세 내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingProgram?.content || ""}
                  className="min-h-[150px]"
                  data-testid="input-program-content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingProgram?.startDate ? new Date(editingProgram.startDate).toISOString().slice(0, 10) : ""}
                    data-testid="input-program-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">종료일</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={editingProgram?.endDate ? new Date(editingProgram.endDate).toISOString().slice(0, 10) : ""}
                    data-testid="input-program-end-date"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">최대 참가자 수</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    defaultValue={editingProgram?.maxParticipants || ""}
                    data-testid="input-program-max-participants"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">이미지 URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={editingProgram?.imageUrl || ""}
                    data-testid="input-program-image"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-program">
                  {editingProgram ? "수정" : "생성"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !programs || programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 프로그램이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {programs.map((program) => (
            <Card key={program.id} data-testid={`card-program-${program.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {program.imageUrl && (
                    <img
                      src={program.imageUrl}
                      alt={program.title}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium">{program.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[program.programType] || program.programType}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {statusLabels[program.status || "open"] || program.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {program.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(program)}
                      data-testid={`button-edit-program-${program.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(program.id)}
                      data-testid={`button-delete-program-${program.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InquiriesSection() {
  const { toast } = useToast();

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "문의가 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "move-in": return "입주 문의";
      case "business": return "사업 제휴";
      case "recruit": return "채용 문의";
      default: return type;
    }
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case "move-in": return "default";
      case "business": return "secondary";
      case "recruit": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">문의 관리</h2>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !inquiries || inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            접수된 문의가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={getTypeVariant(inquiry.type)}>
                        {getTypeLabel(inquiry.type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {inquiry.createdAt
                          ? new Date(inquiry.createdAt).toLocaleDateString("ko-KR")
                          : "날짜 없음"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {inquiry.name}
                        {inquiry.company && (
                          <span className="text-muted-foreground font-normal">
                            {" "}({inquiry.company})
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {inquiry.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {inquiry.message}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(inquiry.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-inquiry-${inquiry.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialAccountsSection() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts, isLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/admin/social-accounts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/social-accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-accounts"] });
      toast({ title: "소셜 계정이 등록되었습니다." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "등록 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/social-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-accounts"] });
      toast({ title: "소셜 계정이 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/admin/social-accounts/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-accounts"] });
      toast({ title: "상태가 변경되었습니다." });
    },
    onError: () => {
      toast({ title: "변경 실패", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      platform: formData.get("platform") as string,
      username: formData.get("username") as string,
      profileUrl: formData.get("profileUrl") as string || undefined,
      profileImageUrl: formData.get("profileImageUrl") as string || undefined,
      isActive: true,
    };
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">소셜 계정 관리</h2>
          <p className="text-sm text-muted-foreground mt-1">
            아이부키 공식 및 지점별 인스타그램/블로그 계정을 등록하세요.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-social-account">
              <Plus className="w-4 h-4 mr-2" />
              계정 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>새 소셜 계정 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">계정 이름</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="예: 아이부키 공식, 안암생활"
                  required
                  data-testid="input-account-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">플랫폼</Label>
                <Select name="platform" defaultValue="instagram">
                  <SelectTrigger data-testid="select-account-platform">
                    <SelectValue placeholder="플랫폼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">사용자명/URL</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="@ibookee_official 또는 블로그 URL"
                  required
                  data-testid="input-account-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileUrl">프로필 링크</Label>
                <Input
                  id="profileUrl"
                  name="profileUrl"
                  placeholder="https://instagram.com/ibookee_official"
                  data-testid="input-account-profile-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileImageUrl">프로필 이미지 URL</Label>
                <Input
                  id="profileImageUrl"
                  name="profileImageUrl"
                  placeholder="프로필 이미지 URL (선택사항)"
                  data-testid="input-account-profile-image"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-account">
                  등록
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 소셜 계정이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} data-testid={`card-social-account-${account.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {account.profileImageUrl ? (
                        <img src={account.profileImageUrl} alt={account.name} className="w-full h-full object-cover" />
                      ) : account.platform === 'instagram' ? (
                        <SiInstagram className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Share2 className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.username}</p>
                    </div>
                  </div>
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({ id: account.id, isActive: !account.isActive })}
                      data-testid={`button-toggle-account-${account.id}`}
                    >
                      {account.isActive ? "비활성화" : "활성화"}
                    </Button>
                    {account.profileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(account.profileUrl!, '_blank')}
                        data-testid={`button-open-account-${account.id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(account.id)}
                    data-testid={`button-delete-account-${account.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CommunitySection() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts } = useQuery<SocialAccount[]>({
    queryKey: ["/api/admin/social-accounts"],
  });

  const { data: posts, isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/admin/community-posts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/community-posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "포스트가 생성되었습니다." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "생성 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/community-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "포스트가 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hashtagsInput = formData.get("hashtags") as string || "";
    const hashtags = hashtagsInput
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);
    const accountId = formData.get("accountId") as string;
    const data = {
      imageUrl: formData.get("imageUrl") as string,
      caption: formData.get("caption") as string,
      location: formData.get("location") as string,
      sourceUrl: formData.get("sourceUrl") as string || undefined,
      accountId: accountId && accountId !== "none" ? accountId : undefined,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
    };

    createMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">소셜 스트림 관리</h2>
          <p className="text-sm text-muted-foreground mt-1">
            인스타그램/블로그 게시물을 등록하세요. 해시태그로 필터링됩니다.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-community-post">
              <Plus className="w-4 h-4 mr-2" />
              새 포스트
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 소셜 포스트</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">소셜 계정 (선택)</Label>
                <Select name="accountId" defaultValue="none">
                  <SelectTrigger data-testid="select-community-account">
                    <SelectValue placeholder="계정 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">계정 없음</SelectItem>
                    {accounts?.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.platform})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  required
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-community-image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">원본 게시물 링크</Label>
                <Input
                  id="sourceUrl"
                  name="sourceUrl"
                  placeholder="https://instagram.com/p/..."
                  data-testid="input-community-source-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">설명</Label>
                <Textarea
                  id="caption"
                  name="caption"
                  placeholder="게시물 내용"
                  data-testid="input-community-caption"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="예: 안암생활 공유주방"
                  data-testid="input-community-location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags">해시태그 (쉼표로 구분)</Label>
                <Input
                  id="hashtags"
                  name="hashtags"
                  placeholder="소모임, 파티, 원데이클래스, 입주민일상"
                  data-testid="input-community-hashtags"
                />
                <p className="text-xs text-muted-foreground">
                  추천: 소모임, 파티, 원데이클래스, 입주민일상, 플리마켓
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-community-post">
                  생성
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 포스트가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const account = post.accountId ? accounts?.find(a => a.id === post.accountId) : null;
            return (
              <Card key={post.id} data-testid={`card-community-post-${post.id}`}>
                <CardContent className="p-0">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.caption || "커뮤니티 포스트"}
                      className="w-full h-48 object-cover rounded-t-md"
                    />
                  )}
                  <div className="p-4 space-y-2">
                    {account && (
                      <div className="flex items-center gap-2 text-sm">
                        {account.platform === 'instagram' && <SiInstagram className="w-4 h-4" />}
                        <span className="font-medium">{account.name}</span>
                      </div>
                    )}
                    {post.caption && (
                      <p className="text-sm line-clamp-2">{post.caption}</p>
                    )}
                    {post.location && (
                      <p className="text-xs text-muted-foreground">{post.location}</p>
                    )}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      {post.sourceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(post.sourceUrl!, '_blank')}
                          data-testid={`button-open-post-${post.id}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          원본
                        </Button>
                      )}
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(post.id)}
                        data-testid={`button-delete-community-post-${post.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PartnersSection() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/admin/partners"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "파트너가 추가되었습니다" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "파트너 추가 실패", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "파트너가 수정되었습니다" });
      setEditingPartner(null);
    },
    onError: () => {
      toast({ title: "파트너 수정 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "파트너가 삭제되었습니다" });
    },
    onError: () => {
      toast({ title: "파트너 삭제 실패", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      logoUrl: formData.get("logoUrl") as string || null,
      category: formData.get("category") as string,
      displayOrder: parseInt(formData.get("displayOrder") as string) || 0,
    };

    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">파트너 목록</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-partner">
              <Plus className="w-4 h-4 mr-2" />
              파트너 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 파트너 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">파트너명</Label>
                <Input id="name" name="name" required data-testid="input-partner-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">로고 URL</Label>
                <Input id="logoUrl" name="logoUrl" data-testid="input-partner-logo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Input id="category" name="category" placeholder="예: government, investment, construction" data-testid="input-partner-category" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">표시 순서</Label>
                <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" data-testid="input-partner-order" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">취소</Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-partner">
                  추가
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !partners || partners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 파트너가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <Card key={partner.id} data-testid={`card-partner-${partner.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{partner.name}</CardTitle>
                <Badge variant="outline">{partner.category}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {partner.logoUrl && (
                  <img src={partner.logoUrl} alt={partner.name} className="h-12 object-contain" />
                )}
                <p className="text-sm text-muted-foreground">순서: {partner.displayOrder}</p>
                <div className="flex gap-2 pt-2">
                  <Dialog open={editingPartner?.id === partner.id} onOpenChange={(open) => !open && setEditingPartner(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setEditingPartner(partner)} data-testid={`button-edit-partner-${partner.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>파트너 수정</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">파트너명</Label>
                          <Input id="name" name="name" defaultValue={partner.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="logoUrl">로고 URL</Label>
                          <Input id="logoUrl" name="logoUrl" defaultValue={partner.logoUrl || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">카테고리</Label>
                          <Input id="category" name="category" defaultValue={partner.category} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="displayOrder">표시 순서</Label>
                          <Input id="displayOrder" name="displayOrder" type="number" defaultValue={partner.displayOrder ?? 0} />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">취소</Button>
                          </DialogClose>
                          <Button type="submit" disabled={updateMutation.isPending}>저장</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(partner.id)}
                    data-testid={`button-delete-partner-${partner.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function HistorySection() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<HistoryMilestone | null>(null);

  const { data: milestones, isLoading } = useQuery<HistoryMilestone[]>({
    queryKey: ["/api/admin/history"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/history", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
      toast({ title: "연혁이 추가되었습니다" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "연혁 추가 실패", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/history/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
      toast({ title: "연혁이 수정되었습니다" });
      setEditingMilestone(null);
    },
    onError: () => {
      toast({ title: "연혁 수정 실패", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
      toast({ title: "연혁이 삭제되었습니다" });
    },
    onError: () => {
      toast({ title: "연혁 삭제 실패", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      year: parseInt(formData.get("year") as string),
      title: formData.get("title") as string,
      description: formData.get("description") as string || null,
      isHighlight: formData.get("isHighlight") === "on",
      displayOrder: parseInt(formData.get("displayOrder") as string) || 0,
    };

    if (editingMilestone) {
      updateMutation.mutate({ id: editingMilestone.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">연혁 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-history">
              <Plus className="w-4 h-4 mr-2" />
              연혁 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 연혁 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="year">연도</Label>
                <Input id="year" name="year" type="number" required data-testid="input-history-year" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" name="title" required data-testid="input-history-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" name="description" data-testid="input-history-description" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isHighlight" name="isHighlight" data-testid="checkbox-history-highlight" />
                <Label htmlFor="isHighlight">주요 이벤트로 표시</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">표시 순서</Label>
                <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" data-testid="input-history-order" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">취소</Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-history">
                  추가
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : !milestones || milestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 연혁이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <Card key={milestone.id} data-testid={`card-history-${milestone.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant={milestone.isHighlight ? "default" : "outline"}>{milestone.year}</Badge>
                  <CardTitle className="text-base">{milestone.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Dialog open={editingMilestone?.id === milestone.id} onOpenChange={(open) => !open && setEditingMilestone(null)}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setEditingMilestone(milestone)} data-testid={`button-edit-history-${milestone.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>연혁 수정</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="year">연도</Label>
                          <Input id="year" name="year" type="number" defaultValue={milestone.year} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title">제목</Label>
                          <Input id="title" name="title" defaultValue={milestone.title} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">설명</Label>
                          <Textarea id="description" name="description" defaultValue={milestone.description || ""} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="isHighlight" name="isHighlight" defaultChecked={milestone.isHighlight || false} />
                          <Label htmlFor="isHighlight">주요 이벤트로 표시</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="displayOrder">표시 순서</Label>
                          <Input id="displayOrder" name="displayOrder" type="number" defaultValue={milestone.displayOrder ?? 0} />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">취소</Button>
                          </DialogClose>
                          <Button type="submit" disabled={updateMutation.isPending}>저장</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(milestone.id)}
                    data-testid={`button-delete-history-${milestone.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {milestone.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface CompanyStats {
  projectCount: { value: string; label: string };
  householdCount: { value: string; label: string };
  yearsInBusiness: { value: string; label: string };
  awardCount: { value: string; label: string };
}

interface FooterSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  businessNumber: string;
  copyright: string;
}

interface CeoMessage {
  title: string;
  paragraphs: string[];
  signature: string;
}

function SiteSettingsSection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"stats" | "footer" | "ceo">("stats");

  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return apiRequest("PUT", `/api/admin/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "설정이 저장되었습니다" });
    },
    onError: () => {
      toast({ title: "설정 저장 실패", variant: "destructive" });
    },
  });

  const getSetting = (key: string): any => {
    const setting = settings?.find(s => s.key === key);
    return setting?.value || null;
  };

  const defaultStats: CompanyStats = {
    projectCount: { value: "32+", label: "프로젝트" },
    householdCount: { value: "2,500+", label: "세대" },
    yearsInBusiness: { value: "13", label: "년" },
    awardCount: { value: "15+", label: "수상" },
  };

  const defaultFooter: FooterSettings = {
    companyName: "(주)아이부키",
    address: "서울시 성동구 왕십리로 115 헤이그라운드 서울숲점 G409",
    phone: "02-6352-5730",
    email: "hello@ibookee.kr",
    businessNumber: "110-81-77570",
    copyright: "2024 IBOOKEE. All rights reserved.",
  };

  const defaultCeo: CeoMessage = {
    title: "CEO 인사말",
    paragraphs: [
      "아이부키는 사회주택 전문 기업으로서 주거 취약계층의 주거 안정과 삶의 질 향상을 위해 노력하고 있습니다.",
      "우리는 단순히 집을 짓는 것이 아닌, 커뮤니티를 만들고 이웃과 함께하는 삶의 가치를 실현합니다.",
    ],
    signature: "아이부키 대표",
  };

  const handleStatsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stats: CompanyStats = {
      projectCount: { value: formData.get("projectValue") as string, label: formData.get("projectLabel") as string },
      householdCount: { value: formData.get("householdValue") as string, label: formData.get("householdLabel") as string },
      yearsInBusiness: { value: formData.get("yearsValue") as string, label: formData.get("yearsLabel") as string },
      awardCount: { value: formData.get("awardValue") as string, label: formData.get("awardLabel") as string },
    };
    updateMutation.mutate({ key: "company_stats", value: stats });
  };

  const handleFooterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const footer: FooterSettings = {
      companyName: formData.get("companyName") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      businessNumber: formData.get("businessNumber") as string,
      copyright: formData.get("copyright") as string,
    };
    updateMutation.mutate({ key: "footer_settings", value: footer });
  };

  const handleCeoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paragraphsText = formData.get("paragraphs") as string;
    const ceo: CeoMessage = {
      title: formData.get("title") as string,
      paragraphs: paragraphsText.split("\n").filter(p => p.trim()),
      signature: formData.get("signature") as string,
    };
    updateMutation.mutate({ key: "ceo_message", value: ceo });
  };

  const currentStats = getSetting("company_stats") || defaultStats;
  const currentFooter = getSetting("footer_settings") || defaultFooter;
  const currentCeo = getSetting("ceo_message") || defaultCeo;

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">사이트 설정</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("stats")}
            data-testid="tab-stats"
          >
            회사 성과
          </Button>
          <Button
            variant={activeTab === "footer" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("footer")}
            data-testid="tab-footer"
          >
            푸터 정보
          </Button>
          <Button
            variant={activeTab === "ceo" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ceo")}
            data-testid="tab-ceo"
          >
            CEO 메시지
          </Button>
        </div>
      </div>

      {activeTab === "stats" && (
        <Card>
          <CardHeader>
            <CardTitle>회사 성과 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStatsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>프로젝트 수</Label>
                  <div className="flex gap-2">
                    <Input name="projectValue" defaultValue={currentStats.projectCount?.value} placeholder="32+" data-testid="input-stats-project-value" />
                    <Input name="projectLabel" defaultValue={currentStats.projectCount?.label} placeholder="프로젝트" data-testid="input-stats-project-label" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>세대 수</Label>
                  <div className="flex gap-2">
                    <Input name="householdValue" defaultValue={currentStats.householdCount?.value} placeholder="2,500+" data-testid="input-stats-household-value" />
                    <Input name="householdLabel" defaultValue={currentStats.householdCount?.label} placeholder="세대" data-testid="input-stats-household-label" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>업력</Label>
                  <div className="flex gap-2">
                    <Input name="yearsValue" defaultValue={currentStats.yearsInBusiness?.value} placeholder="13" data-testid="input-stats-years-value" />
                    <Input name="yearsLabel" defaultValue={currentStats.yearsInBusiness?.label} placeholder="년" data-testid="input-stats-years-label" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>수상 실적</Label>
                  <div className="flex gap-2">
                    <Input name="awardValue" defaultValue={currentStats.awardCount?.value} placeholder="15+" data-testid="input-stats-award-value" />
                    <Input name="awardLabel" defaultValue={currentStats.awardCount?.label} placeholder="수상" data-testid="input-stats-award-label" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-stats">
                저장
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "footer" && (
        <Card>
          <CardHeader>
            <CardTitle>푸터 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFooterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">회사명</Label>
                <Input id="companyName" name="companyName" defaultValue={currentFooter.companyName} data-testid="input-footer-company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Input id="address" name="address" defaultValue={currentFooter.address} data-testid="input-footer-address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input id="phone" name="phone" defaultValue={currentFooter.phone} data-testid="input-footer-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" name="email" defaultValue={currentFooter.email} data-testid="input-footer-email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자등록번호</Label>
                <Input id="businessNumber" name="businessNumber" defaultValue={currentFooter.businessNumber} data-testid="input-footer-business" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">저작권 문구</Label>
                <Input id="copyright" name="copyright" defaultValue={currentFooter.copyright} data-testid="input-footer-copyright" />
              </div>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-footer">
                저장
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "ceo" && (
        <Card>
          <CardHeader>
            <CardTitle>CEO 메시지</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCeoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" name="title" defaultValue={currentCeo.title} data-testid="input-ceo-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paragraphs">본문 (줄바꿈으로 문단 구분)</Label>
                <Textarea 
                  id="paragraphs" 
                  name="paragraphs" 
                  rows={6} 
                  defaultValue={currentCeo.paragraphs?.join("\n") || ""} 
                  data-testid="input-ceo-paragraphs" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">서명</Label>
                <Input id="signature" name="signature" defaultValue={currentCeo.signature} data-testid="input-ceo-signature" />
              </div>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-ceo">
                저장
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const defaultPageImages = [
  { pageKey: "home", imageKey: "hero", label: "홈 - 히어로 배경", currentUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
  { pageKey: "about", imageKey: "office", label: "About - 오피스 이미지", currentUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { pageKey: "about", imageKey: "ceo", label: "About - CEO 프로필", currentUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
  { pageKey: "business", imageKey: "solution-youth", label: "Business - 청년주택 솔루션", currentUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
  { pageKey: "business", imageKey: "solution-single", label: "Business - 1인가구 솔루션", currentUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
  { pageKey: "business", imageKey: "solution-family", label: "Business - 가족형 솔루션", currentUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
];

function PageImagesSection() {
  const { toast } = useToast();
  const [editingImage, setEditingImage] = useState<{ pageKey: string; imageKey: string; label: string } | null>(null);
  const [newUrl, setNewUrl] = useState("");

  const { data: pageImages, isLoading } = useQuery<PageImage[]>({
    queryKey: ["/api/admin/page-images"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { pageKey: string; imageKey: string; imageUrl: string }) => {
      return apiRequest("PUT", "/api/admin/page-images", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/page-images"] });
      toast({ title: "이미지가 업데이트되었습니다" });
      setEditingImage(null);
      setNewUrl("");
    },
    onError: () => {
      toast({ title: "이미지 업데이트 실패", variant: "destructive" });
    },
  });

  const getImageUrl = (pageKey: string, imageKey: string) => {
    const dbImage = pageImages?.find(img => img.pageKey === pageKey && img.imageKey === imageKey);
    if (dbImage) return dbImage.imageUrl;
    const defaultImage = defaultPageImages.find(img => img.pageKey === pageKey && img.imageKey === imageKey);
    return defaultImage?.currentUrl || "";
  };

  const handleSave = () => {
    if (!editingImage || !newUrl) return;
    updateMutation.mutate({
      pageKey: editingImage.pageKey,
      imageKey: editingImage.imageKey,
      imageUrl: newUrl,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">페이지 이미지 관리</h2>
      </div>
      <p className="text-muted-foreground">
        메인페이지, About, Business 페이지에 표시되는 이미지를 관리합니다. 이미지 URL을 입력하여 변경할 수 있습니다.
      </p>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultPageImages.map((item) => {
            const currentUrl = getImageUrl(item.pageKey, item.imageKey);
            return (
              <Card key={`${item.pageKey}-${item.imageKey}`} data-testid={`card-page-image-${item.pageKey}-${item.imageKey}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="mb-2">{item.pageKey}</Badge>
                      <CardTitle className="text-sm">{item.label}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-video rounded-md overflow-hidden bg-muted">
                    <img 
                      src={currentUrl} 
                      alt={item.label} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                      }}
                    />
                  </div>
                  <Dialog open={editingImage?.pageKey === item.pageKey && editingImage?.imageKey === item.imageKey} onOpenChange={(open) => {
                    if (!open) {
                      setEditingImage(null);
                      setNewUrl("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setEditingImage(item);
                          setNewUrl(currentUrl);
                        }}
                        data-testid={`button-edit-page-image-${item.pageKey}-${item.imageKey}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        이미지 변경
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>이미지 변경: {item.label}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">이미지 URL</Label>
                          <Input 
                            id="imageUrl" 
                            value={newUrl} 
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://..."
                            data-testid="input-page-image-url"
                          />
                        </div>
                        {newUrl && (
                          <div className="aspect-video rounded-md overflow-hidden bg-muted">
                            <img 
                              src={newUrl} 
                              alt="미리보기" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Invalid+URL";
                              }}
                            />
                          </div>
                        )}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">취소</Button>
                          </DialogClose>
                          <Button onClick={handleSave} disabled={updateMutation.isPending || !newUrl} data-testid="button-save-page-image">
                            저장
                          </Button>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
