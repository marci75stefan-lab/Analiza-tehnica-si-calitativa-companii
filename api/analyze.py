import truststore

truststore.inject_into_ssl()  # use the OS certificate store instead of only
# the static certifi bundle - some yfinance dependencies (and some local dev
# setups, notably Windows) fail TLS verification against Yahoo otherwise.

from flask import Flask, request, jsonify
import requests
import yfinance as yf
import numpy as np
import pandas as pd

from i18n import DEFAULT_LANG, resolve_lang, t

app = Flask(__name__)

MAX_TICKERS = 3
ALLOWED_PERIODS = {"6mo", "ytd", "1y", "2y", "5y"}
DEFAULT_PERIOD = "1y"

# Bollinger's 20-day SMA is the widest rolling window among the technical
# indicators - below this many rows RSI/Bollinger are NaN, which previously
# fell through the scoring thresholds as a false, maximally bearish "-2"
# instead of "no signal". Some symbols (e.g. certain indices) report a
# valid, non-empty history from Yahoo Finance with only a handful of rows -
# too little for a meaningful technical read.
MIN_HISTORY_ROWS = 20

# yfinance's default HTTP client (curl_cffi) can fail certificate validation
# in some local dev setups. Fall back to a plain requests session (patched
# by truststore above) if the default session returns no data.
FALLBACK_SESSION = requests.Session()
FALLBACK_SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
        )
    }
)


def fetch_ticker(symbol, period=DEFAULT_PERIOD):
    # auto_adjust=False: yfinance's default bakes dividends (and splits)
    # into historical prices, which inflates simple price-change % vs.
    # what raw closing prices - and every retail/exchange site (e.g.
    # bvb.ro) - show. Raw prices can show a cliff around a stock split,
    # but that's real historical trading data, not a bug; a custom
    # split-only back-adjustment was tried and rejected here because it
    # made a real-world comparison (bvb.ro) diverge further, not less -
    # bvb.ro's own displayed change turned out to not correct for a
    # corporate action (a bonus-share issue) either.
    tk = yf.Ticker(symbol)
    hist = tk.history(period=period, auto_adjust=False)
    if hist.empty:
        tk = yf.Ticker(symbol, session=FALLBACK_SESSION)
        hist = tk.history(period=period, auto_adjust=False)
    return tk, hist


def compute_ema(series, span):
    return series.ewm(span=span, adjust=False).mean()


def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, adjust=False).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def compute_macd(series, fast=12, slow=26, signal=9):
    macd_line = compute_ema(series, fast) - compute_ema(series, slow)
    signal_line = compute_ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_bollinger(series, period=20, num_std=2):
    sma = series.rolling(period).mean()
    std = series.rolling(period).std()
    return sma, sma + num_std * std, sma - num_std * std


def _recent_cross(diff_series):
    if len(diff_series) < 4:
        return False
    return np.sign(diff_series.iloc[-1]) != np.sign(diff_series.iloc[-4])


def score_ema_cross(ema_short, ema_long):
    diff = ema_short - ema_long
    crossed = _recent_cross(diff)
    if diff.iloc[-1] > 0:
        return 2 if crossed else 1
    return -2 if crossed else -1


def score_rsi(rsi_value):
    if rsi_value < 30:
        return 2
    if rsi_value < 45:
        return 1
    if rsi_value <= 55:
        return 0
    if rsi_value <= 70:
        return -1
    return -2


def score_macd(macd_line, signal_line):
    diff = macd_line - signal_line
    crossed = _recent_cross(diff)
    if diff.iloc[-1] > 0:
        return 2 if crossed else 1
    return -2 if crossed else -1


def score_bollinger(close_value, sma_value, upper_value, lower_value):
    if close_value < lower_value:
        return 2
    if close_value < sma_value:
        return 1
    if close_value < upper_value:
        return -1
    return -2


def map_score_to_recommendation(score, trend, lang):
    # recommendationKey is a stable, language-independent identifier - the
    # frontend colors/matches on this, never on the translated label text.
    contra_trend = (trend == "bullish" and score < 0) or (trend == "bearish" and score > 0)
    if contra_trend:
        key = "contra_trend"
    elif score >= 5:
        key = "strong_buy"
    elif score >= 2:
        key = "buy"
    elif score >= -1:
        key = "neutral"
    elif score >= -4:
        key = "sell"
    else:
        key = "strong_sell"
    return key, t(f"rec_{key}", lang)


