export interface PriceHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Sentiment = "positive" | "negative" | "neutral";

export interface QualitativeSignal {
  metric: string;
  value: number;
  sentiment: Sentiment;
  note: string;
}

export interface TickerAnalysis {
  ticker: string;
  error?: string;
  companyName?: string;
  currency?: string;
  sector?: string;
  industry?: string;
  price?: {
    current: number;
    history: PriceHistoryPoint[];
  };
  fundamentals?: {
    trailingPE: number | null;
    forwardPE: number | null;
    trailingEps: number | null;
    debtToEquity: number | null;
    profitMargins: number | null;
    returnOnEquity: number | null;
    dividendYield: number | null;
    marketCap: number | null;
  };
  technical?: {
    trend: "bullish" | "bearish";
    signals: {
      emaCross: number;
      rsi: number;
      macd: number;
      bollinger: number;
    };
    indicators: Record<string, number | null>;
    score: number;
    recommendation: string;
  };
  qualitative?: {
    signals: QualitativeSignal[];
    verdict: string;
  };
}

export interface AnalyzeResponse {
  disclaimer: string;
  results: TickerAnalysis[];
}

export interface AnalyzeErrorResponse {
  error: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string | null;
  quoteType: string;
}

export type CompleteTickerAnalysis = TickerAnalysis & {
  companyName: string;
  currency: string;
  price: NonNullable<TickerAnalysis["price"]>;
  fundamentals: NonNullable<TickerAnalysis["fundamentals"]>;
  technical: NonNullable<TickerAnalysis["technical"]>;
  qualitative: NonNullable<TickerAnalysis["qualitative"]>;
};

export function isCompleteAnalysis(r: TickerAnalysis): r is CompleteTickerAnalysis {
  return !r.error && !!r.price && !!r.fundamentals && !!r.technical && !!r.qualitative;
}
