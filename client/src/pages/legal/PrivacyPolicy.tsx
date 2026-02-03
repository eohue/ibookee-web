import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                        <p className="text-muted-foreground">
                            (주)아이부키(이하 '회사')는 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다.
                        </p>
                        <h3 className="text-xl font-semibold mt-8 mb-4">1. 수집하는 개인정보 항목</h3>
                        <p>
                            회사는 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
                        </p>
                        <ul className="list-disc pl-5 my-4 space-y-2">
                            <li>수집항목: 이름, 생년월일, 휴대전화번호, 이메일</li>
                            <li>개인정보 수집방법: 홈페이지(회원가입, 상담신청)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-8 mb-4">2. 개인정보의 수집 및 이용목적</h3>
                        <p>
                            회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
                        </p>
                        <ul className="list-disc pl-5 my-4 space-y-2">
                            <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                            <li>회원 관리</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-8 mb-4">3. 개인정보의 보유 및 이용기간</h3>
                        <p>
                            원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
                        </p>
                        <p className="mt-8 text-sm text-muted-foreground">
                            이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