# WACC assumptions (no live market-rate feed - keeps the app free and fast).
# Documented here and surfaced to the user via the glossary, since these are
# estimates, not exact figures.
RISK_FREE_RATE = 0.045  # approx. long-run 10-year government bond yield
EQUITY_RISK_PREMIUM = 0.05  # approx. long-run market risk premium
DEFAULT_CREDIT_SPREAD = 0.02  # fallback spread over the risk-free rate
DEFAULT_TAX_RATE = 0.21  # fallback effective tax rate

# Approximate long-run gross margin benchmarks per sector (broad, static
# reference values - not a live fetch, to keep the app free and fast; no
# free API provides a real-time sector-wide gross margin aggregate).
SECTOR_GROSS_MARGIN_BENCHMARKS = {
    "Technology": 0.50,
    "Healthcare": 0.55,
    "Communication Services": 0.55,
    "Financial Services": 0.45,
    "Consumer Cyclical": 0.35,
    "Consumer Defensive": 0.30,
    "Industrials": 0.30,
    "Energy": 0.30,
    "Utilities": 0.35,
    "Real Estate": 0.40,
    "Basic Materials": 0.25,
}
DEFAULT_GROSS_MARGIN_BENCHMARK = 0.35  # fallback for unmapped/missing sectors

# Approximate long-run trailing P/E benchmarks per sector (broad, static
# reference values, same rationale as the gross margin table above).
SECTOR_PE_BENCHMARKS = {
    "Technology": 28,
    "Healthcare": 22,
    "Communication Services": 20,
    "Financial Services": 14,
    "Consumer Cyclical": 22,
    "Consumer Defensive": 20,
    "Industrials": 20,
    "Energy": 12,
    "Utilities": 18,
    "Real Estate": 35,
    "Basic Materials": 14,
}
DEFAULT_PE_BENCHMARK = 20

# Approximate long-run net profit margin benchmarks per sector.
SECTOR_PROFIT_MARGIN_BENCHMARKS = {
    "Technology": 0.20,
    "Healthcare": 0.12,
    "Communication Services": 0.15,
    "Financial Services": 0.20,
    "Consumer Cyclical": 0.08,
    "Consumer Defensive": 0.06,
    "Industrials": 0.08,
    "Energy": 0.08,
    "Utilities": 0.10,
    "Real Estate": 0.15,
    "Basic Materials": 0.08,
}
DEFAULT_PROFIT_MARGIN_BENCHMARK = 0.10

# Approximate long-run ROE benchmarks per sector.
SECTOR_ROE_BENCHMARKS = {
    "Technology": 0.20,
    "Healthcare": 0.15,
    "Communication Services": 0.15,
    "Financial Services": 0.12,
    "Consumer Cyclical": 0.18,
    "Consumer Defensive": 0.20,
    "Industrials": 0.15,
    "Energy": 0.10,
    "Utilities": 0.10,
    "Real Estate": 0.08,
    "Basic Materials": 0.12,
}
DEFAULT_ROE_BENCHMARK = 0.15


def compute_fcf(tk, info):
    fcf = info.get("freeCashflow")
    if fcf is not None:
        return float(fcf)
    try:
        cf = tk.cashflow
        if "Free Cash Flow" in cf.index:
            value = cf.loc["Free Cash Flow"].iloc[0]
            return None if pd.isna(value) else float(value)
    except Exception:
        pass
    return None


def compute_wacc(tk, info):
    market_cap = info.get("marketCap")
    beta = info.get("beta")
    if market_cap is None or beta is None:
        return None

    equity = float(market_cap)
    debt = float(info.get("totalDebt") or 0)
    total_value = equity + debt
    if total_value <= 0:
        return None

    cost_of_equity = RISK_FREE_RATE + beta * EQUITY_RISK_PREMIUM
    tax_rate = DEFAULT_TAX_RATE
    cost_of_debt = RISK_FREE_RATE + DEFAULT_CREDIT_SPREAD

    try:
        fin = tk.financials
        latest = fin.columns[0]
        if "Tax Rate For Calcs" in fin.index:
            value = fin.loc["Tax Rate For Calcs", latest]
            if not pd.isna(value) and 0 <= value <= 1:
                tax_rate = float(value)
        if debt > 0 and "Interest Expense" in fin.index:
            interest = fin.loc["Interest Expense", latest]
            if not pd.isna(interest) and interest > 0:
                cost_of_debt = float(interest) / debt
    except Exception:
        pass

    equity_weight = equity / total_value
    debt_weight = debt / total_value

    return equity_weight * cost_of_equity + debt_weight * cost_of_debt * (1 - tax_rate)


