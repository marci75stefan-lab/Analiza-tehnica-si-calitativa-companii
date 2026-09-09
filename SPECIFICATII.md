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

### Risc tehnic — validat
Funcțiile serverless Python pe Vercel au o limită de dimensiune (~250MB incluzând dependințele). `pandas` + `numpy` + `yfinance` se încadrează fără probleme — **confirmat cu un deploy live** pe planul gratuit (Hobby): homepage, `/api/analyze` și `/api/markets` răspund cu `200` și date reale. Fallback-ul pe Render nu mai e necesar.

---

## Sursă de date

- **`yfinance`** (Python) — gratuit, fără cheie API necesară.
- Confirmat funcțional (testat live) pentru:
  - Companii internaționale, ex. `AAPL`
  - Companii de la BVB, folosind sufixul `.RO`, ex. `SNP.RO` (OMV Petrom), `TLV.RO` (Banca Transilvania), `SNG.RO` (Romgaz) — toate testate live, inclusiv pe deploy-ul de producție
  - Indici/mărfuri/valute pentru bara "Markets" (vezi mai jos): `^GSPC` (S&P 500), `^IXIC` (Nasdaq), `GC=F` (Gold), `^GDAXI` (DAX), `^BET.RO` (indicele BET, BVB), `EURUSD=X`
- Oferă atât preț istoric (OHLCV), cât și date fundamentale (P/E, EPS, debt/equity, profit margin, ROE, dividend yield, sector, industrie, market cap etc.)
- Notă: unele câmpuri fundamentale pot lipsi pentru anumite companii/sectoare (ex. `debtToEquity` lipsește uneori la bănci) — normal, trebuie tratat gracios în UI. La fel, `grossMargins` vine ca `0.0` (nu `None`) pentru bănci/instituții financiare, unde conceptul nu se aplică — tratat explicit ca "date lipsă".
- Notă: unele simboluri (confirmat pentru `^BET.RO`) au pe Yahoo Finance istoric de preț de doar 1 zi, indiferent de perioada cerută — insuficient pentru analiza tehnică (vezi mai jos "Date istorice insuficiente").

---

## Analiza calitativă (fundamentală)

Motor **rule-based**, fără LLM/AI generativ (deci fără costuri și fără risc de depășire de cotă API).

Compară indicatori fundamentali cu praguri sau cu media sectorului și generează un verdict text automat.

Comparațiile "vs. medie sector" (P/E, Profit margin, ROE, Gross Margin) folosesc un **tabel static de referință per sector** (`SECTOR_*_BENCHMARKS` în `api/analyze.py`), nu o medie calculată live — nicio sursă gratuită nu oferă un agregat live pe industrie. Sectorul companiei vine din `yfinance` (câmpul `sector`); dacă nu se găsește în tabel, se folosește o valoare implicită (`DEFAULT_*_BENCHMARK`).

- **P/E (trailing)** vs. medie sector (±15% toleranță) → sub medie = posibil subevaluată / peste medie = posibil supraevaluată / neutru
- **Debt/Equity** peste un prag fix (100%) → semnal de risc financiar
- **Profit margin** vs. medie sector (±3pp toleranță) → peste medie = eficiență operațională / sub medie = marjă modestă
- **ROE** vs. medie sector (±3pp toleranță) → peste medie = folosire eficientă a capitalului / sub medie = eficiență scăzută
- **Gross Margin** vs. medie sector (±3pp toleranță) → peste medie = avantaj competitiv/putere de pricing / sub medie = marje mai subțiri decât concurența. Semnalul e omis dacă `grossMargins` e exact `0` (bănci/instituții financiare, unde conceptul nu se aplică)
- **Dividend yield** → semnal relevant pentru investitori orientați spre venit
- **FCF (Free Cash Flow)** — din `yfinance` (`freeCashflow`, cu fallback pe situația de cash flow) → pozitiv/negativ
- **WACC (Cost Mediu Ponderat al Capitalului)** — calculat (CAPM pentru costul capitalului propriu, cu ipoteze simplificate: rată fără risc ~4.5%, primă de risc de piață ~5%; costul datoriei din dobânda/datoria totală raportată, cu fallback pe rată fără risc + marjă de credit ~2%; cotă de impozitare din situațiile financiare, cu fallback 21%) → comparat cu ROE: ROE > WACC = creare de valoare peste costul capitalului
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

