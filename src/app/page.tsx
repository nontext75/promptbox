// src/app/page.tsx
"use client";

import { useState } from "react";
import { Search, Plus, Copy, Trash, Star, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePrompts } from "@/hooks/use-prompts";
import { PromptModal } from "@/components/PromptModal";
import { Category } from "@/types";
import Link from "next/link";

const CATEGORIES: Category[] = [
  "Image", "Coding", "Marketing", "Writing", "Design", "Business", "Other"
];

import { useAuth } from "@/hooks/use-auth";
import { LogIn, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth();
  const { prompts, addPrompt, toggleFavorite, deletePrompt, isLoading: promptsLoading } = usePrompts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50/50 dark:bg-slate-900/50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center space-y-12">
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI 기반 프롬프트 관리의 시작
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
            프롬프트를 관리하는 <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">가장 우아한 방법</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            분산된 프롬프트를 한곳에 모으고 AI와 함께 더 강력하게 활용하세요. <br />
            오직 당신만을 위한 개인용 프롬프트 서재, PromptBox.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <Button 
            size="lg" 
            onClick={signInWithGoogle}
            className="h-14 px-10 rounded-full text-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-all shadow-xl shadow-purple-500/10"
          >
            <LogIn className="w-5 h-5 mr-3" />
            Google로 시작하기
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="h-14 px-10 rounded-full text-lg border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            기능 살펴보기
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full pt-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          {[
            { title: "빠른 저장", desc: "AI가 자동으로 제목과 요약을 생성합니다." },
            { title: "스마트 검색", desc: "수천 개의 프롬프트를 1초 만에 찾습니다." },
            { title: "AI 변형", desc: "기존 프롬프트를 AI로 즉시 수정합니다." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-left space-y-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
        
        {/* Header & Search Section */}
        <section className="space-y-6 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            PromptBox
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            나만의 프롬프트 서재. 더 빠르고 스마트하게 관리하세요.
          </p>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <Input 
              placeholder="프롬프트 검색 (제목, 설명, 태그...)" 
              className="pl-12 h-14 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl focus-visible:ring-slate-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        <section className="w-full flex justify-center">
          <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex flex-wrap justify-center gap-2">
              <TabsTrigger 
                value="all"
                className="rounded-full px-5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 shadow-sm transition-all text-xs"
              >
                All
              </TabsTrigger>
              {CATEGORIES.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="rounded-full px-5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 shadow-sm transition-all text-xs"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </section>

        {/* Prompt List Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-md transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl flex flex-col">
              <CardHeader className="p-5 pb-1">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="secondary" className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0">
                    {prompt.category}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-slate-400 hover:text-yellow-500 transition-colors"
                      onClick={() => toggleFavorite(prompt.id)}
                    >
                      <Star className={prompt.is_favorite ? "fill-yellow-500 text-yellow-500" : ""} size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" onClick={() => deletePrompt(prompt.id)}>
                      <Trash size={16} className="hover:text-red-500 transition-colors" />
                    </Button>
                  </div>
                </div>
                <Link href={`/prompt/${prompt.id}`}>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors cursor-pointer line-clamp-1">
                    {prompt.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="px-5 pb-4 flex-grow pt-0">
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-xs leading-relaxed">
                  {prompt.summary}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0 rounded">
                      <Hash size={8} className="mr-0.5" />
                      {tag}
                    </span>
                  ))}
                  {prompt.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{prompt.tags.length - 3}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="px-5 pt-2 pb-3 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10">
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors h-8" onClick={() => navigator.clipboard.writeText(prompt.content)}>
                  <Copy size={14} className="mr-2" />
                  <span className="text-xs font-medium">복사</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {filteredPrompts.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">검색 결과가 없습니다.</p>
            </div>
          )}
        </section>

        {/* Floating Action Button */}
        <div className="fixed bottom-10 right-10">
          <PromptModal onSave={addPrompt} />
        </div>

      </div>
    </main>
  );
}
