// src/hooks/use-prompts.ts
import { useState, useEffect, useCallback } from "react";
import { Prompt, Category } from "@/types";
import { supabase } from "@/lib/supabase";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
    } else {
      setPrompts(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const cleanContent = (content: string) => {
    return content.replace(/\n\s*\n+/g, '\n').trim();
  };

  const addPrompt = async (promptData: Partial<Prompt>) => {
    const cleanedContent = cleanContent(promptData.content || "");
    const { data, error } = await supabase
      .from('prompts')
      .insert([{
        title: promptData.title || "Untitled Prompt",
        content: cleanedContent,
        category: promptData.category || "Other",
        summary: promptData.summary || cleanedContent.substring(0, 50) + "...",
        tags: promptData.tags || [],
        thumbnail: promptData.thumbnail || null,
        is_favorite: false,
        user_id: (await supabase.auth.getUser()).data.user?.id || null, // Handle auth if available
      }])
      .select();

    if (error) {
      console.error('Error adding prompt:', error);
    } else if (data) {
      setPrompts([data[0], ...prompts]);
    }
  };

  const updatePrompt = async (id: string, updates: Partial<Prompt>) => {
    if (updates.content) {
      updates.content = cleanContent(updates.content);
    }
    const { error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating prompt:', error);
    } else {
      setPrompts(prompts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  };

  const deletePrompt = async (id: string) => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prompt:', error);
    } else {
      setPrompts(prompts.filter((p) => p.id !== id));
    }
  };

  const toggleFavorite = async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;

    const { error } = await supabase
      .from('prompts')
      .update({ is_favorite: !prompt.is_favorite })
      .eq('id', id);

    if (error) {
      console.error('Error toggling favorite:', error);
    } else {
      setPrompts(prompts.map((p) => (p.id === id ? { ...p, is_favorite: !p.is_favorite } : p)));
    }
  };

  const fetchPublicPrompts = useCallback(async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .is('user_id', null) // Public prompts have no user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public prompts:', error);
      return [];
    }
    return data || [];
  }, []);

  const scrapPrompt = async (prompt: Prompt) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await addPrompt({
      title: `${prompt.title} (Scrapped)`,
      content: prompt.content,
      category: prompt.category,
      summary: prompt.summary,
      tags: prompt.tags,
      thumbnail: prompt.thumbnail,
    });
  };

  return {
    prompts,
    isLoading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    fetchPublicPrompts,
    scrapPrompt,
    refresh: fetchPrompts
  };
}
