"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_PERIOD, fetchAnalysis, MAX_TICKERS, PERIOD_OPTIONS, type Period } from "@/lib/api";
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
import { glossaryDefinition } from "@/lib/glossary";
import PriceChart from "@/components/PriceChart";
import CompanySearch from "@/components/CompanySearch";
import Watchlist from "@/components/Watchlist";
import HistoryPanel from "@/components/HistoryPanel";
import ComparisonTable from "@/components/ComparisonTable";
import Tooltip from "@/components/Tooltip";
import Glossary from "@/components/Glossary";

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
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);

  useEffect(() => {
    setWatchlist(getWatchlist());
    setHistory(getHistory());
  }, []);

  async function runAnalysis(tickers: string[]) {
    if (tickers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalysis(tickers, period);
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

  function handleCompanyPick(symbol: string) {
    setInput((prev) => {
      const current = prev
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
      if (current.includes(symbol)) return prev;
      return [...current, symbol].slice(0, MAX_TICKERS).join(", ");
    });
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

        <div className="mt-6">
          <CompanySearch onPick={handleCompanyPick} />
          <p className="mt-1 text-xs text-gray-400">
            Nu stii simbolul bursier (ticker)? Cauta compania dupa nume mai sus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
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

        <div className="mt-2 flex items-center gap-1">
          <span className="mr-1 flex items-center text-xs text-gray-400">
            Perioada:
            <Tooltip text={glossaryDefinition("YTD")} />
          </span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                period === opt.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

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

        <section>
          <Glossary />
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
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatNumber(price.current)} {result.currency}
            </p>
            {price.change !== null && price.changePercent !== null && (
              <p className={`text-xs font-medium ${price.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {price.change >= 0 ? "+" : ""}
                {formatNumber(price.change)} ({price.change >= 0 ? "+" : ""}
                {formatNumber(price.changePercent)}%) azi
              </p>
            )}
          </div>
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
          <p className="flex items-center text-xs font-medium uppercase tracking-wide text-gray-500">
            Semnal tehnic
            <Tooltip text={glossaryDefinition("recommendation")} />
          </p>
          <p className={`mt-1 text-xl font-bold ${recommendationColor(technical.recommendation)}`}>
            {technical.recommendation}
          </p>
          <p className="flex items-center text-xs text-gray-500">
            Scor: {technical.score} (interval -8..+8)
            <Tooltip text={glossaryDefinition("score")} />
            {" "}/ trend de fond: {technical.trend}
            <Tooltip text={glossaryDefinition("trend")} />
          </p>
          <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
            <li className="flex items-center">
              EMA cross (9/21): {technical.signals.emaCross}
              <Tooltip text={glossaryDefinition("emaCross")} />
            </li>
            <li className="flex items-center">
              RSI(14): {technical.signals.rsi} (valoare: {formatNumber(technical.indicators.rsi)})
              <Tooltip text={glossaryDefinition("rsi")} />
            </li>
            <li className="flex items-center">
              MACD: {technical.signals.macd}
              <Tooltip text={glossaryDefinition("macd")} />
            </li>
            <li className="flex items-center">
              Bollinger Bands: {technical.signals.bollinger}
              <Tooltip text={glossaryDefinition("bollinger")} />
            </li>
          </ul>
        </div>

        <div className="rounded bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Analiza calitativa</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{qualitative.verdict}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
            {qualitative.signals.map((s) => (
              <li key={s.metric} className="flex items-center">
                {s.metric}: {formatNumber(s.value)} - {s.note}
                <Tooltip text={glossaryDefinition(s.metric)} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-4">
        <span className="flex items-center">
          P/E: {formatNumber(fundamentals.trailingPE)}
          <Tooltip text={glossaryDefinition("P/E")} />
        </span>
        <span className="flex items-center">
          EPS: {formatNumber(fundamentals.trailingEps)}
          <Tooltip text={glossaryDefinition("eps")} />
        </span>
        <span className="flex items-center">
          Debt/Equity: {formatNumber(fundamentals.debtToEquity)}
          {fundamentals.debtToEquity !== null ? "%" : ""}
          <Tooltip text={glossaryDefinition("Debt/Equity (%)")} />
        </span>
        <span className="flex items-center">
          ROE: {fundamentals.returnOnEquity !== null ? `${formatNumber(fundamentals.returnOnEquity * 100)}%` : "N/A"}
          <Tooltip text={glossaryDefinition("ROE (%)")} />
        </span>
      </div>

      <p className="mt-4 text-xs italic text-gray-400">{disclaimer}</p>
    </div>
  );
}
