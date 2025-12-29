import { useQuery } from "@tanstack/react-query";
import type { SiteSetting, PageImage } from "@shared/schema";

interface CompanyStats {
  projectCount: { value: string; label: string };
  householdCount: { value: string; label: string };
  yearsInBusiness: { value: string; label: string };
  awardCount: { value: string; label: string };
}

interface FooterSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  businessNumber: string;
  copyright: string;
}

interface CeoMessage {
  title: string;
  paragraphs: string[];
  signature: string;
}

const defaultStats: CompanyStats = {
  projectCount: { value: "32+", label: "완공 프로젝트" },
  householdCount: { value: "2,500+", label: "입주 세대" },
  yearsInBusiness: { value: "13년", label: "업력" },
  awardCount: { value: "15+", label: "수상 실적" },
};

const defaultFooter: FooterSettings = {
  companyName: "(주)아이부키",
  address: "서울특별시 성동구 왕십리로 115",
  phone: "02-1234-5678",
  email: "contact@ibookee.kr",
  businessNumber: "110-81-77570",
  copyright: "2025 IBOOKEE. All rights reserved.",
};

const defaultCeo: CeoMessage = {
  title: "CEO 인사말",
  paragraphs: [
    "아이부키는 사회주택 전문 기업으로서 주거 취약계층의 주거 안정과 삶의 질 향상을 위해 노력하고 있습니다.",
    "우리는 단순히 집을 짓는 것이 아닌, 커뮤니티를 만들고 이웃과 함께하는 삶의 가치를 실현합니다.",
  ],
  signature: "아이부키 대표",
};

async function fetchSetting<T>(key: string): Promise<T | null> {
  try {
    const response = await fetch(`/api/settings/${key}`);
    if (!response.ok) return null;
    const setting = await response.json();
    return setting.value as T;
  } catch {
    return null;
  }
}

export function useCompanyStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/settings", "company_stats"],
    queryFn: () => fetchSetting<CompanyStats>("company_stats"),
    staleTime: 60000,
  });

  return {
    stats: data || defaultStats,
    isLoading,
  };
}

export function useFooterSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/settings", "footer_settings"],
    queryFn: () => fetchSetting<FooterSettings>("footer_settings"),
    staleTime: 60000,
  });

  return {
    footer: data || defaultFooter,
    isLoading,
  };
}

export function useCeoMessage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/settings", "ceo_message"],
    queryFn: () => fetchSetting<CeoMessage>("ceo_message"),
    staleTime: 60000,
  });

  return {
    ceoMessage: data || defaultCeo,
    isLoading,
  };
}

const defaultPageImages: Record<string, Record<string, string>> = {
  home: {
    hero: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  },
  about: {
    office: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ceo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  business: {
    "solution-youth": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "solution-single": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "solution-family": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
};

export function usePageImages() {
  const { data: pageImages, isLoading } = useQuery<PageImage[]>({
    queryKey: ["/api/page-images"],
    staleTime: 60000,
  });

  const getImageUrl = (pageKey: string, imageKey: string): string => {
    const dbImage = pageImages?.find(img => img.pageKey === pageKey && img.imageKey === imageKey);
    if (dbImage) return dbImage.imageUrl;
    return defaultPageImages[pageKey]?.[imageKey] || "";
  };

  return {
    getImageUrl,
    isLoading,
    pageImages,
  };
}

export { defaultStats, defaultFooter, defaultCeo, defaultPageImages };
export type { CompanyStats, FooterSettings, CeoMessage };
