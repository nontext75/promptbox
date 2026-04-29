// src/app/prompt/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { usePrompts } from "@/hooks/use-prompts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Edit, Trash, Star, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Prompt } from "@/types";
import { PromptModal } from "@/components/PromptModal";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PromptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { prompts, toggleFavorite, deletePrompt, updatePrompt, addPrompt } = usePrompts();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [aiCommand, setAiCommand] = useState("");
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    const found = prompts.find((p) => p.id === id);
    if (found) setPrompt(found);
  }, [id, prompts]);

  if (!prompt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">프롬프트를 찾는 중...</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
  };

  const handleAiModify = () => {
    if (!aiCommand) return;
    // Mock AI transformation
    setAiResult(`[AI 변형 결과]: ${prompt.content}\n(요청하신 "${aiCommand}"에 맞춰 변형된 내용입니다.)`);
  };

  const cleanDisplayContent = (text: string) => {
    return text.replace(/\n\s*\n+/g, '\n').trim();
  };

  const handleSaveVersion = () => {
    if (!aiResult) return;
    addPrompt({
      title: `${prompt.title} (v2)`,
      content: aiResult,
      category: prompt.category,
      summary: `${prompt.title}의 AI 변형 버전입니다.`,
    });
    router.push("/");
  };

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deletePrompt(prompt.id);
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-8">
        
        {/* Navigation */}
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>

        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-4 py-1">
              {prompt.category}
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {prompt.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {prompt.summary}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12"
              onClick={() => toggleFavorite(prompt.id)}
            >
              <Star className={prompt.is_favorite ? "fill-yellow-500 text-yellow-500" : ""} size={20} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12 hover:text-red-500"
              onClick={handleDelete}
            >
              <Trash size={20} />
            </Button>
          </div>
        </section>

        {/* Content Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              프롬프트 내용
            </h2>
            <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-full">
              <Copy className="mr-2 h-4 w-4" />
              전체 복사
            </Button>
          </div>
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] w-full p-8">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-snug">
                  {cleanDisplayContent(prompt.content)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* Action Bar & AI Assist */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-wrap gap-4">
            <PromptModal 
              initialData={prompt} 
              onSave={(data) => updatePrompt(prompt.id, data)}
              trigger={
                <Button size="lg" className="rounded-full px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                  <Edit className="mr-2 h-5 w-5" />
                  수정하기
                </Button>
              }
            />
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-8"
              onClick={() => setShowAiAssist(!showAiAssist)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              AI로 변형하기
            </Button>
          </div>

          {showAiAssist && (
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-6 animate-in slide-in-from-top-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  AI 변형 요청
                </h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="예: 더 짧게 줄여줘, 마케팅 문구로 바꿔줘..." 
                    className="rounded-xl bg-white dark:bg-slate-900"
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                  />
                  <Button className="rounded-xl" onClick={handleAiModify}>변형 요청</Button>
                </div>
                
                {aiResult && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                        {cleanDisplayContent(aiResult)}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" className="rounded-full" onClick={() => setAiResult("")}>취소</Button>
                      <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSaveVersion}>
                        새 버전으로 저장
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </section>

      </div>
    </main>
  );
}
