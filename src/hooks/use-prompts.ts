// src/hooks/use-prompts.ts
import { useState, useEffect } from "react";
import { Prompt, Category } from "@/types";
import { MOCK_PROMPTS } from "@/lib/mock-data";

const STORAGE_KEY = "promptbox-prompts";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPrompts(JSON.parse(saved));
    } else {
      setPrompts(MOCK_PROMPTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROMPTS));
    }
    setIsLoading(false);
  }, []);

  const savePrompts = (newPrompts: Prompt[]) => {
    setPrompts(newPrompts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrompts));
  };

  const cleanContent = (content: string) => {
    return content.replace(/\n\s*\n+/g, '\n').trim();
  };

  const addPrompt = (promptData: Partial<Prompt>) => {
    const newPrompt: Prompt = {
      id: Math.random().toString(36).substring(2, 9),
      user_id: "user-1", // Mock user
      title: promptData.title || "Untitled Prompt",
      content: cleanContent(promptData.content || ""),
      category: promptData.category || "Other",
      summary: promptData.summary || "",
      tags: promptData.tags || [],
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    savePrompts([newPrompt, ...prompts]);
  };

  const updatePrompt = (id: string, updates: Partial<Prompt>) => {
    if (updates.content) {
      updates.content = cleanContent(updates.content);
    }
    savePrompts(
      prompts.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const deletePrompt = (id: string) => {
    savePrompts(prompts.filter((p) => p.id !== id));
  };

  const toggleFavorite = (id: string) => {
    savePrompts(
      prompts.map((p) => (p.id === id ? { ...p, is_favorite: !p.is_favorite } : p))
    );
  };

  return {
    prompts,
    isLoading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
  };
}
