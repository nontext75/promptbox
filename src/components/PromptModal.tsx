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
import { Plus, Sparkles, Edit } from "lucide-react";
import { Category, Prompt } from "@/types";

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
  const [aiModel, setAiModel] = useState<"gemini" | "big-pickle">("gemini");
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
            <Label htmlFor="content">프롬프트 내용</Label>
            <Textarea 
              id="content" 
              placeholder="여기에 프롬프트를 붙여넣으세요..." 
              className="min-h-[150px] resize-none rounded-xl text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          
          {thumbnail && (
            <div className="relative inline-block mt-2">
              <img src={thumbnail} alt="Thumbnail preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}
          
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
              <Label htmlFor="title">제목 (선택)</Label>
              <Input 
                id="title" 
                placeholder="제목 입력" 
                className="rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="summary">한 줄 설명 (선택)</Label>
            <Input 
              id="summary" 
              placeholder="프롬프트를 간단히 설명해주세요" 
              className="rounded-xl"
              value={summary}
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
