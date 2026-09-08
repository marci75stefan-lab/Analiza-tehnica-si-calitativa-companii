"use client";

import { useState, type FormEvent } from "react";
import { fetchAnalysis, MAX_TICKERS } from "@/lib/api";
import type { AnalyzeResponse, TickerAnalysis } from "@/lib/types";
import PriceChart from "@/components/PriceChart";

function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return value.toLocaleString("ro-RO", { maximumFractionDigits: digits });
}

function recommendationColor(recommendation: string): string {
  if (recommendation.includes("Cumparare")) return "text-green-600";
  if (recommendation.includes("Vanzare")) return "text-red-600";
  return "text-gray-600";
}

export default function Home() {
  const [input, setInput] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tickers = input
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, MAX_TICKERS);

    if (tickers.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalysis(tickers);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscuta");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Analiza Tehnica si Calitativa a Companiilor Listate la Bursa
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Proiect educational. Semnalele generate nu constituie recomandare de investitii.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`ex: AAPL, SNP.RO, TLV.RO (max ${MAX_TICKERS})`}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Se incarca..." : "Analizeaza"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {data && (
        <div className="mt-8 space-y-8">
          {data.results.map((result) => (
            <TickerCard key={result.ticker} result={result} disclaimer={data.disclaimer} />
          ))}
        </div>
      )}
    </main>
  );
}

function TickerCard({ result, disclaimer }: { result: TickerAnalysis; disclaimer: string }) {
  if (result.error || !result.technical || !result.price || !result.fundamentals || !result.qualitative) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-700">{result.ticker}</p>
        <p className="text-sm text-red-600">{result.error ?? "Date indisponibile."}</p>
      </div>
    );
  }

  const { technical, price, fundamentals, qualitative } = result;

  return (
    <div className="rounded border border-gray-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {result.companyName} ({result.ticker})
          </h2>
          <p className="text-xs text-gray-500">
            {result.sector} / {result.industry}
          </p>
        </div>
        <p className="text-lg font-semibold">
          {formatNumber(price.current)} {result.currency}
        </p>
      </div>

      <div className="mt-4">
        <PriceChart data={price.history} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Semnal tehnic</p>
          <p className={`mt-1 text-xl font-bold ${recommendationColor(technical.recommendation)}`}>
            {technical.recommendation}
          </p>
          <p className="text-xs text-gray-500">
            Scor: {technical.score} (interval -8..+8) / trend de fond: {technical.trend}
          </p>
          <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
            <li>EMA cross (9/21): {technical.signals.emaCross}</li>
            <li>
              RSI(14): {technical.signals.rsi} (valoare: {formatNumber(technical.indicators.rsi)})
            </li>
            <li>MACD: {technical.signals.macd}</li>
            <li>Bollinger Bands: {technical.signals.bollinger}</li>
          </ul>
        </div>

        <div className="rounded bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Analiza calitativa
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">{qualitative.verdict}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
            {qualitative.signals.map((s) => (
              <li key={s.metric}>
                {s.metric}: {formatNumber(s.value)} - {s.note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-4">
        <span>P/E: {formatNumber(fundamentals.trailingPE)}</span>
        <span>EPS: {formatNumber(fundamentals.trailingEps)}</span>
        <span>Debt/Equity: {formatNumber(fundamentals.debtToEquity)}</span>
        <span>ROE: {formatNumber((fundamentals.returnOnEquity ?? 0) * 100)}%</span>
      </div>

      <p className="mt-4 text-xs italic text-gray-400">{disclaimer}</p>
    </div>
  );
}
