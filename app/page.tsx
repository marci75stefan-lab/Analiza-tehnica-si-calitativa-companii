"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchAnalysis, MAX_TICKERS } from "@/lib/api";
import { exportToCsv, exportToPdf } from "@/lib/export";
import {
  addToHistory,
  addToWatchlist,
  getHistory,
  getWatchlist,
  removeFromWatchlist,
  type HistoryEntry,
} from "@/lib/localStorage";
import type { AnalyzeResponse, TickerAnalysis } from "@/lib/types";
import PriceChart from "@/components/PriceChart";
import Watchlist from "@/components/Watchlist";
import HistoryPanel from "@/components/HistoryPanel";
import ComparisonTable from "@/components/ComparisonTable";

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
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setWatchlist(getWatchlist());
    setHistory(getHistory());
  }, []);

  async function runAnalysis(tickers: string[]) {
    if (tickers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalysis(tickers);
      setData(result);
      setHistory(addToHistory(tickers, result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscuta");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tickers = input
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, MAX_TICKERS);
    void runAnalysis(tickers);
  }

  function handleWatchlistSelect(ticker: string) {
    setInput(ticker);
    void runAnalysis([ticker]);
  }

  function handleWatchlistToggle(ticker: string) {
    if (watchlist.includes(ticker)) {
      setWatchlist(removeFromWatchlist(ticker));
    } else {
      setWatchlist(addToWatchlist(ticker));
    }
  }

  function handleHistorySelect(entry: HistoryEntry) {
    setInput(entry.tickers.join(", "));
    setData(entry.response);
    setError(null);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_260px]">
      <div>
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
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ComparisonTable results={data.results} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => exportToCsv(data)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportToPdf(data)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Export PDF
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {data.results.map((result) => (
                <TickerCard
                  key={result.ticker}
                  result={result}
                  disclaimer={data.disclaimer}
                  inWatchlist={watchlist.includes(result.ticker)}
                  onToggleWatchlist={() => handleWatchlistToggle(result.ticker)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Watchlist</h2>
          <div className="mt-2">
            <Watchlist tickers={watchlist} onSelect={handleWatchlistSelect} onRemove={(t) => setWatchlist(removeFromWatchlist(t))} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-900">Istoric analize</h2>
          <div className="mt-2">
            <HistoryPanel entries={history} onSelect={handleHistorySelect} />
          </div>
        </section>
      </aside>
    </main>
  );
}

function TickerCard({
  result,
  disclaimer,
  inWatchlist,
  onToggleWatchlist,
}: {
  result: TickerAnalysis;
  disclaimer: string;
  inWatchlist: boolean;
  onToggleWatchlist: () => void;
}) {
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
        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold">
            {formatNumber(price.current)} {result.currency}
          </p>
          <button
            type="button"
            onClick={onToggleWatchlist}
            className={`rounded border px-2 py-1 text-xs font-medium ${
              inWatchlist
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {inWatchlist ? "In watchlist" : "+ Watchlist"}
          </button>
        </div>
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
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Analiza calitativa</p>
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
