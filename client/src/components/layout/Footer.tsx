import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { useFooterSettings } from "@/hooks/use-site-settings";
import logoDark from "@assets/logo_square_1766971215447.png";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Business", href: "/business" },
    { name: "Insight", href: "/insight" },
  ],
  services: [
    { name: "Projects", href: "/space" },
    { name: "Community", href: "/community" },
    { name: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  const { footer, isLoading } = useFooterSettings();

  return (
    <footer className="bg-card border-t border-border" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block" data-testid="link-footer-home">
              <img
                src={logoDark}
                alt="IBOOKEE 아이부키"
                className="h-10 w-auto object-contain object-left"
                style={{ maxWidth: '180px' }}
              />
            </Link>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
              공간을 짓고, 삶을 잇다.<br />
              Connect Space, Design Life
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              소셜 하우징 디자이너로서 공공성과 수익성을 결합한 새로운 주거 문화를 만들어갑니다.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{footer.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{footer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{footer.email}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Services
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {footer.copyright}
            </p>
            <div className="flex items-center gap-6">
              <span
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="link-privacy"
              >
                개인정보처리방침
              </span>
              <span
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="link-terms"
              >
                이용약관
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
