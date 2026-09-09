"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_PERIOD, fetchAnalysis, MAX_TICKERS, PERIOD_OPTIONS, type Period } from "@/lib/api";
import { exportToCsv, exportToPdf } from "@/lib/export";
import {
  addToHistory,
  addToWatchlist,
  clearHistory,
  getHistory,
  getWatchlist,
  removeFromWatchlist,
  type HistoryEntry,
} from "@/lib/localStorage";
import type { AnalyzeResponse, TickerAnalysis } from "@/lib/types";
import { glossaryDefinition } from "@/lib/glossary";
import { useLang } from "@/lib/LanguageContext";
import PriceChart from "@/components/PriceChart";
import CompanySearch from "@/components/CompanySearch";
import Watchlist from "@/components/Watchlist";
import HistoryPanel from "@/components/HistoryPanel";
import ComparisonTable from "@/components/ComparisonTable";
import Tooltip from "@/components/Tooltip";
import Glossary from "@/components/Glossary";
import FinancialWarnings from "@/components/FinancialWarnings";
import MarketsBar from "@/components/MarketsBar";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

function formatNumber(value: number | null | undefined, lang: string, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return value.toLocaleString(lang === "en" ? "en-US" : "ro-RO", { maximumFractionDigits: digits });
}

function recommendationColor(recommendationKey: string): string {
  if (recommendationKey === "strong_buy" || recommendationKey === "buy") return "text-emerald-600 dark:text-emerald-400";
  if (recommendationKey === "strong_sell" || recommendationKey === "sell") return "text-rose-600 dark:text-rose-400";
  return "text-indigo-600 dark:text-indigo-400";
}

