// src/components/PromptForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sparkles, X, ChevronLeft } from "lucide-react";
import { Category, Prompt } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface PromptFormProps {
  onSave: (data: { 
    title: string; 
    content: string; 
    category: Category; 
    summary: string; 
    tags: string[]; 
    thumbnail?: string | null 
  }) => void;
  initialData?: Prompt;
  isSubmitting?: boolean;
}

export function PromptForm({ onSave, initialData, isSubmitting }: PromptFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [summary, setSummary] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [aiModel, setAiModel] = useState<"gemini" | "big-pickle">("big-pickle");
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCategory(initialData.category);
      setSummary(initialData.summary);
      setThumbnail(initialData.thumbnail || null);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    onSave({
      title: title || "새 프롬프트",
      content,
      category,
      summary: summary || content.substring(0, 50) + "...",
      tags: initialData?.tags || [],
      thumbnail,
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setThumbnail(event.target.result as string);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleAutoFill = async () => {
    if (!content) return;
    setIsAutoFilling(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "autofill", content, model: aiModel }),
      });
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.summary) setSummary(data.summary);
      if (data.category) setCategory(data.category as Category);
    } catch (e) {
      console.error("AI 자동 채우기 실패:", e);
    } finally {
      setIsAutoFilling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto" onPaste={handlePaste}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="content" className="text-lg font-semibold">프롬프트 내용</Label>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{content.length} characters</span>
          </div>
          <Textarea 
            id="content" 
            placeholder="여기에 프롬프트를 붙여넣으세요..." 
            className="min-h-[300px] p-6 resize-none rounded-3xl text-base border-slate-200 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white dark:bg-slate-900 shadow-inner"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="title" className="font-semibold">제목</Label>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{title.length}/20</span>
              </div>
              <Input 
                id="title" 
                placeholder="제목 입력" 
                className="h-12 rounded-2xl border-slate-200 focus:ring-purple-500 text-lg font-medium"
                value={title}
                maxLength={20}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="category" className="font-semibold">카테고리</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Coding">Coding</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="summary" className="font-semibold">한 줄 설명</Label>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{summary.length}/50</span>
                </div>
                <Input 
                  id="summary" 
                  placeholder="프롬프트를 간단히 설명해주세요" 
                  className="h-12 rounded-2xl border-slate-200 focus:ring-purple-500"
                  value={summary}
                  maxLength={50}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-4">
            <Label className="font-semibold block">썸네일 이미지</Label>
            <div className="relative group aspect-square">
              <AnimatePresence mode="wait">
                {thumbnail ? (
                  <motion.div 
                    key="thumbnail"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img src={thumbnail} alt="Thumbnail preview" className="relative w-full h-full object-cover rounded-3xl border-2 border-white dark:border-slate-800 shadow-xl" />
                    <button
                      type="button"
                      onClick={() => setThumbnail(null)}
                      className="absolute -top-3 -right-3 bg-black dark:bg-white text-white dark:text-black rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-10"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm mb-2">
                      <Sparkles size={24} className="text-purple-500" />
                    </div>
                    <p className="text-xs font-medium">Ctrl+V로 이미지 붙여넣기</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setAiModel("gemini")}
                className={`px-4 py-2 font-medium transition-colors ${
                  aiModel === "gemini"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => setAiModel("big-pickle")}
                className={`px-4 py-2 font-medium transition-colors ${
                  aiModel === "big-pickle"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Big Pickle
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full shadow-sm"
              onClick={handleAutoFill}
              disabled={!content || isAutoFilling}
            >
              <Sparkles className={`mr-2 h-4 w-4 text-purple-500 ${isAutoFilling ? "animate-spin" : ""}`} />
              {isAutoFilling ? "분석 중..." : "AI 자동 채우기"}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              className="rounded-full h-12 px-8"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-12 px-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:scale-105 transition-all"
            >
              {isSubmitting ? "저장 중..." : (initialData ? "수정 완료" : "프롬프트 저장")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
