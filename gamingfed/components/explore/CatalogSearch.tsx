"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

export interface CatalogSearchProps {
  initialValue?: string;
  placeholder?: string;
}

/**
 * Search input for the explore catalog. Debounces user input and syncs to
 * `?search=` via a shallow router push so the server component re-fetches.
 */
export function CatalogSearch({
  initialValue = "",
  placeholder = "Search games...",
}: CatalogSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) params.set("search", value);
      else params.delete("search");
      startTransition(() => {
        router.replace(`/explore${params.toString() ? `?${params}` : ""}`);
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [value, router]);

  return (
    <label className="relative block">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-inherit placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/60"
      />
    </label>
  );
}