export default function Home() {
  const { lang, t } = useLang();
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

  // Switching language only re-translates the static UI immediately -
  // already-fetched analysis content (verdict, signals, recommendation)
  // came from the backend in the previous language and would otherwise
  // stay stale, mixing languages within the same card. Re-run the last
  // analysis in the new language when there's something on screen already.
  useEffect(() => {
    if (!data) return;
    void runAnalysis(data.results.map((r) => r.ticker));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function runAnalysis(tickers: string[]) {
    if (tickers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalysis(tickers, period, lang);
      setData(result);
      setHistory(addToHistory(tickers, result));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tickers = input
      .split(",")
      .map((raw) => raw.trim().toUpperCase())
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
        .map((raw) => raw.trim().toUpperCase())
        .filter(Boolean);
      if (current.includes(symbol)) return prev;
      return [...current, symbol].slice(0, MAX_TICKERS).join(", ");
    });
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_260px]">
      <div>
        <MarketsBar />

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-indigo-950 dark:text-indigo-200">{t("appTitle")}</h1>
          <div className="flex shrink-0 gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("appSubtitle")}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{t("dataSource")}</p>

        <div className="mt-6">
          <CompanySearch onPick={handleCompanyPick} />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t("searchHint")}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("tickerPlaceholder", { max: MAX_TICKERS })}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? t("loading") : t("analyze")}
          </button>
        </form>

        <div className="mt-2 flex items-center gap-1">
          <span className="mr-1 text-xs text-gray-400 dark:text-gray-500">{t("periodLabel")}</span>
          {PERIOD_OPTIONS.map((opt) => (
            <span key={opt.value} className="flex items-center">
              <button
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  period === opt.value
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {t(opt.labelKey)}
              </button>
              {opt.value === "ytd" && <Tooltip text={glossaryDefinition("YTD", lang)} />}
            </span>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {data && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ComparisonTable results={data.results} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => exportToCsv(data, lang)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-700 dark:hover:bg-gray-800"
                >
                  {t("exportCsv")}
                </button>
                <button
                  type="button"
                  onClick={() => exportToPdf(data, lang)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-700 dark:hover:bg-gray-800"
                >
                  {t("exportPdf")}
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
        <section className="rounded border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-800/40">
          <h2 className="border-l-2 border-indigo-500 pl-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("watchlistTitle")}</h2>
          <div className="mt-2">
            <Watchlist tickers={watchlist} onSelect={handleWatchlistSelect} onRemove={(tk) => setWatchlist(removeFromWatchlist(tk))} />
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <h2 className="border-l-2 border-indigo-500 pl-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("historyTitle")}</h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory(clearHistory())}
                className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              >
                {t("clearHistory")}
              </button>
            )}
          </div>
          <div className="mt-2">
            <HistoryPanel entries={history} onSelect={handleHistorySelect} />
          </div>
        </section>

        <section>
          <Glossary />
        </section>

        <section>
          <FinancialWarnings />
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
  const { lang, t } = useLang();

  if (result.error || !result.technical || !result.price || !result.fundamentals || !result.qualitative) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <p className="font-medium text-red-700 dark:text-red-400">{result.ticker}</p>
        <p className="text-sm text-red-600 dark:text-red-400">{result.error ?? t("dataUnavailable")}</p>
      </div>
    );
  }

  const { technical, price, fundamentals, qualitative } = result;

  return (
    <div className="rounded border border-gray-200 border-t-4 border-t-indigo-500 p-5 dark:border-gray-700 dark:border-t-indigo-400 dark:bg-gray-900/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {result.companyName} ({result.ticker})
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {result.sector} / {result.industry}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatNumber(price.current, lang)} {result.currency}
            </p>
            {price.change !== null && price.changePercent !== null && (
              <p className={`text-xs font-medium ${price.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {price.change >= 0 ? "+" : ""}
                {formatNumber(price.change, lang)} ({price.change >= 0 ? "+" : ""}
                {formatNumber(price.changePercent, lang)}%) {t("todaySuffix")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleWatchlist}
            className={`rounded border px-2 py-1 text-xs font-medium ${
              inWatchlist
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-300 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-700 dark:hover:bg-gray-800"
            }`}
          >
            {inWatchlist ? t("inWatchlist") : t("addWatchlist")}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-4 dark:text-gray-400">
        <span className="flex items-center">
          {t("previousCloseLabel")} {formatNumber(price.previousClose, lang)}
          <Tooltip text={glossaryDefinition("previousClose", lang)} />
        </span>
        <span className="flex items-center">
          {t("openLabel")} {formatNumber(price.open, lang)}
          <Tooltip text={glossaryDefinition("open", lang)} />
        </span>
        <span className="flex items-center">
          {t("dayRangeLabel")} {formatNumber(price.dayLow, lang)} - {formatNumber(price.dayHigh, lang)}
          <Tooltip text={glossaryDefinition("dayRange", lang)} />
        </span>
        <span className="flex items-center">
          {t("week52RangeLabel")} {formatNumber(price.week52Low, lang)} - {formatNumber(price.week52High, lang)}
          <Tooltip text={glossaryDefinition("week52Range", lang)} />
        </span>
      </div>

      <div className="mt-4">
        <PriceChart data={price.history} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
          <p className="flex items-center text-xs font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            {t("technicalSignalTitle")}
            <Tooltip text={glossaryDefinition("recommendation", lang)} />
          </p>
          <p className={`mt-1 text-xl font-bold ${recommendationColor(technical.recommendationKey)}`}>
            {technical.recommendation}
          </p>
          <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {t("scoreLabel")} {technical.score} {t("scoreInterval")}
            <Tooltip text={glossaryDefinition("score", lang)} />
            {" "}
            {t("trendLabel")} {technical.trend}
            <Tooltip text={glossaryDefinition("trend", lang)} />
          </p>
          <ul className="mt-2 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              {t("emaCrossLabel")} {technical.signals.emaCross}
              <Tooltip text={glossaryDefinition("emaCross", lang)} />
            </li>
            <li className="flex items-center">
              {t("rsiLabel")} {technical.signals.rsi} {t("rsiValueSuffix", { value: formatNumber(technical.indicators.rsi, lang) })}
              <Tooltip text={glossaryDefinition("rsi", lang)} />
            </li>
            <li className="flex items-center">
              {t("macdLabel")} {technical.signals.macd}
              <Tooltip text={glossaryDefinition("macd", lang)} />
            </li>
            <li className="flex items-center">
              {t("bollingerLabel")} {technical.signals.bollinger}
              <Tooltip text={glossaryDefinition("bollinger", lang)} />
            </li>
          </ul>
        </div>

        <div className="rounded border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-900 dark:bg-sky-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">{t("qualitativeAnalysisTitle")}</p>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{qualitative.verdict}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
            {qualitative.signals.map((s) => (
              <li key={s.metricId} className="flex items-center">
                {s.metric}: {formatNumber(s.value, lang)} - {s.note}
                <Tooltip text={glossaryDefinition(s.metric, lang)} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-4 dark:text-gray-400">
        <span className="flex items-center">
          {t("peLabel")} {formatNumber(fundamentals.trailingPE, lang)}
          <Tooltip text={glossaryDefinition("P/E", lang)} />
        </span>
        <span className="flex items-center">
          {t("epsLabel")} {formatNumber(fundamentals.trailingEps, lang)}
          <Tooltip text={glossaryDefinition("eps", lang)} />
        </span>
        <span className="flex items-center">
          {t("dteLabel")} {formatNumber(fundamentals.debtToEquity, lang)}
          {fundamentals.debtToEquity !== null ? "%" : ""}
          <Tooltip text={glossaryDefinition("Debt/Equity (%)", lang)} />
        </span>
        <span className="flex items-center">
          {t("roeLabel")} {fundamentals.returnOnEquity !== null ? `${formatNumber(fundamentals.returnOnEquity * 100, lang)}%` : "N/A"}
          <Tooltip text={glossaryDefinition("ROE (%)", lang)} />
        </span>
      </div>

      <p className="mt-4 text-xs italic text-gray-400 dark:text-gray-500">{disclaimer}</p>
    </div>
  );
}
