import time

import truststore

truststore.inject_into_ssl()  # see api/analyze.py for why this is needed

from flask import Flask, jsonify
import yfinance as yf

app = Flask(__name__)

CACHE_TTL_SECONDS = 60  # avoid hammering Yahoo Finance on every page load

# (Yahoo Finance symbol, display label).
MARKET_SYMBOLS = [
    ("^GSPC", "S&P 500"),
    ("^IXIC", "Nasdaq"),
    ("GC=F", "Gold"),
    ("^GDAXI", "DAX"),
    ("^BET.RO", "BET.RO"),
    ("EURUSD=X", "EUR/USD"),
]

_cache = {"data": None, "fetched_at": 0.0}


def fetch_quote(symbol, label):
    try:
        fast_info = yf.Ticker(symbol).fast_info
        price = fast_info.get("lastPrice")
        prev_close = fast_info.get("previousClose")
        if price is None or prev_close is None:
            return {"symbol": symbol, "label": label, "error": True}
        change = price - prev_close
        change_percent = (change / prev_close) * 100 if prev_close else None
        return {
            "symbol": symbol,
            "label": label,
            "price": round(price, 4),
            "change": round(change, 4),
            "changePercent": round(change_percent, 2) if change_percent is not None else None,
            "currency": fast_info.get("currency"),
        }
    except Exception:
        return {"symbol": symbol, "label": label, "error": True}


@app.route("/api/markets", methods=["GET"])
def markets():
    now = time.time()
    if _cache["data"] is not None and now - _cache["fetched_at"] < CACHE_TTL_SECONDS:
        return jsonify({"quotes": _cache["data"]})

    quotes = [fetch_quote(symbol, label) for symbol, label in MARKET_SYMBOLS]
    _cache["data"] = quotes
    _cache["fetched_at"] = now
    return jsonify({"quotes": quotes})


if __name__ == "__main__":
    # see api/analyze.py for why use_reloader is disabled
    app.run(debug=True, port=5330, use_reloader=False)
