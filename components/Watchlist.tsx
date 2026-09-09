"use client";

import { useLang } from "@/lib/LanguageContext";

interface WatchlistProps {
  tickers: string[];
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

export default function Watchlist({ tickers, onSelect, onRemove }: WatchlistProps) {
  const { t } = useLang();

  if (tickers.length === 0) {
    return <p className="text-xs text-gray-400">{t("watchlistEmpty")}</p>;
  }

  return (
    <ul className="space-y-1">
      {tickers.map((tk) => (
        <li key={tk} className="flex items-center justify-between rounded bg-white px-2 py-1 text-sm hover:bg-indigo-50">
          <button type="button" onClick={() => onSelect(tk)} className="text-left text-gray-800 hover:text-indigo-700 hover:underline">
            {tk}
          </button>
          <button
            type="button"
            onClick={() => onRemove(tk)}
            className="text-xs text-gray-400 hover:text-red-500"
            aria-label={t("removeFromWatchlistAria", { ticker: tk })}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
