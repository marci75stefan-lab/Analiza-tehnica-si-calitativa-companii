import truststore

truststore.inject_into_ssl()  # use the OS certificate store instead of only
# the static certifi bundle - some yfinance dependencies (and some local dev
# setups, notably Windows) fail TLS verification against Yahoo otherwise.

from flask import Flask, request, jsonify
import requests
import yfinance as yf
import numpy as np
import pandas as pd

app = Flask(__name__)

DISCLAIMER = (
    "Semnal generat algoritmic in scop educational. "
    "Nu constituie recomandare de investitii."
)

MAX_TICKERS = 3
ALLOWED_PERIODS = {"6mo", "ytd", "1y", "2y", "5y"}
DEFAULT_PERIOD = "1y"

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


def map_score_to_recommendation(score, trend):
    contra_trend = (trend == "bullish" and score < 0) or (trend == "bearish" and score > 0)
    if contra_trend:
        return "Neutru / Prudenta (contra-trend)"
    if score >= 5:
        return "Cumparare puternica"
    if score >= 2:
        return "Cumparare"
    if score >= -1:
        return "Neutru"
    if score >= -4:
        return "Vanzare"
    return "Vanzare puternica"


# WACC assumptions (no live market-rate feed - keeps the app free and fast).
# Documented here and surfaced to the user via the glossary, since these are
# estimates, not exact figures.
RISK_FREE_RATE = 0.045  # approx. long-run 10-year government bond yield
EQUITY_RISK_PREMIUM = 0.05  # approx. long-run market risk premium
DEFAULT_CREDIT_SPREAD = 0.02  # fallback spread over the risk-free rate
DEFAULT_TAX_RATE = 0.21  # fallback effective tax rate


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


def qualitative_analysis(info, fcf, wacc):
    signals = []

    def add(metric, value, sentiment, note):
        signals.append({"metric": metric, "value": value, "sentiment": sentiment, "note": note})

    pe = info.get("trailingPE")
    if pe is not None:
        if pe < 15:
            add("P/E", pe, "positive", "Posibil subevaluata (P/E scazut)")
        elif pe > 30:
            add("P/E", pe, "negative", "Posibil supraevaluata (P/E ridicat)")
        else:
            add("P/E", pe, "neutral", "P/E in interval normal")

    dte = info.get("debtToEquity")
    if dte is not None:
        if dte > 100:
            add("Debt/Equity (%)", round(dte, 2), "negative", "Grad de indatorare ridicat (risc financiar)")
        else:
            add("Debt/Equity (%)", round(dte, 2), "positive", "Grad de indatorare rezonabil")

    margin = info.get("profitMargins")
    if margin is not None:
        if margin > 0.15:
            add("Profit margin (%)", round(margin * 100, 2), "positive", "Marja de profit solida")
        else:
            add("Profit margin (%)", round(margin * 100, 2), "neutral", "Marja de profit modesta")

    roe = info.get("returnOnEquity")
    if roe is not None:
        if roe > 0.15:
            add("ROE (%)", round(roe * 100, 2), "positive", "Eficienta ridicata a capitalului propriu")
        else:
            add("ROE (%)", round(roe * 100, 2), "neutral", "Eficienta moderata a capitalului propriu")

    dividend = info.get("dividendYield")
    if dividend is not None:
        add("Dividend yield (%)", round(dividend, 2), "neutral", "Relevant pentru investitori orientati spre venit")

    if fcf is not None:
        if fcf > 0:
            add(
                "FCF (mil.)",
                round(fcf / 1_000_000, 1),
                "positive",
                "Cash flow liber pozitiv - genereaza mai mult cash din operare decat investeste in capex",
            )
        else:
            add(
                "FCF (mil.)",
                round(fcf / 1_000_000, 1),
                "negative",
                "Cash flow liber negativ - consuma cash net (poate fi normal in faza de investitii intensive)",
            )

    if wacc is not None:
        roe = info.get("returnOnEquity")
        wacc_pct = round(wacc * 100, 2)
        if roe is not None:
            if roe > wacc:
                add(
                    "WACC (%)",
                    wacc_pct,
                    "positive",
                    f"ROE ({roe * 100:.1f}%) depaseste WACC - compania creeaza valoare peste costul capitalului",
                )
            else:
                add(
                    "WACC (%)",
                    wacc_pct,
                    "negative",
                    f"ROE ({roe * 100:.1f}%) sub WACC - randamentul nu acopera costul capitalului",
                )
        else:
            add("WACC (%)", wacc_pct, "neutral", "Cost mediu ponderat al capitalului (estimat, ipoteze simplificate)")

    positive = sum(1 for s in signals if s["sentiment"] == "positive")
    negative = sum(1 for s in signals if s["sentiment"] == "negative")
    total = len(signals)

    if total == 0:
        verdict = "Date fundamentale insuficiente pentru un verdict."
    elif positive > negative:
        verdict = f"{positive} din {total} semnale pozitive - profil fundamental favorabil."
    elif negative > positive:
        verdict = f"{negative} din {total} semnale negative - profil fundamental cu riscuri."
    else:
        verdict = "Semnale mixte - profil fundamental neutru."

    return {"signals": signals, "verdict": verdict}


def analyze_ticker(ticker, period=DEFAULT_PERIOD):
    tk, hist = fetch_ticker(ticker, period)
    if hist.empty:
        return {"ticker": ticker, "error": "Ticker invalid sau fara date disponibile."}

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
    recommendation = map_score_to_recommendation(total_score, trend)

    fcf = compute_fcf(tk, info)
    wacc = compute_wacc(tk, info)

    change = info.get("regularMarketChange")
    change_percent = info.get("regularMarketChangePercent")
    if (change is None or change_percent is None) and len(close) >= 2:
        prev_close = float(close.iloc[-2])
        last_close = float(close.iloc[-1])
        change = last_close - prev_close
        change_percent = (change / prev_close * 100) if prev_close else None

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
            "recommendation": recommendation,
        },
        "qualitative": qualitative_analysis(info, fcf, wacc),
    }


@app.route("/api/analyze", methods=["GET"])
def analyze():
    tickers_param = request.args.get("tickers", "")
    tickers = [t.strip().upper() for t in tickers_param.split(",") if t.strip()]
    period = request.args.get("period", DEFAULT_PERIOD)
    if period not in ALLOWED_PERIODS:
        period = DEFAULT_PERIOD

    if not tickers:
        return jsonify({"error": "Parametrul 'tickers' este obligatoriu."}), 400
    if len(tickers) > MAX_TICKERS:
        return jsonify({"error": f"Maxim {MAX_TICKERS} tickere per comparatie."}), 400

    results = [analyze_ticker(t, period) for t in tickers]

    return jsonify({"disclaimer": DISCLAIMER, "results": results})


if __name__ == "__main__":
    # use_reloader=False: Werkzeug's file-watching auto-restart has been
    # observed to trigger on false-positive changes (even stdlib files) on
    # Windows, killing in-flight requests mid-response. Debug pages/errors
    # still work; just no more auto-restart-on-save for this backend.
    app.run(debug=True, port=5328, use_reloader=False)
