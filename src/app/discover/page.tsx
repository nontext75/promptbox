// src/app/discover/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Hash, Download, Sparkles, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrompts } from "@/hooks/use-prompts";
import { Prompt, Category } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES: Category[] = [
  "Image", "Coding", "Marketing", "Writing", "Design", "Business", "Other"
];

export default function DiscoverPage() {
  const { fetchPublicPrompts, scrapPrompt } = usePrompts();
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    const loadPublic = async () => {
      setIsLoading(true);
      const data = await fetchPublicPrompts();
      
      // If DB is empty, provide some high-quality mock data for demo
      if (data.length === 0) {
        setPublicPrompts([
          {
            id: "mock-1",
            title: "미니멀리즘 3D 아이콘 생성",
            content: "Create a set of high-quality, 3D minimalist icons for a productivity app. Soft lighting, clay-like texture, pastel colors, isometric view, white background.",
            category: "Image",
            summary: "생산성 앱을 위한 미니멀한 3D 아이콘 생성 프롬프트입니다.",
            tags: ["Midjourney", "3D", "Icon", "Minimalist"],
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-2",
            title: "React 최적화 코드 리뷰어",
            content: "You are a senior React developer. Review the following code for performance bottlenecks, unnecessary re-renders, and suggest modern React 18+ patterns. Provide concrete examples for improvement.",
            category: "Coding",
            summary: "React 코드의 성능과 패턴을 전문적으로 리뷰해주는 AI 페르소나입니다.",
            tags: ["React", "Review", "Optimization"],
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-3",
            title: "감성적인 인스타그램 캡션 제조기",
            content: "작성하고 싶은 사진의 내용과 분위기를 알려주시면, 트렌디하고 감성적인 인스타그램 캡션 3가지를 해시태그와 함께 생성합니다. 이모지를 적절히 섞어주세요.",
            category: "Marketing",
            summary: "SNS 마케팅을 위한 감성적인 캡션을 자동으로 생성합니다.",
            tags: ["SNS", "Instagram", "Marketing"],
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
      } else {
        setPublicPrompts(data);
      }
      setIsLoading(false);
    };
    loadPublic();
  }, [fetchPublicPrompts]);

  const handleScrape = async () => {
    if (!url) return;
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.data && result.data.length > 0) {
        // AI가 생성한 임시 ID 부여
        const newPrompts = result.data.map((p: any) => ({
          ...p,
          id: `scraped-${Date.now()}-${Math.random()}`,
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setPublicPrompts([...newPrompts, ...publicPrompts]);
        toast.success(`${newPrompts.length}개의 프롬프트를 찾았습니다!`);
        setUrl("");
      } else {
        toast.error("프롬프트를 찾지 못했습니다.");
      }
    } catch (error) {
      console.error("Scraping failed:", error);
      toast.error("스크래핑 중 오류가 발생했습니다.");
    } finally {
      setIsScraping(false);
    }
  };

  const filteredPrompts = publicPrompts.filter((prompt) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      prompt.title.toLowerCase().includes(q) ||
      prompt.summary.toLowerCase().includes(q) ||
      prompt.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleScrap = async (prompt: Prompt) => {
    try {
      await scrapPrompt(prompt);
      toast.success("내 서재로 가져왔습니다!");
    } catch (error) {
      toast.error("스크랩 실패");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-tight">
            <Sparkles className="w-4 h-4" />
            DISCOVER & SCRAPE
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            어디서든 프롬프트를 <br />
            <span className="text-blue-600">긁어오세요</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            각종 포털, SNS, 미드저니 쇼케이스 링크만 넣어주세요. <br />
            AI가 페이지 속 프롬프트를 찾아내어 정리해 드립니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-8">
            <div className="relative group flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                placeholder="가져오고 싶은 페이지 주소(URL)를 입력하세요..." 
                className="pl-12 h-16 text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl focus-visible:ring-blue-500 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button 
              size="lg" 
              className="h-16 px-10 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={handleScrape}
              disabled={isScraping || !url}
            >
              {isScraping ? "분석 중..." : "프롬프트 긁어오기"}
            </Button>
          </div>
        </section>

        {/* Category Filter */}
        <section className="flex flex-wrap justify-center gap-3">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="rounded-full px-6 h-10 font-bold transition-all shadow-sm"
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full px-6 h-10 font-bold transition-all shadow-sm"
            >
              {cat}
            </Button>
          ))}
        </section>

        {/* Discover List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-[40px]" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group h-full flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm">
                    {prompt.thumbnail && (
                      <div className="w-full aspect-video overflow-hidden border-b border-slate-100 dark:border-slate-800">
                        <img src={prompt.thumbnail} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    )}
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                          {prompt.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                        {prompt.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex-grow">
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed text-sm mb-6">
                        {prompt.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg flex items-center">
                            <Hash size={8} className="mr-0.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 mt-auto">
                      <Button 
                        onClick={() => handleScrap(prompt)}
                        className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-all group/btn"
                      >
                        <Download className="mr-3 h-5 w-5 group-hover/btn:translate-y-1 transition-transform" />
                        내 서재로 가져오기
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        )}
      </div>
    </main>
  );
}
