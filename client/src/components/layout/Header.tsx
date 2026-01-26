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
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import logoWhite from "@assets/logo_white.png";
import logoDark from "@assets/logo_dark.png";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const headerBg = isScrolled || !isHomePage
    ? "glass border-x-0 border-t-0 rounded-none"
    : "bg-transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="flex items-center"
            data-testid="link-home"
          >
            <img
              src={isScrolled || (!isHomePage && !isDark) ? (isDark ? logoWhite : logoDark) : logoWhite}
              alt="IBOOKEE 아이부키"
              className="h-8 md:h-10 w-auto object-contain object-left"
              style={{ maxWidth: '160px' }}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const isEmphasis = item.name === "Space" || item.name === "Life";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-md transition-colors ${isEmphasis ? "font-black text-xl" : "text-sm font-medium"
                    } ${location === item.href
                      ? isScrolled || !isHomePage
                        ? "text-primary bg-primary/10"
                        : "text-white bg-white/20"
                      : isScrolled || !isHomePage
                        ? "text-foreground hover:text-primary hover:bg-muted"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  data-testid={`link-nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className={isScrolled || !isHomePage ? "" : "text-white hover:bg-white/10"}
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
                      className={`hidden md:flex gap-2 ${isScrolled || !isHomePage ? "" : "text-white hover:bg-white/10"}`}
                    >
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user?.firstName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                      className="text-red-600 focus:text-red-600 cursor-pointer"
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
                    variant="ghost"
                    size="sm"
                    className={`hidden md:flex ${isScrolled || !isHomePage ? "" : "text-white hover:bg-white/10"}`}
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
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
                  className={isScrolled || !isHomePage ? "" : "text-white hover:bg-white/10"}
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-2 mt-8">
                  {navigation.map((item) => {
                    const isEmphasis = item.name === "Space" || item.name === "Life";
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`px-4 py-3 rounded-md transition-colors ${isEmphasis ? "font-black text-2xl" : "text-base font-medium"
                          } ${location === item.href
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:text-primary hover:bg-muted"
                          }`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`link-mobile-nav-${item.name.toLowerCase().replace(" ", "-")}`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}

                  <div className="border-t border-border mt-4 pt-4">
                    {!authLoading && (
                      isAuthenticated ? (
                        user?.role === 'admin' ? (
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-md text-foreground hover:text-primary hover:bg-muted"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="link-mobile-dashboard"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            관리자
                          </Link>
                        ) : (
                          <Link
                            href="/mypage"
                            className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-md text-foreground hover:text-primary hover:bg-muted"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="link-mobile-mypage"
                          >
                            <User className="w-5 h-5" />
                            마이페이지
                          </Link>
                        )
                      ) : (
                        <Link
                          href="/auth"
                          className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-md text-foreground hover:text-primary hover:bg-muted"
                          data-testid="link-mobile-login"
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
