import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollVisible } from "@/hooks/use-scroll-visible";

const navItems = [
    { name: "About Us", href: "/about" },
    { name: "Business", href: "/business" },
    { name: "Insight", href: "/insight" },
    { name: "Contact", href: "/contact" },
];

export function IbookeeSubNav({ className }: { className?: string }) {
    const [location] = useLocation();
    const { isVisible } = useScrollVisible();

    const isActive = (href: string) => {
        if (href === "/insight" && location.startsWith("/insight")) return true;
        return location === href;
    };

    return (
        <section
            className={cn(
                "sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border py-3 transition-[top] duration-300",
                isVisible ? "top-[60px]" : "top-0",
                className
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-2">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={isActive(item.href) ? "default" : "outline"}
                                size="lg"
                                className="rounded-full text-base font-medium px-6"
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
