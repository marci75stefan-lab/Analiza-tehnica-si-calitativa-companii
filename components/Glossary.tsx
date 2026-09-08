import { GLOSSARY } from "@/lib/glossary";

export default function Glossary() {
  const tehnic = GLOSSARY.filter((t) => t.category === "tehnic");
  const calitativ = GLOSSARY.filter((t) => t.category === "calitativ");

  return (
    <details className="rounded border border-gray-200 p-3 text-sm">
      <summary className="cursor-pointer select-none font-semibold text-gray-900">
        Glosar de termeni
      </summary>
      <div className="mt-3 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Analiza tehnica</p>
          <dl className="mt-1 space-y-2">
            {tehnic.map((t) => (
              <div key={t.key}>
                <dt className="text-xs font-medium text-gray-800">{t.term}</dt>
                <dd className="text-xs text-gray-500">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Analiza calitativa</p>
          <dl className="mt-1 space-y-2">
            {calitativ.map((t) => (
              <div key={t.key}>
                <dt className="text-xs font-medium text-gray-800">{t.term}</dt>
                <dd className="text-xs text-gray-500">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </details>
  );
}
