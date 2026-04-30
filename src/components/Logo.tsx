// src/components/Logo.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Symbol */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Outer Box */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-none stroke-slate-900 dark:stroke-white"
          style={{ strokeWidth: 8, strokeLinecap: "round", strokeLinejoin: "round" }}
        >
          <rect x="15" y="25" width="70" height="50" rx="15" />
          {/* Bookmark Symbol */}
          <path
            d="M40 25 V60 L50 50 L60 60 V25"
            className="fill-purple-600 stroke-none"
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          promptbox
        </span>
      )}
    </div>
  );
}
