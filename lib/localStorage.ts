import type { AnalyzeResponse } from "./types";

const WATCHLIST_KEY = "atc_watchlist";
const HISTORY_KEY = "atc_history";
const HISTORY_LIMIT = 20;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponibil (mod privat etc.) - persistenta e best-effort
  }
}

export function getWatchlist(): string[] {
  return readJson<string[]>(WATCHLIST_KEY, []);
}

export function addToWatchlist(ticker: string): string[] {
  const current = getWatchlist();
  if (current.includes(ticker)) return current;
  const updated = [...current, ticker];
  writeJson(WATCHLIST_KEY, updated);
  return updated;
}

export function removeFromWatchlist(ticker: string): string[] {
  const updated = getWatchlist().filter((t) => t !== ticker);
  writeJson(WATCHLIST_KEY, updated);
  return updated;
}

export interface HistoryEntry {
  timestamp: string;
  tickers: string[];
  response: AnalyzeResponse;
}

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(HISTORY_KEY, []);
}

export function addToHistory(tickers: string[], response: AnalyzeResponse): HistoryEntry[] {
  const entry: HistoryEntry = { timestamp: new Date().toISOString(), tickers, response };
  const updated = [entry, ...getHistory()].slice(0, HISTORY_LIMIT);
  writeJson(HISTORY_KEY, updated);
  return updated;
}

export function clearHistory(): HistoryEntry[] {
  writeJson(HISTORY_KEY, []);
  return [];
}
