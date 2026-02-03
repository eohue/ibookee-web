import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsOfService() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8">이용약관</h1>
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                        <h3 className="text-xl font-semibold mt-8 mb-4">제1조 (목적)</h3>
                        <p>
                            본 약관은 (주)아이부키(이하 '회사')가 제공하는 서비스의 이용조건 및 절차, 이용자와 회사의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </p>

                        <h3 className="text-xl font-semibold mt-8 mb-4">제2조 (약관의 효력 및 변경)</h3>
                        <ol className="list-decimal pl-5 my-4 space-y-2">
                            <li>본 약관은 서비스를 이용하고자 하는 모든 회원에게 효력을 발생합니다.</li>
                            <li>회사는 약관의 규제에 관한 법률 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
                        </ol>

                        <h3 className="text-xl font-semibold mt-8 mb-4">제3조 (용어의 정의)</h3>
                        <p>
                            본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                        </p>
                        <ul className="list-disc pl-5 my-4 space-y-2">
                            <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                            <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-8 mb-4">제4조 (서비스의 제공 및 변경)</h3>
                        <p>
                            회사는 이용자에게 아래와 같은 서비스를 제공합니다.
                        </p>
                        <ul className="list-disc pl-5 my-4 space-y-2">
                            <li>주거 공간 정보 제공 서비스</li>
                            <li>커뮤니티 서비스</li>
                            <li>기타 회사가 정하는 서비스</li>
                        </ul>

                        <p className="mt-8 text-sm text-muted-foreground">
                            이 약관은 2024년 1월 1일부터 시행합니다.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
