import { isCompleteAnalysis, type TickerAnalysis } from "@/lib/types";

function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return value.toLocaleString("ro-RO", { maximumFractionDigits: digits });
}

export default function ComparisonTable({ results }: { results: TickerAnalysis[] }) {
  const complete = results.filter(isCompleteAnalysis);
  if (complete.length < 2) return null;

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-3 py-2">Ticker</th>
            <th className="px-3 py-2">Pret</th>
            <th className="px-3 py-2">Scor tehnic</th>
            <th className="px-3 py-2">Recomandare</th>
            <th className="px-3 py-2">P/E</th>
            <th className="px-3 py-2">Verdict calitativ</th>
          </tr>
        </thead>
        <tbody>
          {complete.map((r) => (
            <tr key={r.ticker} className="border-t border-gray-100">
              <td className="px-3 py-2 font-medium">{r.ticker}</td>
              <td className="px-3 py-2">
                {formatNumber(r.price.current)} {r.currency}
              </td>
              <td className="px-3 py-2">{r.technical.score}</td>
              <td className="px-3 py-2">{r.technical.recommendation}</td>
              <td className="px-3 py-2">{formatNumber(r.fundamentals.trailingPE)}</td>
              <td className="px-3 py-2">{r.qualitative.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
