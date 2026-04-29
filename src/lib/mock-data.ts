// src/lib/mock-data.ts
import { Prompt } from "@/types";

export const MOCK_PROMPTS: Prompt[] = [
  {
    id: "1",
    user_id: "user1",
    title: "Modern UI Design System Generator",
    content: "Act as a senior UI/UX designer. Create a comprehensive design system for a SaaS product including color palettes, typography, and component guidelines.",
    category: "Design",
    summary: "SaaS 제품을 위한 종합적인 UI/UX 디자인 시스템 가이드라인 생성 프롬프트",
    tags: ["UI", "UX", "SaaS", "Design System"],
    is_favorite: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user1",
    title: "Next.js & Tailwind Component Expert",
    content: "You are an expert frontend developer. Help me build accessible and responsive components using Next.js 14 and Tailwind CSS v4.",
    category: "Coding",
    summary: "Next.js와 Tailwind를 사용한 접근성 높은 컴포넌트 개발 지원",
    tags: ["React", "Next.js", "Tailwind", "Frontend"],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "user1",
    title: "Marketing Copywriter for SNS",
    content: "Write engaging marketing copy for Instagram and LinkedIn. Focus on high conversion and brand storytelling.",
    category: "Marketing",
    summary: "SNS 마케팅 성과 극대화를 위한 카피라이팅 프롬프트",
    tags: ["Marketing", "SNS", "Copywriting"],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