def qualitative_analysis(info, fcf, wacc, lang):
    signals = []

    def add(metric_key, value, sentiment, note_key, **fmt):
        signals.append(
            {
                "metricId": metric_key,
                "metric": t(f"metric_{metric_key}", lang),
                "value": value,
                "sentiment": sentiment,
                "note": t(note_key, lang, **fmt),
            }
        )

    sector_unknown = t("sector_unknown", lang)

    pe = info.get("trailingPE")
    if pe is not None:
        sector = info.get("sector")
        pe_benchmark = SECTOR_PE_BENCHMARKS.get(sector, DEFAULT_PE_BENCHMARK)
        pe_sector_label = sector or sector_unknown
        if pe < pe_benchmark * 0.85:
            add("pe", round(pe, 2), "positive", "pe_below", sector=pe_sector_label, benchmark=pe_benchmark)
        elif pe > pe_benchmark * 1.15:
            add("pe", round(pe, 2), "negative", "pe_above", sector=pe_sector_label, benchmark=pe_benchmark)
        else:
            add("pe", round(pe, 2), "neutral", "pe_neutral", sector=pe_sector_label, benchmark=pe_benchmark)

    dte = info.get("debtToEquity")
    if dte is not None:
        if dte > 100:
            add("dte", round(dte, 2), "negative", "dte_high")
        else:
            add("dte", round(dte, 2), "positive", "dte_ok")

    margin = info.get("profitMargins")
    if margin is not None:
        sector = info.get("sector")
        margin_benchmark = SECTOR_PROFIT_MARGIN_BENCHMARKS.get(sector, DEFAULT_PROFIT_MARGIN_BENCHMARK)
        margin_benchmark_pct = round(margin_benchmark * 100, 1)
        margin_sector_label = sector or sector_unknown
        if margin > margin_benchmark + 0.03:
            add(
                "margin",
                round(margin * 100, 2),
                "positive",
                "margin_above",
                sector=margin_sector_label,
                benchmark=margin_benchmark_pct,
            )
        elif margin < margin_benchmark - 0.03:
            add(
                "margin",
                round(margin * 100, 2),
                "negative",
                "margin_below",
                sector=margin_sector_label,
                benchmark=margin_benchmark_pct,
            )
        else:
            add(
                "margin",
                round(margin * 100, 2),
                "neutral",
                "margin_neutral",
                sector=margin_sector_label,
                benchmark=margin_benchmark_pct,
            )

    gross_margin = info.get("grossMargins")
    # yfinance reports an exact 0.0 (rather than None) for sectors where
    # "cost of goods sold" isn't a meaningful concept, e.g. banks/insurers -
    # treat that as missing data rather than a real zero margin.
    if gross_margin is not None and gross_margin != 0:
        sector = info.get("sector")
        benchmark = SECTOR_GROSS_MARGIN_BENCHMARKS.get(sector, DEFAULT_GROSS_MARGIN_BENCHMARK)
        gross_margin_pct = round(gross_margin * 100, 2)
        benchmark_pct = round(benchmark * 100, 1)
        sector_label = sector or sector_unknown
        if gross_margin > benchmark + 0.03:
            add(
                "grossmargin",
                gross_margin_pct,
                "positive",
                "grossmargin_above",
                sector=sector_label,
                benchmark=benchmark_pct,
            )
        elif gross_margin < benchmark - 0.03:
            add(
                "grossmargin",
                gross_margin_pct,
                "negative",
                "grossmargin_below",
                sector=sector_label,
                benchmark=benchmark_pct,
            )
        else:
            add(
                "grossmargin",
                gross_margin_pct,
                "neutral",
                "grossmargin_neutral",
                sector=sector_label,
                benchmark=benchmark_pct,
            )

    roe = info.get("returnOnEquity")
    if roe is not None:
        sector = info.get("sector")
        roe_benchmark = SECTOR_ROE_BENCHMARKS.get(sector, DEFAULT_ROE_BENCHMARK)
        roe_benchmark_pct = round(roe_benchmark * 100, 1)
        roe_sector_label = sector or sector_unknown
        if roe > roe_benchmark + 0.03:
            add(
                "roe",
                round(roe * 100, 2),
                "positive",
                "roe_above",
                sector=roe_sector_label,
                benchmark=roe_benchmark_pct,
            )
        elif roe < roe_benchmark - 0.03:
            add(
                "roe",
                round(roe * 100, 2),
                "negative",
                "roe_below",
                sector=roe_sector_label,
                benchmark=roe_benchmark_pct,
            )
        else:
            add(
                "roe",
                round(roe * 100, 2),
                "neutral",
                "roe_neutral",
                sector=roe_sector_label,
                benchmark=roe_benchmark_pct,
            )

    dividend = info.get("dividendYield")
    if dividend is not None:
        add("dividend", round(dividend, 2), "neutral", "dividend_note")

    if fcf is not None:
        if fcf > 0:
            add("fcf", round(fcf / 1_000_000, 1), "positive", "fcf_positive")
        else:
            add("fcf", round(fcf / 1_000_000, 1), "negative", "fcf_negative")

    if wacc is not None:
        roe = info.get("returnOnEquity")
        wacc_pct = round(wacc * 100, 2)
        if roe is not None:
            if roe > wacc:
                add("wacc", wacc_pct, "positive", "wacc_above", roe=roe * 100)
            else:
                add("wacc", wacc_pct, "negative", "wacc_below", roe=roe * 100)
        else:
            add("wacc", wacc_pct, "neutral", "wacc_neutral")

    positive = sum(1 for s in signals if s["sentiment"] == "positive")
    negative = sum(1 for s in signals if s["sentiment"] == "negative")
    total = len(signals)

    if total == 0:
        verdict = t("verdict_insufficient", lang)
    elif positive > negative:
        verdict = t("verdict_positive", lang, count=positive, total=total)
    elif negative > positive:
        verdict = t("verdict_negative", lang, count=negative, total=total)
    else:
        verdict = t("verdict_mixed", lang)

    return {"signals": signals, "verdict": verdict}