### Date istorice insuficiente
Bollinger (SMA20) e cea mai lungă fereastră dintre indicatori — sub 20 de zile de istoric, RSI/Bollinger dau `NaN`. Inițial acest `NaN` cădea prin pragurile de scor ca un fals semnal de vânzare puternică (-2) în loc de "fără semnal". Acum, sub acest prag (`MIN_HISTORY_ROWS = 20`), backend-ul întoarce explicit o eroare de tip "istoric prea scurt" în loc să calculeze un scor din date insuficiente. Similar, dacă istoricul e complet gol pentru perioada cerută dar ticker-ul are date pe o perioadă scurtă (ex. `5d`), eroarea distinge "ticker invalid" de "date indisponibile pentru perioada selectată".

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
- **Istoric** — ultimele ~20 analize rulate, salvate automat în `localStorage` cu timestamp, redeschidere rapidă; buton „Șterge istoric" pentru golire completă
- **Export raport** — generare PDF/CSV **direct în browser** (ex. `jsPDF`), fără request suplimentar către backend
- **Căutare companie după nume** — endpoint separat (`api/search.py`, `yf.Search`), pentru cazul în care userul nu știe simbolul bursier
- **Glosar de termeni** — secțiune colapsabilă cu definiții pentru toți indicatorii tehnici/calitativi, cu tooltip-uri inline lângă fiecare valoare afișată
- **Bara „Markets"** — afișată deasupra titlului, cu preț + variație zilnică pentru S&P 500, Nasdaq, Gold, DAX, BET.RO (indicele, `^BET.RO`) și EUR/USD; endpoint separat (`api/markets.py`) cu cache de 60s
- **Secțiune „Important!"** — sub Glosar, recomandări generale de siguranță financiară (fond de urgență, nu investi bani împrumutați, diversificare etc.) — conținut static, nu vine din API

---

## Localizare (RO/EN)

Comutator de limbă (buton RO/EN lângă titlu), cu traducere **completă** — atât interfața statică, cât și textul generat dinamic de motorul de analiză (recomandări, semnale calitative, verdicte, mesaje de eroare), nu doar etichetele fixe.

- **Backend** (`api/analyze.py`): un dicționar de mesaje RO/EN inline în fișier (nu într-un modul separat — vezi nota de mai jos) și un parametru `lang` pe `/api/analyze`. Recomandarea tehnică întoarce și o cheie stabilă, independentă de limbă (`recommendationKey`, ex. `"strong_buy"`), separat de eticheta tradusă (`recommendation`) — frontend-ul colorează pe baza cheii, nu a textului, ca să nu se rupă la schimbarea limbii.
- **Frontend** (`lib/i18n.ts` + `lib/LanguageContext.tsx`): context React cu preferința de limbă persistată în `localStorage`. Glosarul (`lib/glossary.ts`) are definiții bilingve și o dublă cheie de căutare (`roKey`/`enKey`), pentru că eticheta unui semnal ("Gross Margin vs Industrie/Industry") diferă între limbi și e folosită atât ca text afișat, cât și ca cheie de căutare în glosar.
- **Notă tehnică importantă:** un `import` dintr-un modul Python separat (`api/i18n.py`) funcționa perfect local, dar **pica cu eroare 500 pe Vercel** — mediul serverless Python nu rezolva fiabil importul dintre fișierele din `api/`. Fix: tot dicționarul de traduceri e inclus direct (inline) în `api/analyze.py`, fără dependență de fișier separat. De reținut pentru orice extindere viitoare a backend-ului: **evită import-uri între fișierele din `api/`** — fiecare fișier acolo e deployat ca funcție serverless independentă.

---

## Decizii explicite de scop (ce NU face proiectul)

- Nu folosește niciun LLM/AI generativ (analiza calitativă e rule-based, nu costă nimic)
- Nu are autentificare/conturi de utilizator
- Nu are bază de date server-side — toată persistența e locală în browser
- Nu oferă recomandări de investiții reale — doar semnale algoritmice educaționale, clar marcate ca atare

---

## Status

**Complet — toate funcționalitățile din acest document sunt implementate, testate și live.** MVP-ul de bază, toate funcționalitățile suplimentare (watchlist, comparație, istoric, export, căutare, glosar, bara Markets, recomandări financiare) și localizarea RO/EN funcționează pe deploy-ul de producție. Layout confirmat responsive (375px și 320px, fără overflow orizontal). Testate live, cu date reale: `AAPL` (SUA), `TLV.RO`, `SNG.RO`, `SNP.RO` (BVB), în ambele limbi.

**Deploy live:** `https://analiza-tehnica-si-calitativa-compa.vercel.app/` — plan Vercel Hobby (gratuit), auto-deploy la fiecare push pe `main`.

Nu mai există puncte deschise cunoscute. Orice extindere de aici încolo e o funcționalitate nouă, nu un gap din specificațiile inițiale.
