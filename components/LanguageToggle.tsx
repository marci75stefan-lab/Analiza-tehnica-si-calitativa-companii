"use client";

import { useLang } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "ro", label: "RO" },
  { value: "en", label: "EN" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex shrink-0 gap-0.5 rounded border border-gray-200 p-0.5 dark:border-gray-700">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLang(opt.value)}
          className={`rounded px-2 py-1 text-xs font-medium ${
            lang === opt.value
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
