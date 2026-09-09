"use client";

import { isCompleteAnalysis, type TickerAnalysis } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";

function formatNumber(value: number | null | undefined, lang: string, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return value.toLocaleString(lang === "en" ? "en-US" : "ro-RO", { maximumFractionDigits: digits });
}

export default function ComparisonTable({ results }: { results: TickerAnalysis[] }) {
  const { lang, t } = useLang();
  const complete = results.filter(isCompleteAnalysis);
  if (complete.length < 2) return null;

  return (
    <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-xs">
        <thead className="bg-indigo-50 text-left text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
          <tr>
            <th className="px-3 py-2">{t("tableTicker")}</th>
            <th className="px-3 py-2">{t("tablePrice")}</th>
            <th className="px-3 py-2">{t("tableTechScore")}</th>
            <th className="px-3 py-2">{t("tableRecommendation")}</th>
            <th className="px-3 py-2">{t("tablePE")}</th>
            <th className="px-3 py-2">{t("tableVerdict")}</th>
          </tr>
        </thead>
        <tbody>
          {complete.map((r) => (
            <tr key={r.ticker} className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-3 py-2 font-medium">{r.ticker}</td>
              <td className="px-3 py-2">
                {formatNumber(r.price.current, lang)} {r.currency}
              </td>
              <td className="px-3 py-2">{r.technical.score}</td>
              <td className="px-3 py-2">{r.technical.recommendation}</td>
              <td className="px-3 py-2">{formatNumber(r.fundamentals.trailingPE, lang)}</td>
              <td className="px-3 py-2">{r.qualitative.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
