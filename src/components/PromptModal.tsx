// src/components/PromptModal.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
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
import { Plus, Sparkles, Edit, X, Image as ImageIcon } from "lucide-react";
import { Category, Prompt } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface PromptModalProps {
  onSave: (data: { title: string; content: string; category: Category; summary: string; tags: string[]; thumbnail?: string | null }) => void;
  initialData?: Prompt;
  trigger?: React.ReactNode;
}

export function PromptModal({ onSave, initialData, trigger }: PromptModalProps) {
  const [open, setOpen] = useState(false);
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
  }, [initialData, open]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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

    if (!initialData) {
      setTitle("");
      setContent("");
      setCategory("Other");
      setSummary("");
      setThumbnail(null);
    }
    setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger as React.ReactElement || (
          <Button size="lg" className="rounded-full h-14 px-6 shadow-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            <Plus className="mr-2 h-5 w-5" />
            새 프롬프트
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[525px] rounded-3xl" onPaste={handlePaste}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "프롬프트 수정" : "새 프롬프트 추가"}
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            팁: 클립보드에 복사된 이미지를 `Ctrl+V`로 붙여넣어 썸네일을 추가할 수 있습니다.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">프롬프트 내용</Label>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{content.length} characters</span>
            </div>
            <Textarea 
              id="content" 
              placeholder="여기에 프롬프트를 붙여넣으세요..." 
              className="min-h-[180px] resize-none rounded-2xl text-sm border-slate-200 focus:ring-purple-500 focus:border-purple-500 transition-all bg-slate-50/50 dark:bg-slate-900/50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          
          <AnimatePresence>
            {thumbnail && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="relative group w-32 h-32"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <img src={thumbnail} alt="Thumbnail preview" className="relative w-full h-full object-cover rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl" />
                <button
                  type="button"
                  onClick={() => setThumbnail(null)}
                  className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform z-10"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!initialData && (
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setAiModel("gemini")}
                  className={`px-3 py-1 transition-colors ${
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
                  className={`px-3 py-1 transition-colors ${
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
                size="sm"
                className="text-xs rounded-full"
                onClick={handleAutoFill}
                disabled={!content || isAutoFilling}
              >
                <Sparkles className={`mr-2 h-3 w-3 ${isAutoFilling ? "animate-spin" : ""}`} />
                {isAutoFilling ? "분석 중..." : "AI 자동 채우기"}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="title">제목</Label>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{title.length}/20</span>
              </div>
              <Input 
                id="title" 
                placeholder="제목 입력" 
                className="rounded-xl border-slate-200 focus:ring-purple-500"
                value={title}
                maxLength={20}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="summary">한 줄 설명</Label>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{summary.length}/50</span>
            </div>
            <Input 
              id="summary" 
              placeholder="프롬프트를 간단히 설명해주세요" 
              className="rounded-xl border-slate-200 focus:ring-purple-500"
              value={summary}
              maxLength={50}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full h-12 text-lg rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              저장하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
