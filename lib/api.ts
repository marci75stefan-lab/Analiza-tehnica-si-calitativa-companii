import type { AnalyzeErrorResponse, AnalyzeResponse, SearchResult } from "./types";

export const MAX_TICKERS = 3;

export async function fetchAnalysis(tickers: string[]): Promise<AnalyzeResponse> {
  const params = new URLSearchParams({ tickers: tickers.join(",") });
  const res = await fetch(`/api/analyze?${params.toString()}`);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      "Serverul de analiza nu a raspuns corect (posibil oprit sau indisponibil momentan). Incearca din nou."
    );
  }

  if (!res.ok) {
    throw new Error((data as AnalyzeErrorResponse).error || "Eroare necunoscuta");
  }

  return data as AnalyzeResponse;
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
