import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Sun, Moon, User, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useScrollVisible } from "@/hooks/use-scroll-visible";
import logoWhite from "@assets/logo_white.png";
import logoDark from "@assets/logo_dark.png";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "About Us", href: "/about" },
  { name: "Business", href: "/business" },
  { name: "Space", href: "/space" },
  { name: "Life", href: "/community" },
  { name: "Insight", href: "/insight" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [location] = useLocation();
  const { isVisible, isScrolled } = useScrollVisible();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, logoutMutation } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const isHomePage = location === "/";
  // Refined transparency logic
  const isTransparent = isHomePage && !isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isTransparent
          ? "bg-transparent border-transparent py-4"
          : "bg-background/80 backdrop-blur-md border-border py-2",
        !isVisible && "-translate-y-full"
      )}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center z-50 relative"
            data-testid="link-home"
          >
            <img
              src={isTransparent && !isDark ? logoWhite : (isDark ? logoWhite : logoDark)}
              alt="IBOOKEE 아이부키"
              className="h-8 md:h-10 w-auto object-contain object-left transition-all duration-300"
              style={{ maxWidth: '160px' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <NavigationMenu className="max-w-none">
              <NavigationMenuList className="gap-1">
                {navigation.map((item) => {
                  const isEmphasis = item.name === "Space" || item.name === "Life";
                  const isActive = location === item.href;

                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href}>
                        <NavigationMenuLink
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "h-10 px-4 text-base transition-all bg-transparent hover:bg-transparent focus:bg-transparent",
                            isTransparent
                              ? "text-white hover:text-white/80 focus:text-white"
                              : "text-foreground hover:text-primary focus:text-primary",
                            isActive && !isTransparent && "text-primary font-semibold",
                            isActive && isTransparent && "text-white font-bold bg-white/10",
                            isEmphasis ? "font-bold text-lg" : "font-light"
                          )}
                        >
                          {item.name}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className={cn(
                "rounded-full transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10 hover:text-white"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {!authLoading && (
              isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "hidden md:flex gap-2 rounded-full px-4",
                        isTransparent
                          ? "text-white hover:bg-white/10 hover:text-white"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user?.firstName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/mypage" className="cursor-pointer w-full flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        마이페이지
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer w-full flex items-center">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          관리자
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/20"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button
                    variant={isTransparent ? "ghost" : "default"}
                    size="sm"
                    className={cn(
                      "hidden md:flex rounded-full gap-2",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : ""
                    )}
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4" />
                    로그인
                  </Button>
                </Link>
              )
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "rounded-full",
                    isTransparent ? "text-white hover:bg-white/10" : ""
                  )}
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] pr-0">
                <SheetHeader className="px-6 mb-8 text-left">
                  <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4">
                  {navigation.map((item) => {
                    const isEmphasis = item.name === "Space" || item.name === "Life";
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "px-4 py-3 rounded-lg transition-all duration-200",
                          isEmphasis ? "font-bold text-xl" : "text-base font-light",
                          isActive
                            ? "bg-primary/10 text-primary translate-x-1"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}

                  <div className="my-4 h-px bg-border mx-4" />

                  <div className="px-4 space-y-2">
                    {!authLoading && (
                      isAuthenticated ? (
                        <>
                          <Link
                            href="/mypage"
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <User className="w-5 h-5" />
                            마이페이지
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <LayoutDashboard className="w-5 h-5" />
                              관리자
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              logoutMutation.mutate();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            로그아웃
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/auth"
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="w-5 h-5" />
                          로그인
                        </Link>
                      )
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
