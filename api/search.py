import truststore

truststore.inject_into_ssl()  # see api/analyze.py for why this is needed

from flask import Flask, request, jsonify
import requests
import yfinance as yf

app = Flask(__name__)

MAX_RESULTS = 8

FALLBACK_SESSION = requests.Session()
FALLBACK_SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
        )
    }
)


def run_search(query):
    try:
        quotes = yf.Search(query, max_results=MAX_RESULTS).quotes
        if quotes:
            return quotes
    except Exception:
        pass
    return yf.Search(query, max_results=MAX_RESULTS, session=FALLBACK_SESSION).quotes


@app.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()
    if len(query) < 2:
        return jsonify({"results": []})

    quotes = run_search(query)

    results = [
        {
            "symbol": q.get("symbol"),
            "name": q.get("shortname") or q.get("longname") or q.get("symbol"),
            "exchange": q.get("exchange"),
            "quoteType": q.get("quoteType"),
        }
        for q in quotes
        if q.get("quoteType") == "EQUITY" and q.get("symbol")
    ][:MAX_RESULTS]

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True, port=5329)
