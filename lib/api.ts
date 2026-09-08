import type { AnalyzeErrorResponse, AnalyzeResponse } from "./types";

export const MAX_TICKERS = 3;

export async function fetchAnalysis(tickers: string[]): Promise<AnalyzeResponse> {
  const params = new URLSearchParams({ tickers: tickers.join(",") });
  const res = await fetch(`/api/analyze?${params.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as AnalyzeErrorResponse).error || "Eroare necunoscuta");
  }

  return data as AnalyzeResponse;
}
