"use client";

import type { HistoryEntry } from "@/lib/localStorage";
import { useLang } from "@/lib/LanguageContext";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

export default function HistoryPanel({ entries, onSelect }: HistoryPanelProps) {
  const { lang, t } = useLang();

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400 dark:text-gray-500">{t("historyEmpty")}</p>;
  }

  return (
    <ul className="max-h-64 space-y-1 overflow-y-auto">
      {entries.map((entry) => (
        <li key={entry.timestamp}>
          <button
            type="button"
            onClick={() => onSelect(entry)}
            className="w-full rounded bg-white px-2 py-1 text-left text-xs hover:bg-indigo-50 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <span className="font-medium text-gray-800 dark:text-gray-200">{entry.tickers.join(", ")}</span>
            <br />
            <span className="text-gray-400 dark:text-gray-500">
              {new Date(entry.timestamp).toLocaleString(lang === "en" ? "en-US" : "ro-RO")}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
