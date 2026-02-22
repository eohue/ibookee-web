import { Link } from "wouter";
import { ArrowRight, CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 md:py-24 bg-card" data-testid="section-cta">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center bg-background rounded-2xl p-8 md:p-12 border border-border shadow-sm">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
              Move-in Inquiry
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              따로 또 같이,<br />
              당신의 첫 번째 소셜 라이프
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              문을 열면 이웃이 있고, 문을 닫으면 온전한 휴식이 있는 곳.
              아이부키의 새로운 공간 소식을 가장 먼저 안내받으세요.
            </p>
            <ul className="space-y-3">
              {[
                "커뮤니티 프로그램 우선 참여",
                "신규 프로젝트 사전 안내",
                "입주 상담 우선 예약",
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground text-sm">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl p-10 h-full border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              입주 문의하기
            </h3>
            <p className="text-muted-foreground mb-8">
              입주를 희망하시는 프로젝트나 궁금한 점을 남겨주시면<br />
              담당자가 신속하게 답변해 드립니다.
            </p>

            <Link href="/contact?type=move-in">
              <Button size="lg" className="h-14 px-8 text-base shadow-md w-full sm:w-auto">
                입주 문의 작성하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
