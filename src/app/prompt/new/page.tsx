// src/app/prompt/new/page.tsx
"use client";

import { PromptForm } from "@/components/PromptForm";
import { usePrompts } from "@/hooks/use-prompts";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewPromptPage() {
  const { addPrompt } = usePrompts();
  const router = useRouter();

  const handleSave = async (data: any) => {
    try {
      await addPrompt(data);
      router.push("/");
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-tight uppercase">
                <Sparkles className="w-3 h-3" />
                New Collection
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                새 프롬프트 추가
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                당신의 창의적인 프롬프트를 보관하고 AI와 함께 더 발전시키세요.
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <PromptForm onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
