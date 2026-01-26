export interface Stats {
    projectCount: number;
    inquiryCount: number;
    articleCount: number;
    communityPostCount: number;
    eventCount: number;
    programCount: number;
    partnerCount: number;
    userCount: number;
    adminCount: number;
    residentCount: number;
    milestoneCount: number;
    reporterArticleCount: number;
    pendingReporterCount: number;
    approvedReporterCount: number;
    applicationCount: number;
    pendingApplicationCount: number;
}

export interface CompanyStats {
    projectCount: { value: string; label: string };
    householdCount: { value: string; label: string };
    yearsInBusiness: { value: string; label: string };
    awardCount: { value: string; label: string };
}

export interface FooterSettings {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    businessNumber: string;
    copyright: string;
}

export interface CeoMessage {
    title: string;
    ceoName: string;
    paragraphs: string[];
    signature: string;
}
