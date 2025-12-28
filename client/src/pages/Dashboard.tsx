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
} from "lucide-react";
import type { 
  Project, 
  Inquiry, 
  Article, 
  Event, 
  ResidentProgram, 
  CommunityPost 
} from "@shared/schema";

interface Stats {
  projectCount: number;
  inquiryCount: number;
  articleCount: number;
  communityPostCount: number;
  eventCount: number;
  programCount: number;
}

type Section = "overview" | "projects" | "articles" | "events" | "programs" | "inquiries" | "community";

const menuItems = [
  { id: "overview" as Section, title: "개요", icon: LayoutDashboard },
  { id: "projects" as Section, title: "프로젝트(Space)", icon: Building2 },
  { id: "articles" as Section, title: "인사이트", icon: FileText },
  { id: "events" as Section, title: "행사 관리", icon: CalendarDays },
  { id: "programs" as Section, title: "입주민 프로그램", icon: BookOpen },
  { id: "inquiries" as Section, title: "문의 관리", icon: MessageSquare },
  { id: "community" as Section, title: "커뮤니티", icon: Image },
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
            {activeSection === "community" && <CommunitySection />}
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

function CommunitySection() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    const hashtags = (formData.get("hashtags") as string)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const data = {
      imageUrl: formData.get("imageUrl") as string,
      caption: formData.get("caption") as string,
      location: formData.get("location") as string,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
    };

    createMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">커뮤니티 포스트 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-community-post">
              <Plus className="w-4 h-4 mr-2" />
              새 포스트
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>새 커뮤니티 포스트</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  required
                  data-testid="input-community-image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">설명</Label>
                <Textarea
                  id="caption"
                  name="caption"
                  data-testid="input-community-caption"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <Input
                  id="location"
                  name="location"
                  data-testid="input-community-location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags">해시태그 (쉼표로 구분)</Label>
                <Input
                  id="hashtags"
                  name="hashtags"
                  placeholder="커뮤니티, 이벤트, 일상"
                  data-testid="input-community-hashtags"
                />
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
          {posts.map((post) => (
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
                  <div className="flex justify-end pt-2">
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
          ))}
        </div>
      )}
    </div>
  );
}
