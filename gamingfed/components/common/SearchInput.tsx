"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, useId } from "react";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  wrapperClassName?: string;
}

export function SearchInput({
  wrapperClassName,
  className,
  id,
  placeholder = "Search",
  ...props
}: SearchInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex-1 flex items-center gap-3 rounded-xl px-4 h-12",
        "bg-black/5 dark:bg-[#1a1d22]",
        "focus-within:ring-2 focus-within:ring-cyan-400 transition-colors",
        wrapperClassName,
      )}
    >
      <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden />
      <input
        id={inputId}
        type="search"
        placeholder={placeholder}
        className={cn(
          "bg-transparent outline-none w-full text-sm",
          "text-black placeholder:text-gray-500 dark:text-inherit",
          "dark:placeholder:text-gray-500",
          className,
        )}
        {...props}
      />
    </label>
  );
}
