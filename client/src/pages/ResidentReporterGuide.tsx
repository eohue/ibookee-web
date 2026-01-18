import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
    PenTool,
    Camera,
    Users,
    Heart,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Megaphone
} from "lucide-react";

export default function ResidentReporterGuide() {
    const benefits = [
        {
            icon: <Users className="w-6 h-6 text-primary" />,
            title: "이웃과 더 가까워져요",
            description: "인터뷰와 취재를 통해 평소 인사만 하던 이웃들과 깊이 있는 대화를 나눌 수 있습니다."
        },
        {
            icon: <Sparkles className="w-6 h-6 text-primary" />,
            title: "나만의 콘텐츠를 만들어요",
            description: "사진, 글, 영상 등 나만의 시선이 담긴 콘텐츠를 제작하며 크리에이터로서 성장할 수 있습니다."
        },
        {
            icon: <Heart className="w-6 h-6 text-primary" />,
            title: "소정의 활동비를 드려요",
            description: "기사 한 편당 소정의 원고료(현금 또는 포인트)를 지급해 드립니다."
        }
    ];

    const steps = [
        {
            title: "소재 찾기",
            description: "우리 동네의 재미있는 이야기, 소개하고 싶은 이웃, 공유하고 싶은 정보를 찾아보세요."
        },
        {
            title: "취재 및 기록",
            description: "사진을 찍고, 인터뷰를 하거나 직접 체험하며 생생한 현장의 이야기를 담아주세요."
        },
        {
            title: "기사 작성",
            description: "커뮤니티 글쓰기에서 '입주민 기자' 카테고리를 선택하고 기사를 작성해주세요."
        },
        {
            title: "발행 및 공유",
            description: "관리자 승인 후 기사가 발행되면 이웃들과 댓글로 소통하며 이야기를 나누세요."
        }
    ];

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                <Megaphone className="w-4 h-4" />
                                <span>입주민 기자단 모집 중</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                                우리 동네의 이야기를<br className="hidden md:block" />
                                <span className="text-primary">가장 가까운 곳</span>에서 전해주세요
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                                아이부키 입주민 기자단은 우리들이 살아가는 평범하지만 특별한 일상을 기록합니다.<br />
                                당신의 따뜻한 시선으로 이웃의 이야기를 들려주세요.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/community">
                                    <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold group">
                                        기사 쓰러 가기
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                {/* <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                  지난 기사 보기
                </Button> */}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">입주민 기자가 되면 무엇이 좋나요?</h2>
                            <p className="text-muted-foreground">기자단 활동을 통해 얻을 수 있는 특별한 혜택을 소개합니다.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {benefits.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="p-8 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-border/50 text-center"
                                >
                                    <div className="w-12 h-12 mx-auto bg-background rounded-full flex items-center justify-center shadow-sm mb-6">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="py-24 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="lg:w-1/2">
                                <h2 className="text-3xl font-bold mb-6">활동은 어렵지 않아요</h2>
                                <p className="text-muted-foreground mb-8">
                                    전문적인 글쓰기 실력은 필요하지 않습니다.<br />
                                    솔직하고 담백한 여러분의 목소리면 충분해요.
                                </p>

                                <div className="space-y-8">
                                    {steps.map((step, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                                                <p className="text-muted-foreground text-sm">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:w-1/2 w-full">
                                <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                        alt="Writing a story"
                                        className="object-cover w-full h-full"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                        <div className="text-white">
                                            <p className="font-medium text-lg">"이웃의 미소를 기록하는 일, 생각보다 훨씬 벅찬 감동이었어요."</p>
                                            <p className="text-white/80 text-sm mt-2">- 3기 입주민 기자 김철수님</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 시작해보세요</h2>
                        <p className="text-muted-foreground text-lg mb-10">
                            망설이지 마세요. 당신의 이야기가 안암생활을 더욱 풍요롭게 만듭니다.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/community">
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                    <PenTool className="w-5 h-5 mr-2" />
                                    기자단 활동 시작하기
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full">
                                    문의하기
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
