"use client";

import { GLOSSARY } from "@/lib/glossary";
import { useLang } from "@/lib/LanguageContext";

export default function Glossary() {
  const { lang, t } = useLang();
  const tehnic = GLOSSARY.filter((g) => g.category === "tehnic");
  const calitativ = GLOSSARY.filter((g) => g.category === "calitativ");

  return (
    <details className="rounded border border-indigo-100 bg-indigo-50/40 p-3 text-sm dark:border-indigo-900 dark:bg-indigo-950/30">
      <summary className="cursor-pointer select-none font-semibold text-indigo-900 dark:text-indigo-300">
        {t("glossaryTitle")}
      </summary>
      <div className="mt-3 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("glossaryTechnical")}</p>
          <dl className="mt-1 space-y-2">
            {tehnic.map((g) => (
              <div key={g.roKey}>
                <dt className="text-xs font-medium text-gray-800 dark:text-gray-200">{g.term[lang]}</dt>
                <dd className="text-xs text-gray-500 dark:text-gray-400">{g.definition[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("glossaryQualitative")}</p>
          <dl className="mt-1 space-y-2">
            {calitativ.map((g) => (
              <div key={g.roKey}>
                <dt className="text-xs font-medium text-gray-800 dark:text-gray-200">{g.term[lang]}</dt>
                <dd className="text-xs text-gray-500 dark:text-gray-400">{g.definition[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </details>
  );
}
