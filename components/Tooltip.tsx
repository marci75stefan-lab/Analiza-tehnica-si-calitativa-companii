"use client";

import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function Tooltip({ text }: { text: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  if (!text) return null;

  return (
    <span className="relative ml-1 inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-label={t("tooltipAria")}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gray-300 text-[9px] leading-none text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-1.5 w-56 -translate-x-1/2 rounded bg-indigo-950 px-2 py-1.5 text-[11px] font-normal normal-case leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
