# Specificații proiect — Analiză Tehnică și Calitativă a Companiilor Listate la Bursă

## Scop

Proiect educațional realizat în cadrul unui curs de vibecoding. Aplicație web care oferă analiză tehnică și calitativă (fundamentală) pentru companii listate la bursă, atât de pe piețe internaționale (NYSE/NASDAQ etc.), cât și de la BVB (Bursa de Valori București).

**Cerință strictă:** proiectul trebuie să funcționeze cu **zero costuri** — doar servicii, biblioteci și tier-uri gratuite.

---

## Stack tehnologic

- **Frontend:** Next.js (TypeScript) + Tailwind CSS + `lightweight-charts` (grafice interactive)
- **Backend:** Python, implementat ca funcții **serverless pe Vercel** (nu server dedicat)
- **Persistență:** fără bază de date — toată persistența se face client-side, în `localStorage` al browserului
- **Repo & deploy:** cod pe **GitHub**, conectat la **Vercel** pentru auto-deploy gratuit la fiecare push (un singur URL live)

### Risc tehnic de validat în implementare
Funcțiile serverless Python pe Vercel au o limită de dimensiune (~250MB incluzând dependințele). `pandas` + `numpy` + `yfinance` ar trebui să se încadreze, dar trebuie testat din primii pași de implementare.
**Fallback gratuit** dacă nu se încadrează: backend găzduit pe Render (free tier), cu mențiunea că adoarme după 15 min de inactivitate.

---

## Sursă de date

- **`yfinance`** (Python) — gratuit, fără cheie API necesară.
- Confirmat funcțional (testat live) pentru:
  - Companii internaționale, ex. `AAPL`
  - Companii de la BVB, folosind sufixul `.RO`, ex. `SNP.RO` (OMV Petrom), `TLV.RO` (Banca Transilvania), `SNG.RO` (Romgaz)
- Oferă atât preț istoric (OHLCV), cât și date fundamentale (P/E, EPS, debt/equity, profit margin, ROE, dividend yield, sector, industrie, market cap etc.)
- Notă: unele câmpuri fundamentale pot lipsi pentru anumite companii/sectoare (ex. `debtToEquity` lipsește uneori la bănci) — normal, trebuie tratat gracios în UI.

---

## Analiza calitativă (fundamentală)

Motor **rule-based**, fără LLM/AI generativ (deci fără costuri și fără risc de depășire de cotă API).

Compară indicatori fundamentali cu praguri sau cu media sectorului și generează un verdict text automat:

- **P/E (trailing/forward)** vs. medie sector → subevaluat / supraevaluat / neutru
- **Debt/Equity** peste un prag → semnal de risc financiar
- **Profit margin** / **ROE** peste medie → semnal de eficiență operațională
- **Dividend yield** → semnal relevant pentru investitori orientați spre venit
- Combinație de semnale → un rezumat/verdict agregat (ex. „X din Y semnale pozitive")

---

## Analiza tehnică

Motor **rule-based**, cu 4 semnale, fiecare scorat pe o scală **-2 .. +2**. Scor agregat total: **-8 .. +8**.

### 1. EMA cross (9/21)
- Cross bullish recent (ultimele 1-3 zile) → **+2**
- EMA9 peste EMA21, fără cross recent → **+1**
- Simetric negativ pentru cross bearish / EMA9 sub EMA21

### 2. RSI (14)
- RSI < 30 (oversold) → **+2**
- RSI 30–45 → **+1**
- RSI 45–55 (neutru) → **0**
- RSI 55–70 → **-1**
- RSI > 70 (overbought) → **-2**

### 3. MACD
- Cross bullish al liniei MACD peste linia signal → **+2**
- MACD peste signal, dar histogramă în scădere (momentum slăbește) → **+1**
- Simetric negativ pentru cross bearish / histogramă descrescătoare pe partea negativă

### 4. Bollinger Bands
- Preț sub banda inferioară (oversold puternic) → **+2**
- Preț între banda inferioară și SMA20 → **+1**
- Preț între SMA20 și banda superioară → **-1**
- Preț peste banda superioară (overbought puternic) → **-2**

### Filtru de trend (context, nu semnal direct)
- **EMA50 vs EMA200:** EMA50 > EMA200 → trend general „bullish"; invers → „bearish"
- Dacă scorul agregat contrazice trendul de fond (ex. scor pozitiv dar trend bearish), recomandarea este **retrogradată** la „Neutru / Prudență" în loc de un semnal agresiv, pentru a reduce semnalele false.

### Mapare scor final → recomandare

| Scor agregat | Recomandare |
|---|---|
| ≥ 5 (și trend confirmă) | Cumpărare puternică |
| 2 .. 4 | Cumpărare |
| -1 .. 1 | Neutru |
| -2 .. -4 | Vânzare |
| ≤ -5 | Vânzare puternică |
| Contra-trend | Neutru / Prudență (indiferent de scor brut) |

### Disclaimer — obligatoriu
Inclus ca **field explicit în răspunsul API** (nu doar text în UI, pentru a nu putea fi omis accidental de frontend) și afișat vizibil lângă orice recomandare:

> „Semnal generat algoritmic în scop educațional. Nu constituie recomandare de investiții."

---

## Funcționalități

### MVP de bază
1. User introduce un ticker (ex. `AAPL`, `SNP.RO`)
2. Backend aduce preț istoric + fundamentale (`yfinance`)
3. Backend calculează indicatorii tehnici + scorul agregat + recomandarea
4. Backend rulează motorul calitativ pe fundamentale
5. Frontend afișează: grafic interactiv cu indicatori, tabel fundamentale, card semnal tehnic (cu disclaimer), card verdict calitativ

### Funcționalități suplimentare (client-side, fără DB)
- **Watchlist** — listă de tickere salvate în `localStorage`, fără cont necesar
- **Comparație** — până la **3 tickere** simultan, procesate în paralel pe backend (pentru a respecta timeout-ul funcțiilor serverless gratuite); afișare side-by-side (tabel + grafic suprapus)
- **Istoric** — ultimele ~20 analize rulate, salvate automat în `localStorage` cu timestamp, redeschidere rapidă
- **Export raport** — generare PDF/CSV **direct în browser** (ex. `jsPDF`), fără request suplimentar către backend

---

## Decizii explicite de scop (ce NU face proiectul)

- Nu folosește niciun LLM/AI generativ (analiza calitativă e rule-based, nu costă nimic)
- Nu are autentificare/conturi de utilizator
- Nu are bază de date server-side — toată persistența e locală în browser
- Nu oferă recomandări de investiții reale — doar semnale algoritmice educaționale, clar marcate ca atare

---

## Status

Faza de brainstorming/specificații — **finalizată**. Următorul pas: scaffold-ul proiectului (structură de foldere, primul endpoint funcțional, primul commit pe GitHub).
