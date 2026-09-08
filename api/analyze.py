from flask import Flask, request, jsonify
import yfinance as yf
import numpy as np

app = Flask(__name__)

DISCLAIMER = (
    "Semnal generat algoritmic in scop educational. "
    "Nu constituie recomandare de investitii."
)

MAX_TICKERS = 3


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


def qualitative_analysis(info):
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
            add("Debt/Equity", dte, "negative", "Grad de indatorare ridicat (risc financiar)")
        else:
            add("Debt/Equity", dte, "positive", "Grad de indatorare rezonabil")

    margin = info.get("profitMargins")
    if margin is not None:
        if margin > 0.15:
            add("Profit margin", margin, "positive", "Marja de profit solida")
        else:
            add("Profit margin", margin, "neutral", "Marja de profit modesta")

    roe = info.get("returnOnEquity")
    if roe is not None:
        if roe > 0.15:
            add("ROE", roe, "positive", "Eficienta ridicata a capitalului propriu")
        else:
            add("ROE", roe, "neutral", "Eficienta moderata a capitalului propriu")

    dividend = info.get("dividendYield")
    if dividend is not None:
        add("Dividend yield", dividend, "neutral", "Relevant pentru investitori orientati spre venit")

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


def analyze_ticker(ticker):
    tk = yf.Ticker(ticker)
    hist = tk.history(period="1y")
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
        "qualitative": qualitative_analysis(info),
    }


@app.route("/api/analyze", methods=["GET"])
def analyze():
    tickers_param = request.args.get("tickers", "")
    tickers = [t.strip().upper() for t in tickers_param.split(",") if t.strip()]

    if not tickers:
        return jsonify({"error": "Parametrul 'tickers' este obligatoriu."}), 400
    if len(tickers) > MAX_TICKERS:
        return jsonify({"error": f"Maxim {MAX_TICKERS} tickere per comparatie."}), 400

    results = [analyze_ticker(t) for t in tickers]

    return jsonify({"disclaimer": DISCLAIMER, "results": results})


if __name__ == "__main__":
    app.run(debug=True, port=5328)
