"use client";

interface WatchlistProps {
  tickers: string[];
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

export default function Watchlist({ tickers, onSelect, onRemove }: WatchlistProps) {
  if (tickers.length === 0) {
    return <p className="text-xs text-gray-400">Watchlist gol. Adauga un ticker din rezultatele analizei.</p>;
  }

  return (
    <ul className="space-y-1">
      {tickers.map((t) => (
        <li key={t} className="flex items-center justify-between rounded bg-white px-2 py-1 text-sm hover:bg-indigo-50">
          <button type="button" onClick={() => onSelect(t)} className="text-left text-gray-800 hover:text-indigo-700 hover:underline">
            {t}
          </button>
          <button
            type="button"
            onClick={() => onRemove(t)}
            className="text-xs text-gray-400 hover:text-red-500"
            aria-label={`Sterge ${t} din watchlist`}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
