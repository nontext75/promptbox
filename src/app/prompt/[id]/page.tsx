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
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function PromptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { prompts, toggleFavorite, deletePrompt, updatePrompt, addPrompt } = usePrompts();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [aiCommand, setAiCommand] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);
  const [aiModel, setAiModel] = useState<"gemini" | "big-pickle">("big-pickle");
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

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(prompt.content);
    const btn = e.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>복사 완료!`;
    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
  };

  const handleAiModify = async (customCommand?: string) => {
    const finalCommand = customCommand || aiCommand;
    if (!finalCommand || !prompt) return;
    setIsTransforming(true);
    setAiResult(""); // 이전 결과 초기화
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "transform", 
          content: prompt.content, 
          command: finalCommand, 
          model: aiModel 
        }),
      });
      const data = await res.json();
      if (data.result) setAiResult(data.result);
      else setAiResult("AI 변형에 실패했습니다.");
    } catch (e) {
      console.error("AI 변형 실패:", e);
      setAiResult("AI 변형에 실패했습니다.");
    } finally {
      setIsTransforming(false);
    }
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

  const handleUpdateCurrent = () => {
    if (!aiResult) return;
    updatePrompt(prompt.id, {
      ...prompt,
      content: aiResult,
    });
    setAiResult("");
    setShowAiAssist(false);
  };

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deletePrompt(prompt.id);
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1000px] mx-auto px-6 py-12 space-y-10"
      >
        
        {/* Navigation */}
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>

        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full -ml-12 -mb-12 blur-3xl" />
          
          <div className="space-y-5 relative z-10">
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold rounded-full px-5 py-1.5 text-[10px] tracking-widest uppercase">
              {prompt.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              {prompt.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed max-w-xl">
              {prompt.summary}
            </p>
          </div>
          <div className="flex gap-3 relative z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-14 h-14 border-slate-200 bg-white dark:bg-slate-800 shadow-md hover:scale-110 transition-transform"
              onClick={() => toggleFavorite(prompt.id)}
            >
              <Star className={prompt.is_favorite ? "fill-yellow-500 text-yellow-500" : ""} size={24} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-14 h-14 border-slate-200 bg-white dark:bg-slate-800 shadow-md hover:scale-110 transition-transform hover:text-red-500 hover:border-red-200"
              onClick={handleDelete}
            >
              <Trash size={24} />
            </Button>
          </div>
        </section>

        {/* Content Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
              프롬프트 내용
              <div className="ml-3 h-1 w-12 bg-purple-500 rounded-full" />
            </h2>
            <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-full px-6 h-10 font-bold border-slate-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95">
              <Copy className="mr-2 h-4 w-4" />
              전체 복사
            </Button>
          </div>
          
          <div className="space-y-6">
            <AnimatePresence>
              {prompt.thumbnail && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
                >
                  <img src={prompt.thumbnail} alt="Thumbnail" className="w-full h-auto max-h-[500px] object-cover" />
                </motion.div>
              )}
            </AnimatePresence>

            <Card className="rounded-[40px] border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] w-full p-10">
                  <pre className="whitespace-pre-wrap font-mono text-base text-slate-700 dark:text-slate-300 leading-relaxed selection:bg-purple-200 dark:selection:bg-purple-900/50">
                    {cleanDisplayContent(prompt.content)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Action Bar & AI Assist */}
        <section className="space-y-8 pb-20">
          <div className="flex flex-wrap gap-4 px-2">
            <Button 
              size="lg" 
              className="rounded-full h-16 px-10 text-lg font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={() => router.push(`/prompt/${prompt.id}/edit`)}
            >
              <Edit className="mr-3 h-6 w-6" />
              프롬프트 수정
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full h-16 px-10 text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all bg-slate-200 dark:bg-slate-800"
              onClick={() => setShowAiAssist(!showAiAssist)}
            >
              <Sparkles className="mr-3 h-6 w-6 text-purple-600" />
              AI 어시스턴트
            </Button>
          </div>

          <AnimatePresence>
            {showAiAssist && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="rounded-[40px] border-2 border-purple-100 dark:border-purple-900/30 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-900 p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                  
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-2xl flex items-center tracking-tight text-slate-900 dark:text-white">
                        <Sparkles className="mr-3 h-6 w-6 text-purple-500 animate-pulse" />
                        AI 변형 요청
                      </h3>
                      <div className="flex items-center p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                        {["gemini", "big-pickle"].map((m) => (
                          <button
                            key={m}
                            onClick={() => setAiModel(m as any)}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                              aiModel === m
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md scale-105"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                          >
                            {m === "gemini" ? "Gemini 2.0" : "Big Pickle"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "✨ 최적화", cmd: "이 프롬프트를 더 정교하고 효과적으로 개선해줘." },
                        { label: "📝 요약", cmd: "이 프롬프트의 핵심 내용을 유지하면서 짧게 요약해줘." },
                        { label: "🌐 영문 번역", cmd: "이 프롬프트를 영어로 번역해줘." },
                        { label: "💡 창의적 변형", cmd: "이 프롬프트에 창의적인 요소를 추가해서 색다르게 변형해줘." },
                      ].map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-[10px] h-8 bg-white/50 dark:bg-slate-800/50 border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          onClick={() => {
                            setAiCommand(action.cmd);
                            handleAiModify(action.cmd);
                          }}
                          disabled={isTransforming}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 group">
                        <Input
                          placeholder="어떻게 바꿔드릴까요? (직접 입력)"
                          className="rounded-[24px] h-16 pl-6 text-lg bg-white dark:bg-slate-900 border-slate-200 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-inner"
                          value={aiCommand}
                          onChange={(e) => setAiCommand(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiModify()}
                        />
                      </div>
                      <Button 
                        size="lg"
                        className="rounded-[24px] h-16 px-10 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50" 
                        onClick={() => handleAiModify()} 
                        disabled={isTransforming || !aiCommand}
                      >
                        {isTransforming ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            생성 중...
                          </div>
                        ) : "프롬프트 변형"}
                      </Button>
                    </div>
                    
                    <AnimatePresence>
                      {aiResult && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6 pt-8 border-t border-purple-100 dark:border-purple-900/30"
                        >
                          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border-2 border-purple-100 dark:border-purple-900/30 shadow-xl relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest"
                                onClick={() => navigator.clipboard.writeText(aiResult)}
                              >
                                결과 복사
                              </Button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-base whitespace-pre-wrap">
                              {cleanDisplayContent(aiResult)}
                            </p>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="ghost" className="rounded-full h-12 px-8 font-bold text-slate-500" onClick={() => setAiResult("")}>취소</Button>
                            <Button variant="outline" className="rounded-full h-12 px-8 font-bold border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={handleUpdateCurrent}>
                              현재 내용 덮어쓰기
                            </Button>
                            <Button className="rounded-full h-12 px-8 font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-all text-white shadow-xl shadow-purple-500/20" onClick={handleSaveVersion}>
                              새 버전으로 저장
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </motion.div>
    </main>
  );
}