def analyze_ticker(ticker, period=DEFAULT_PERIOD, lang=DEFAULT_LANG):
    tk, hist = fetch_ticker(ticker, period)
    if hist.empty:
        # Empty history for the requested period doesn't necessarily mean an
        # invalid ticker - some symbols (e.g. certain indices) only have a
        # few days of history on Yahoo Finance and error out for longer
        # periods (notably "ytd"). Retry with a short period to tell those
        # apart from an actually-invalid/nonexistent ticker.
        _, probe_hist = fetch_ticker(ticker, "5d")
        if probe_hist.empty:
            return {"ticker": ticker, "error": t("error_invalid_ticker", lang)}
        return {"ticker": ticker, "error": t("error_no_data_period", lang)}
    if len(hist) < MIN_HISTORY_ROWS:
        return {"ticker": ticker, "error": t("error_history_short", lang, rows=len(hist))}

    info = tk.info
    close = hist["Close"]

    ema9 = compute_ema(close, 9)
    ema21 = compute_ema(close, 21)
    ema50 = compute_ema(close, 50)
    ema200 = compute_ema(close, 200)
    rsi = compute_rsi(close)
    macd_line, signal_line, histogram = compute_macd(close)
    sma20, upper, lower = compute_bollinger(close)

    trend = "bullish" if ema50.iloc[-1] > ema200.iloc[-1] else "bearish"

    s_ema = score_ema_cross(ema9, ema21)
    s_rsi = score_rsi(rsi.iloc[-1])
    s_macd = score_macd(macd_line, signal_line)
    s_boll = score_bollinger(close.iloc[-1], sma20.iloc[-1], upper.iloc[-1], lower.iloc[-1])

    total_score = s_ema + s_rsi + s_macd + s_boll
    recommendation_key, recommendation = map_score_to_recommendation(total_score, trend, lang)

    fcf = compute_fcf(tk, info)
    wacc = compute_wacc(tk, info)

    change = info.get("regularMarketChange")
    change_percent = info.get("regularMarketChangePercent")
    if (change is None or change_percent is None) and len(close) >= 2:
        prev_close = float(close.iloc[-2])
        last_close = float(close.iloc[-1])
        change = last_close - prev_close
        change_percent = (change / prev_close * 100) if prev_close else None

    last_row = hist.iloc[-1]
    previous_close = info.get("regularMarketPreviousClose") or info.get("previousClose")
    if previous_close is None and len(close) >= 2:
        previous_close = float(close.iloc[-2])
    day_open = info.get("regularMarketOpen") or info.get("open")
    if day_open is None:
        day_open = float(last_row["Open"])
    day_low = info.get("regularMarketDayLow") or info.get("dayLow")
    if day_low is None:
        day_low = float(last_row["Low"])
    day_high = info.get("regularMarketDayHigh") or info.get("dayHigh")
    if day_high is None:
        day_high = float(last_row["High"])
    week52_low = info.get("fiftyTwoWeekLow")
    if week52_low is None:
        week52_low = float(hist["Low"].tail(252).min())
    week52_high = info.get("fiftyTwoWeekHigh")
    if week52_high is None:
        week52_high = float(hist["High"].tail(252).max())

    price_history = [
        {
            "date": idx.strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 4),
            "high": round(float(row["High"]), 4),
            "low": round(float(row["Low"]), 4),
            "close": round(float(row["Close"]), 4),
            "volume": int(row["Volume"]),
        }
        for idx, row in hist.iterrows()
    ]

    return {
        "ticker": ticker,
        "companyName": info.get("longName") or info.get("shortName") or ticker,
        "currency": info.get("currency"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "price": {
            "current": round(float(close.iloc[-1]), 4),
            "change": round(float(change), 4) if change is not None else None,
            "changePercent": round(float(change_percent), 2) if change_percent is not None else None,
            "previousClose": round(float(previous_close), 4) if previous_close is not None else None,
            "open": round(float(day_open), 4) if day_open is not None else None,
            "dayLow": round(float(day_low), 4) if day_low is not None else None,
            "dayHigh": round(float(day_high), 4) if day_high is not None else None,
            "week52Low": round(float(week52_low), 4) if week52_low is not None else None,
            "week52High": round(float(week52_high), 4) if week52_high is not None else None,
            "history": price_history,
        },
        "fundamentals": {
            "trailingPE": info.get("trailingPE"),
            "forwardPE": info.get("forwardPE"),
            "trailingEps": info.get("trailingEps"),
            "debtToEquity": info.get("debtToEquity"),
            "profitMargins": info.get("profitMargins"),
            "returnOnEquity": info.get("returnOnEquity"),
            "dividendYield": info.get("dividendYield"),
            "marketCap": info.get("marketCap"),
        },
        "technical": {
            "trend": trend,
            "signals": {
                "emaCross": s_ema,
                "rsi": s_rsi,
                "macd": s_macd,
                "bollinger": s_boll,
            },
            "indicators": {
                "rsi": round(float(rsi.iloc[-1]), 2),
                "macd": round(float(macd_line.iloc[-1]), 4),
                "macdSignal": round(float(signal_line.iloc[-1]), 4),
                "ema9": round(float(ema9.iloc[-1]), 4),
                "ema21": round(float(ema21.iloc[-1]), 4),
                "ema50": round(float(ema50.iloc[-1]), 4),
                "ema200": round(float(ema200.iloc[-1]), 4),
                "bollingerUpper": round(float(upper.iloc[-1]), 4),
                "bollingerLower": round(float(lower.iloc[-1]), 4),
            },
            "score": total_score,
            "recommendationKey": recommendation_key,
            "recommendation": recommendation,
        },
        "qualitative": qualitative_analysis(info, fcf, wacc, lang),
    }


@app.route("/api/analyze", methods=["GET"])
def analyze():
    tickers_param = request.args.get("tickers", "")
    tickers = [raw.strip().upper() for raw in tickers_param.split(",") if raw.strip()]
    period = request.args.get("period", DEFAULT_PERIOD)
    if period not in ALLOWED_PERIODS:
        period = DEFAULT_PERIOD
    lang = resolve_lang(request.args.get("lang", DEFAULT_LANG))

    if not tickers:
        return jsonify({"error": t("error_missing_tickers", lang)}), 400
    if len(tickers) > MAX_TICKERS:
        return jsonify({"error": t("error_too_many_tickers", lang, max=MAX_TICKERS)}), 400

    results = [analyze_ticker(ticker, period, lang) for ticker in tickers]

    return jsonify({"disclaimer": t("disclaimer", lang), "results": results})


if __name__ == "__main__":
    # use_reloader=False: Werkzeug's file-watching auto-restart has been
    # observed to trigger on false-positive changes (even stdlib files) on
    # Windows, killing in-flight requests mid-response. Debug pages/errors
    # still work; just no more auto-restart-on-save for this backend.
    app.run(debug=True, port=5328, use_reloader=False)
