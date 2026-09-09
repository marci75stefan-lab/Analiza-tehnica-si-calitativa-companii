"use client";

import type { HistoryEntry } from "@/lib/localStorage";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

export default function HistoryPanel({ entries, onSelect }: HistoryPanelProps) {
  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">Nicio analiza salvata inca.</p>;
  }

  return (
    <ul className="max-h-64 space-y-1 overflow-y-auto">
      {entries.map((entry) => (
        <li key={entry.timestamp}>
          <button
            type="button"
            onClick={() => onSelect(entry)}
            className="w-full rounded bg-white px-2 py-1 text-left text-xs hover:bg-indigo-50"
          >
            <span className="font-medium text-gray-800">{entry.tickers.join(", ")}</span>
            <br />
            <span className="text-gray-400">{new Date(entry.timestamp).toLocaleString("ro-RO")}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
