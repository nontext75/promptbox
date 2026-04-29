// src/components/Header.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { user, signInWithGoogle, signOut, isLoading } = useAuth();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          PromptBox
        </Link>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                      {user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500">Google Login</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full w-10 h-10 bg-slate-100 dark:bg-slate-800"
                    onClick={signOut}
                    title="로그아웃"
                  >
                    <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={signInWithGoogle} 
                  className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  로그인
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
