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
  onSave: (data: { title: string; content: string; category: Category; summary: string; tags: string[] }) => void;
  initialData?: Prompt;
  trigger?: React.ReactNode;
}

export function PromptModal({ onSave, initialData, trigger }: PromptModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCategory(initialData.category);
      setSummary(initialData.summary);
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
    });

    if (!initialData) {
      setTitle("");
      setContent("");
      setCategory("Other");
      setSummary("");
    }
    setOpen(false);
  };

  const handleAutoFill = () => {
    if (!content) return;
    setTitle("AI 추천 제목");
    setSummary("프롬프트 내용을 분석하여 생성된 한 줄 요약입니다.");
    setCategory("Coding");
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
      <DialogContent className="sm:max-w-[525px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "프롬프트 수정" : "새 프롬프트 추가"}
          </DialogTitle>
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
          
          {!initialData && (
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-xs rounded-full"
                onClick={handleAutoFill}
                disabled={!content}
              >
                <Sparkles className="mr-2 h-3 w-3" />
                AI 자동 채우기 (Mock)
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
