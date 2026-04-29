// src/types/index.ts

export type Category = 
  | 'Image' 
  | 'Coding' 
  | 'Marketing' 
  | 'Writing' 
  | 'Design' 
  | 'Business' 
  | 'Other';

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: Category;
  summary: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
