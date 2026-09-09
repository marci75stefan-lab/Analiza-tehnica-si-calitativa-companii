"use client";

import { useLang } from "@/lib/LanguageContext";
import type { DictKey } from "@/lib/i18n";

const WARNING_KEYS: DictKey[] = [
  "financialWarning1",
  "financialWarning2",
  "financialWarning3",
  "financialWarning4",
  "financialWarning5",
  "financialWarning6",
  "financialWarning7",
  "financialWarning8",
];

export default function FinancialWarnings() {
  const { t } = useLang();

  return (
    <details className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
      <summary className="cursor-pointer select-none font-semibold text-amber-900">{t("importantTitle")}</summary>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{t("importantSubtitle")}</p>
        <ul className="mt-2 list-disc space-y-2 pl-4">
          {WARNING_KEYS.map((key) => (
            <li key={key} className="text-xs text-amber-900">
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
