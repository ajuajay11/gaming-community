"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { GAME_CATALOG, findCatalogByName } from "@/lib/catalog";

interface GamePickerProps {
  value: string;
  onChange: (name: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Combobox-style picker backed by the static catalog. Sellers can pick one
 * of the popular titles or type their own — the backend stores whatever
 * string is emitted via `onChange`, so long-tail games remain supported.
 */
export function GamePicker({
  value,
  onChange,
  id,
  placeholder = "Select or type a game",
  required,
}: GamePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GAME_CATALOG;
    return GAME_CATALOG.filter((g) => g.name.toLowerCase().includes(q));
  }, [query]);

  const catalogMatch = findCatalogByName(value);
  const isCustom = Boolean(value) && !catalogMatch;

  const choose = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-inherit outline-none hover:border-white/20 focus:border-cyan-400/60"
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
      >
        <span className={value ? "text-inherit" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Hidden input keeps native form validation (required) working. */}
      <input
        type="hidden"
        value={value}
        required={required}
        readOnly
        aria-hidden
        tabIndex={-1}
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0f] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games…"
              className="w-full bg-transparent text-sm text-inherit outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  e.preventDefault();
                  choose(query.trim());
                }
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>

          <ul
            role="listbox"
            className="max-h-64 overflow-y-auto py-1 text-sm"
          >
            {matches.map((g) => {
              const selected =
                value.toLowerCase() === g.name.toLowerCase();
              return (
                <li key={g.slug}>
                  <button
                    type="button"
                    onClick={() => choose(g.name)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-inherit hover:bg-white/5"
                    role="option"
                    aria-selected={selected}
                  >
                    <span>{g.name}</span>
                    {selected && (
                      <Check className="h-4 w-4 text-cyan-300" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}

            {query.trim() && !matches.some(
              (g) => g.name.toLowerCase() === query.trim().toLowerCase(),
            ) && (
              <li>
                <button
                  type="button"
                  onClick={() => choose(query.trim())}
                  className="flex w-full items-center gap-2 border-t border-white/10 px-3 py-2 text-left text-cyan-300 hover:bg-white/5"
                >
                  <span className="text-xs uppercase tracking-widest text-gray-400">
                    Use custom
                  </span>
                  <span>“{query.trim()}”</span>
                </button>
              </li>
            )}

            {!matches.length && !query.trim() && (
              <li className="px-3 py-4 text-center text-xs text-gray-500">
                No games found.
              </li>
            )}
          </ul>
        </div>
      )}

      {isCustom && (
        <p className="mt-1 text-[11px] text-amber-300/80">
          Custom title — make sure the spelling matches what buyers will search for.
        </p>
      )}
    </div>
  );
}
