"use client";

import { useEffect, useState } from "react";

interface MarketQuote {
  symbol: string;
  label: string;
  price?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  error?: boolean;
}

function formatPrice(value: number): string {
  return value.toLocaleString("ro-RO", { maximumFractionDigits: value < 10 ? 4 : 2 });
}

export default function MarketsBar() {
  const [quotes, setQuotes] = useState<MarketQuote[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/markets")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setQuotes(data.quotes ?? []);
      })
      .catch(() => {
        if (!cancelled) setQuotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-200 pb-3 text-xs">
      {quotes.map((q) =>
        q.error || q.price === undefined || q.changePercent === undefined ? null : (
          <span key={q.symbol} className="flex items-baseline gap-1.5">
            <span className="font-medium text-gray-700">{q.label}</span>
            <span className="text-gray-900">{formatPrice(q.price)}</span>
            <span className={q.change !== undefined && q.change >= 0 ? "text-green-600" : "text-red-600"}>
              {q.changePercent >= 0 ? "+" : ""}
              {q.changePercent.toFixed(2)}%
            </span>
          </span>
        )
      )}
    </div>
  );
}
