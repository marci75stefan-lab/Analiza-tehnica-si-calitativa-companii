"use client";

import { useState } from "react";

export default function Tooltip({ text }: { text: string }) {
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
        aria-label="Detalii termen"
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gray-300 text-[9px] leading-none text-gray-400 hover:border-indigo-400 hover:text-indigo-600"
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
