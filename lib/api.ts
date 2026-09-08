import type { AnalyzeErrorResponse, AnalyzeResponse, SearchResult } from "./types";

export const MAX_TICKERS = 3;

// A well-formed error response from our own backend (e.g. "max 3 tickers",
// "invalid ticker"). Not transient - retrying would just fail the same way.
class ApplicationError extends Error {}

async function requestAnalysis(tickers: string[]): Promise<AnalyzeResponse> {
  const params = new URLSearchParams({ tickers: tickers.join(",") });
  const res = await fetch(`/api/analyze?${params.toString()}`);
  const data: unknown = await res.json();

  if (!res.ok) {
    throw new ApplicationError((data as AnalyzeErrorResponse).error || "Eroare necunoscuta");
  }

  return data as AnalyzeResponse;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAnalysis(tickers: string[]): Promise<AnalyzeResponse> {
  try {
    return await requestAnalysis(tickers);
  } catch (err) {
    if (err instanceof ApplicationError) {
      throw err;
    }
    // Network error or a non-JSON response (backend mid-restart, brief
    // blip) - usually transient. One quick retry clears most of these
    // before bothering the user with an error.
    await delay(800);
    try {
      return await requestAnalysis(tickers);
    } catch (err2) {
      if (err2 instanceof ApplicationError) {
        throw err2;
      }
      throw new Error(
        "Serverul de analiza nu a raspuns corect (posibil oprit sau indisponibil momentan). Incearca din nou."
      );
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
