import { db } from "../server/db";
import { mentors, mentoringConsultations } from "../shared/schema";
import { count } from "drizzle-orm";

async function seed() {
  console.log("🌱 멘토 및 멘토링 상담 데이터 시딩 시작...");

  const existingMentorsCount = await db.select({ count: count() }).from(mentors);
  if (existingMentorsCount[0].count > 0) {
    console.log(`ℹ️ 이미 ${existingMentorsCount[0].count}명의 멘토가 등록되어 있습니다. 시딩을 건너뜁니다.`);
    process.exit(0);
  }

  // 1. 멘토 2명 등록 (회계사, 법무사)
  const [mentorFinance] = await db.insert(mentors).values({
    name: "정우진",
    title: "공인회계사 / 세무사",
    organization: "세무법인 한울",
    category: "finance",
    profileImageUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=80",
    bio: "사회초년생과 청년 1인 가구가 건강한 재정적 독립을 이룰 수 있도록 돕습니다. 연말정산, 청년 금융상품 활용, 프리랜서 종합소득세, 합리적인 자산형성 플랜을 함께 고민합니다.",
    expertiseTopics: ["청년 재무설계", "연말정산 꿀팁", "프리랜서 세무", "자산형성 로드맵"],
    consultingType: "both",
    availableSchedule: "매주 화·목 저녁 19:30~21:00 (온라인 Zoom 또는 전화)",
    status: "active",
    displayOrder: 10,
  }).returning();

  const [mentorLaw] = await db.insert(mentors).values({
    name: "박서연",
    title: "법무사",
    organization: "이음 법무사사무소",
    category: "law",
    profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "임대차 계약, 전세보증금 반환, 일상 속 법률 분쟁 등 청년들이 주거 생활에서 겪는 법적 권리를 지켜드립니다. 법률 용어의 장벽을 낮추고 명쾌한 해결책을 제시해 드립니다.",
    expertiseTopics: ["임대차 계약서 검토", "전세보증금 보호", "내용증명 작성법", "생활 법률 자문"],
    consultingType: "both",
    availableSchedule: "매주 수·토 오후 14:00~17:00 (비대면 / 서대문 공용공간 대면)",
    status: "active",
    displayOrder: 20,
  }).returning();

  console.log(`✅ 멘토 2명 등록 완료: ${mentorFinance.name}, ${mentorLaw.name}`);

  // 2. 샘플 상담 질의응답 시딩
  // 1) 공개 상담 - 세무 (답변 완료)
  await db.insert(mentoringConsultations).values({
    mentorId: mentorFinance.id,
    authorNickname: "보린3호_초년생",
    category: "finance",
    title: "사회초년생 첫 연말정산, 월세 세액공제와 소득공제 중 무엇이 유리한가요?",
    content: "올해 처음 취업한 청년 입주민입니다. 현재 사회주택에 거주하면서 매달 월세를 납부하고 있는데, 연말정산 시 월세 세액공제와 현금영수증 소득공제 중 어떤 방식으로 신청하는 것이 세금 환급에 더 유리한지 궁금합니다. 계약자 명의와 세대주 요건도 헷갈려요.",
    isSecret: false,
    requestMeeting: false,
    status: "answered",
    answer: "안녕하세요, 입주민님! 첫 연말정산이라 생소하실 텐데 아주 좋은 질문입니다.\n\n결론부터 말씀드리면 일반적으로 **'월세 세액공제'가 환급액 면에서 훨씬 유리**합니다.\n1. **월세 세액공제**: 총급여 7천만원 이하 무주택 세대주일 경우 지출한 월세액의 15%~17%를 산출세액에서 직접 차감합니다 (연 최대 750만원 한도).\n2. **현금영수증 소득공제**: 과세표준을 줄여주는 방식이므로 실질 환급 효과는 세액공제보다 적은 편입니다.\n\n단, 전입신고가 완료되어 주민등록등본상 주소지와 임대차계약서상 주소지가 일치해야 하니 이 점을 꼭 확인하세요!",
    answeredBy: mentorFinance.id,
    answeredAt: new Date(),
    views: 124,
  });

  // 2) 공개 상담 - 법률 (답변 완료)
  await db.insert(mentoringConsultations).values({
    mentorId: mentorLaw.id,
    authorNickname: "연희_독립러",
    category: "law",
    title: "임대차 계약 만료 전 퇴실 시, 중개수수료 부담 주체와 통보 시점이 궁금합니다.",
    content: "계약 기간이 4개월 정도 남았는데, 회사 이직으로 다른 지역으로 이사를 가야 할 상황입니다. 계약 만료 전 중도 해지 시 새로운 세입자를 구할 때 발생하는 중개수수료는 통상 임차인이 부담해야 하나요? 집주인에게 언제 어떻게 통보하는 것이 법적으로 안전한가요?",
    isSecret: false,
    requestMeeting: true,
    preferredSchedule: "평일 저녁 8시 이후 유선 상담 희망",
    meetingStatus: "scheduled",
    status: "answered",
    answer: "안녕하세요! 이직 축하드리며 궁금하신 점에 대해 답변드립니다.\n\n1. **법적 원칙과 실무 관행**:\n법률상으로는 임대차 계약 기간 중 임차인의 사정으로 중도 해지할 권리는 원칙적으로 없습니다. 따라서 임대인과의 합의가 필수적인데, 실무 관행상 '기존 임차인이 다음 임차인을 구하고 중개수수료를 부담하는 조건'으로 합의 해지하는 것이 일반적입니다.\n\n2. **대응 요령**:\n이사 예정일 기준 최소 2~3개월 전에 임대인에게 정중히 사정을 알리고 양해를 구하시는 것이 좋습니다. 필요하시면 전화로 더 자세한 합의서 작성 요령을 안내해 드릴게요.",
    answeredBy: mentorLaw.id,
    answeredAt: new Date(),
    views: 89,
  });

  // 3) 비공개 상담 - 비밀글 (답변 대기)
  await db.insert(mentoringConsultations).values({
    mentorId: mentorFinance.id,
    authorNickname: "홍*수",
    category: "finance",
    title: "학자금 대출 상환과 청년도약계좌 납입 비중 조율에 관한 개인 상담 요청",
    content: "현재 남아있는 학자금 대출 원리금 상환과 청년도약계좌 납입을 병행하고 있습니다. 소득 대비 대출 상환 우선순위를 어떻게 잡아야 할지 가계부 내역과 함께 상담받고 싶어 비밀글로 남깁니다.",
    isSecret: true,
    requestMeeting: true,
    preferredSchedule: "화요일 저녁 8시 온라인 Zoom",
    meetingStatus: "requested",
    status: "pending",
    views: 12,
  });

  console.log("✅ 샘플 상담 데이터 3건 시딩 완료!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ 시딩 실패:", err);
  process.exit(1);
});
