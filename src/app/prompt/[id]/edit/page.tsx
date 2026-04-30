// src/app/prompt/[id]/edit/page.tsx
"use client";

import { use } from "react";
import { PromptForm } from "@/components/PromptForm";
import { usePrompts } from "@/hooks/use-prompts";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditPromptPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPromptPage({ params }: EditPromptPageProps) {
  const { id } = use(params);
  const { prompts, updatePrompt, isLoading } = usePrompts();
  const router = useRouter();

  const prompt = prompts.find((p) => p.id === id);

  const handleSave = async (data: any) => {
    try {
      await updatePrompt(id, data);
      router.push(`/prompt/${id}`);
    } catch (error) {
      console.error("수정 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
        <h1 className="text-2xl font-bold">프롬프트를 찾을 수 없습니다.</h1>
        <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="pl-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              뒤로 가기
            </Button>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-tight uppercase">
                <Sparkles className="w-3 h-3" />
                Edit Mode
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                프롬프트 수정
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                기존 프롬프트를 다듬고 최적화하여 보관하세요.
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <PromptForm onSave={handleSave} initialData={prompt} />
        </div>
      </div>
    </div>
  );
}
