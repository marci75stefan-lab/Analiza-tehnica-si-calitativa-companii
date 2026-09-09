SUPPORTED_LANGS = {"ro", "en"}
DEFAULT_LANG = "ro"

MESSAGES = {
    "ro": {
        "disclaimer": (
            "Semnal generat algoritmic in scop educational. "
            "Nu constituie recomandare de investitii."
        ),
        "sector_unknown": "sector necunoscut",
        "metric_pe": "P/E",
        "metric_dte": "Debt/Equity (%)",
        "metric_margin": "Profit margin (%)",
        "metric_grossmargin": "Gross Margin vs Industrie (%)",
        "metric_roe": "ROE (%)",
        "metric_dividend": "Dividend yield (%)",
        "metric_fcf": "FCF (mil.)",
        "metric_wacc": "WACC (%)",
        "pe_below": "Sub media estimata pentru {sector} (~{benchmark}) - posibil subevaluata",
        "pe_above": "Peste media estimata pentru {sector} (~{benchmark}) - posibil supraevaluata",
        "pe_neutral": "In linie cu media estimata pentru {sector} (~{benchmark})",
        "dte_high": "Grad de indatorare ridicat (risc financiar)",
        "dte_ok": "Grad de indatorare rezonabil",
        "margin_above": "Peste media estimata pentru {sector} (~{benchmark}%) - marja de profit solida",
        "margin_below": "Sub media estimata pentru {sector} (~{benchmark}%) - marja de profit modesta",
        "margin_neutral": "In linie cu media estimata pentru {sector} (~{benchmark}%)",
        "grossmargin_above": "Peste media estimata pentru {sector} (~{benchmark}%) - avantaj competitiv sau putere de pricing",
        "grossmargin_below": "Sub media estimata pentru {sector} (~{benchmark}%) - marje mai subtiri decat concurenta",
        "grossmargin_neutral": "In linie cu media estimata pentru {sector} (~{benchmark}%)",
        "roe_above": "Peste media estimata pentru {sector} (~{benchmark}%) - eficienta ridicata a capitalului propriu",
        "roe_below": "Sub media estimata pentru {sector} (~{benchmark}%) - eficienta scazuta a capitalului propriu",
        "roe_neutral": "In linie cu media estimata pentru {sector} (~{benchmark}%)",
        "dividend_note": "Relevant pentru investitori orientati spre venit",
        "fcf_positive": "Cash flow liber pozitiv - genereaza mai mult cash din operare decat investeste in capex",
        "fcf_negative": "Cash flow liber negativ - consuma cash net (poate fi normal in faza de investitii intensive)",
        "wacc_above": "ROE ({roe:.1f}%) depaseste WACC - compania creeaza valoare peste costul capitalului",
        "wacc_below": "ROE ({roe:.1f}%) sub WACC - randamentul nu acopera costul capitalului",
        "wacc_neutral": "Cost mediu ponderat al capitalului (estimat, ipoteze simplificate)",
        "verdict_insufficient": "Date fundamentale insuficiente pentru un verdict.",
        "verdict_positive": "{count} din {total} semnale pozitive - profil fundamental favorabil.",
        "verdict_negative": "{count} din {total} semnale negative - profil fundamental cu riscuri.",
        "verdict_mixed": "Semnale mixte - profil fundamental neutru.",
        "rec_strong_buy": "Cumparare puternica",
        "rec_buy": "Cumparare",
        "rec_neutral": "Neutru",
        "rec_sell": "Vanzare",
        "rec_strong_sell": "Vanzare puternica",
        "rec_contra_trend": "Neutru / Prudenta (contra-trend)",
        "error_invalid_ticker": "Ticker invalid sau fara date disponibile.",
        "error_no_data_period": (
            "Yahoo Finance nu are date istorice pentru perioada selectata pentru acest ticker. "
            "Incearca o perioada mai scurta."
        ),
        "error_history_short": (
            "Istoric de preturi prea scurt pe Yahoo Finance ({rows} zile disponibile) "
            "pentru o analiza tehnica relevanta."
        ),
        "error_missing_tickers": "Parametrul 'tickers' este obligatoriu.",
        "error_too_many_tickers": "Maxim {max} tickere per comparatie.",
    },
    "en": {
        "disclaimer": (
            "Algorithmically generated signal for educational purposes. "
            "Not investment advice."
        ),
        "sector_unknown": "unknown sector",
        "metric_pe": "P/E",
        "metric_dte": "Debt/Equity (%)",
        "metric_margin": "Profit margin (%)",
        "metric_grossmargin": "Gross Margin vs Industry (%)",
        "metric_roe": "ROE (%)",
        "metric_dividend": "Dividend yield (%)",
        "metric_fcf": "FCF (mil.)",
        "metric_wacc": "WACC (%)",
        "pe_below": "Below the estimated average for {sector} (~{benchmark}) - possibly undervalued",
        "pe_above": "Above the estimated average for {sector} (~{benchmark}) - possibly overvalued",
        "pe_neutral": "In line with the estimated average for {sector} (~{benchmark})",
        "dte_high": "High leverage (financial risk)",
        "dte_ok": "Reasonable leverage",
        "margin_above": "Above the estimated average for {sector} (~{benchmark}%) - solid profit margin",
        "margin_below": "Below the estimated average for {sector} (~{benchmark}%) - modest profit margin",
        "margin_neutral": "In line with the estimated average for {sector} (~{benchmark}%)",
        "grossmargin_above": "Above the estimated average for {sector} (~{benchmark}%) - competitive advantage or pricing power",
        "grossmargin_below": "Below the estimated average for {sector} (~{benchmark}%) - thinner margins than competitors",
        "grossmargin_neutral": "In line with the estimated average for {sector} (~{benchmark}%)",
        "roe_above": "Above the estimated average for {sector} (~{benchmark}%) - high capital efficiency",
        "roe_below": "Below the estimated average for {sector} (~{benchmark}%) - low capital efficiency",
        "roe_neutral": "In line with the estimated average for {sector} (~{benchmark}%)",
        "dividend_note": "Relevant for income-oriented investors",
        "fcf_positive": "Positive free cash flow - generates more cash from operations than it invests in capex",
        "fcf_negative": "Negative free cash flow - burning net cash (can be normal during a heavy investment phase)",
        "wacc_above": "ROE ({roe:.1f}%) exceeds WACC - the company creates value above its cost of capital",
        "wacc_below": "ROE ({roe:.1f}%) is below WACC - returns don't cover the cost of capital",
        "wacc_neutral": "Weighted average cost of capital (estimated, simplified assumptions)",
        "verdict_insufficient": "Insufficient fundamental data for a verdict.",
        "verdict_positive": "{count} out of {total} positive signals - favorable fundamental profile.",
        "verdict_negative": "{count} out of {total} negative signals - fundamental profile with risks.",
        "verdict_mixed": "Mixed signals - neutral fundamental profile.",
        "rec_strong_buy": "Strong Buy",
        "rec_buy": "Buy",
        "rec_neutral": "Neutral",
        "rec_sell": "Sell",
        "rec_strong_sell": "Strong Sell",
        "rec_contra_trend": "Neutral / Caution (against trend)",
        "error_invalid_ticker": "Invalid ticker or no data available.",
        "error_no_data_period": (
            "Yahoo Finance has no historical data for the selected period for this ticker. "
            "Try a shorter period."
        ),
        "error_history_short": (
            "Price history too short on Yahoo Finance ({rows} days available) "
            "for a meaningful technical analysis."
        ),
        "error_missing_tickers": "The 'tickers' parameter is required.",
        "error_too_many_tickers": "Maximum {max} tickers per comparison.",
    },
}


def resolve_lang(lang):
    return lang if lang in SUPPORTED_LANGS else DEFAULT_LANG


def t(key, lang, **kwargs):
    lang = resolve_lang(lang)
    template = MESSAGES[lang].get(key, MESSAGES[DEFAULT_LANG][key])
    return template.format(**kwargs) if kwargs else template
