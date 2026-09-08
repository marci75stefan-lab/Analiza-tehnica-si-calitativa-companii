"use client";

import { useEffect, useRef, useState } from "react";
import { searchTickers } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export default function CompanySearch({ onPick }: { onPick: (symbol: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      searchTickers(trimmed)
        .then((found) => {
          setResults(found);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handlePick(symbol: string) {
    onPick(symbol);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Cauta dupa numele companiei (ex: Apple, Banca Transilvania)"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
          {loading && <p className="px-3 py-2 text-xs text-gray-400">Se cauta...</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400">Niciun rezultat.</p>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={r.symbol}
                type="button"
                onClick={() => handlePick(r.symbol)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className="truncate">
                  <span className="font-medium text-gray-900">{r.symbol}</span>{" "}
                  <span className="text-gray-500">{r.name}</span>
                </span>
                <span className="shrink-0 text-xs text-gray-400">{r.exchange}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
