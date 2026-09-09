import type { AnalyzeErrorResponse, AnalyzeResponse, SearchResult } from "./types";
import { t, type Lang } from "./i18n";

export const MAX_TICKERS = 3;

export type Period = "6mo" | "ytd" | "1y" | "2y" | "5y";
export const DEFAULT_PERIOD: Period = "1y";
export const PERIOD_OPTIONS: { value: Period; labelKey: "period6mo" | "periodYtd" | "period1y" | "period2y" | "period5y" }[] = [
  { value: "6mo", labelKey: "period6mo" },
  { value: "ytd", labelKey: "periodYtd" },
  { value: "1y", labelKey: "period1y" },
  { value: "2y", labelKey: "period2y" },
  { value: "5y", labelKey: "period5y" },
];

// A well-formed error response from our own backend (e.g. "max 3 tickers",
// "invalid ticker"). Not transient - retrying would just fail the same way.
class ApplicationError extends Error {}

async function requestAnalysis(tickers: string[], period: Period, lang: Lang): Promise<AnalyzeResponse> {
  const params = new URLSearchParams({ tickers: tickers.join(","), period, lang });
  const res = await fetch(`/api/analyze?${params.toString()}`);
  const data: unknown = await res.json();

  if (!res.ok) {
    throw new ApplicationError((data as AnalyzeErrorResponse).error || t(lang, "unknownError"));
  }

  return data as AnalyzeResponse;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAnalysis(
  tickers: string[],
  period: Period = DEFAULT_PERIOD,
  lang: Lang = "ro"
): Promise<AnalyzeResponse> {
  try {
    return await requestAnalysis(tickers, period, lang);
  } catch (err) {
    if (err instanceof ApplicationError) {
      throw err;
    }
    // Network error or a non-JSON response (backend mid-restart, brief
    // blip) - usually transient. One quick retry clears most of these
    // before bothering the user with an error.
    await delay(800);
    try {
      return await requestAnalysis(tickers, period, lang);
    } catch (err2) {
      if (err2 instanceof ApplicationError) {
        throw err2;
      }
      throw new Error(t(lang, "serverError"));
    }
  }
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query });
  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results as SearchResult[]) ?? [];
  } catch {
    return [];
  }
}
