import type { Lang } from "./i18n";

export interface GlossaryTerm {
  // roKey/enKey: the metric label as it appears in API responses for that
  // language. Most are identical in both languages (already English finance
  // abbreviations) - only Gross Margin differs ("Industrie" vs "Industry").
  roKey: string;
  enKey: string;
  term: Record<Lang, string>;
  category: "tehnic" | "calitativ";
  definition: Record<Lang, string>;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    roKey: "ema",
    enKey: "ema",
    term: { ro: "EMA (Exponential Moving Average)", en: "EMA (Exponential Moving Average)" },
    category: "tehnic",
    definition: {
      ro: "Medie mobila care da mai multa greutate preturilor recente. Arata directia generala a pretului, fara zgomotul zilnic.",
      en: "A moving average that gives more weight to recent prices. Shows the price's overall direction without daily noise.",
    },
  },
  {
    roKey: "emaCross",
    enKey: "emaCross",
    term: { ro: "EMA cross (9/21)", en: "EMA cross (9/21)" },
    category: "tehnic",
    definition: {
      ro: "Cand o EMA rapida (9 zile) trece peste una lenta (21 zile) - semnal ca momentul recent e mai puternic decat cel de fond.",
      en: "When a fast EMA (9 days) crosses above a slow one (21 days) - a signal that recent momentum is stronger than the underlying trend.",
    },
  },
  {
    roKey: "rsi",
    enKey: "rsi",
    term: { ro: "RSI (Relative Strength Index)", en: "RSI (Relative Strength Index)" },
    category: "tehnic",
    definition: {
      ro: "Numar intre 0 si 100. Sub 30 = vandut excesiv, posibil rebound. Peste 70 = cumparat excesiv, posibila corectie.",
      en: "A number between 0 and 100. Below 30 = oversold, possible rebound. Above 70 = overbought, possible correction.",
    },
  },
  {
    roKey: "macd",
    enKey: "macd",
    term: { ro: "MACD", en: "MACD" },
    category: "tehnic",
    definition: {
      ro: "Compara doua medii mobile exponentiale pentru a detecta schimbari de moment. Cand linia MACD trece peste linia signal, momentul devine pozitiv.",
      en: "Compares two exponential moving averages to detect momentum shifts. When the MACD line crosses above the signal line, momentum turns positive.",
    },
  },
  {
    roKey: "bollinger",
    enKey: "bollinger",
    term: { ro: "Bollinger Bands", en: "Bollinger Bands" },
    category: "tehnic",
    definition: {
      ro: "Benzi in jurul unei medii mobile, calculate cu volatilitatea recenta. Pret aproape de banda de jos = posibila subevaluare pe termen scurt; aproape de banda de sus = posibila supraevaluare.",
      en: "Bands around a moving average, calculated from recent volatility. Price near the lower band = possible short-term undervaluation; near the upper band = possible overvaluation.",
    },
  },
  {
    roKey: "trend",
    enKey: "trend",
    term: { ro: "Trend de fond (bullish/bearish)", en: "Underlying trend (bullish/bearish)" },
    category: "tehnic",
    definition: {
      ro: "Directia generala a pretului pe termen lung (EMA50 vs EMA200). Semnalele scurte care contrazic trendul mare sunt retrogradate la Neutru/Prudenta.",
      en: "The overall long-term price direction (EMA50 vs EMA200). Short-term signals that contradict the larger trend are downgraded to Neutral/Caution.",
    },
  },
  {
    roKey: "previousClose",
    enKey: "previousClose",
    term: { ro: "Inchidere anterioara", en: "Previous Close" },
    category: "tehnic",
    definition: {
      ro: "Pretul de inchidere din ultima zi de tranzactionare anterioara (Previous Close).",
      en: "The closing price from the last trading day (Previous Close).",
    },
  },
  {
    roKey: "open",
    enKey: "open",
    term: { ro: "Deschidere", en: "Open" },
    category: "tehnic",
    definition: {
      ro: "Pretul la care a inceput tranzactionarea in ziua curenta (Open).",
      en: "The price at which trading started today (Open).",
    },
  },
  {
    roKey: "dayRange",
    enKey: "dayRange",
    term: { ro: "Interval zilnic (Day's Range)", en: "Day's Range" },
    category: "tehnic",
    definition: {
      ro: "Cel mai mic si cel mai mare pret la care s-a tranzactionat actiunea in ziua curenta.",
      en: "The lowest and highest price the stock traded at today.",
    },
  },
  {
    roKey: "week52Range",
    enKey: "week52Range",
    term: { ro: "Interval 52 saptamani (52 Week Range)", en: "52 Week Range" },
    category: "tehnic",
    definition: {
      ro: "Cel mai mic si cel mai mare pret de inchidere din ultimul an. Util pentru a vedea unde se situeaza pretul curent fata de extremele recente.",
      en: "The lowest and highest closing price over the past year. Useful for seeing where the current price sits relative to recent extremes.",
    },
  },
  {
    roKey: "YTD",
    enKey: "YTD",
    term: { ro: "YTD (Year to Date)", en: "YTD (Year to Date)" },
    category: "tehnic",
    definition: {
      ro: "De la inceputul anului calendaristic curent pana azi (ex. 1 ianuarie - azi). Util pentru a vedea performanta doar din acest an.",
      en: "From the start of the current calendar year to today (e.g. Jan 1 - today). Useful for seeing performance for this year only.",
    },
  },
  {
    roKey: "score",
    enKey: "score",
    term: { ro: "Scor tehnic", en: "Technical score" },
    category: "tehnic",
    definition: {
      ro: "Suma celor 4 semnale (EMA cross, RSI, MACD, Bollinger), interval -8..+8. Cu cat e mai mare, cu atat semnalele sunt mai puternic pozitive.",
      en: "The sum of the 4 signals (EMA cross, RSI, MACD, Bollinger), range -8..+8. The higher it is, the more strongly positive the signals.",
    },
  },
  {
    roKey: "recommendation",
    enKey: "recommendation",
    term: { ro: "Recomandare", en: "Recommendation" },
    category: "tehnic",
    definition: {
      ro: "Traducerea scorului tehnic intr-un verdict text. Semnal algoritmic educational, nu recomandare de investitii reala.",
      en: "The technical score translated into a text verdict. An educational algorithmic signal, not real investment advice.",
    },
  },
  {
    roKey: "P/E",
    enKey: "P/E",
    term: { ro: "P/E (Price/Earnings)", en: "P/E (Price/Earnings)" },
    category: "calitativ",
    definition: {
      ro: "Cat platesti pe fiecare unitate de profit al companiei, comparat cu o medie estimata a sectorului. Sub medie poate insemna companie ieftina relativ la profit; peste medie, asteptari ridicate din partea pietei. Media pe sector e o valoare de referinta statica, nu una masurata live.",
      en: "How much you pay per unit of the company's profit, compared to an estimated sector average. Below average may mean the company is cheap relative to earnings; above average, high market expectations. The sector average is a static reference value, not measured live.",
    },
  },
  {
    roKey: "eps",
    enKey: "eps",
    term: { ro: "EPS (Earnings Per Share)", en: "EPS (Earnings Per Share)" },
    category: "calitativ",
    definition: {
      ro: "Profitul net al companiei impartit la numarul de actiuni. Cat profit produce fiecare actiune.",
      en: "The company's net profit divided by the number of shares. How much profit each share generates.",
    },
  },
  {
    roKey: "Debt/Equity (%)",
    enKey: "Debt/Equity (%)",
    term: { ro: "Debt/Equity", en: "Debt/Equity" },
    category: "calitativ",
    definition: {
      ro: "Cat datoreaza compania comparativ cu capitalul propriu al actionarilor, exprimat in procente. Valoare mare = grad de indatorare ridicat = risc financiar mai mare.",
      en: "How much the company owes compared to shareholders' equity, expressed as a percentage. A high value = high leverage = greater financial risk.",
    },
  },
  {
    roKey: "Profit margin (%)",
    enKey: "Profit margin (%)",
    term: { ro: "Profit Margin", en: "Profit Margin" },
    category: "calitativ",
    definition: {
      ro: "Ce procent din venituri ramane profit net dupa toate cheltuielile, comparat cu o medie estimata a sectorului. Peste medie = companie eficienta. Media pe sector e o valoare de referinta statica, nu una masurata live.",
      en: "What percentage of revenue remains as net profit after all expenses, compared to an estimated sector average. Above average = an efficient company. The sector average is a static reference value, not measured live.",
    },
  },
  {
    roKey: "Gross Margin vs Industrie (%)",
    enKey: "Gross Margin vs Industry (%)",
    term: { ro: "Gross Margin vs Industrie", en: "Gross Margin vs Industry" },
    category: "calitativ",
    definition: {
      ro: "Ce procent din venituri ramane dupa costul bunurilor vandute (COGS), comparat cu o medie estimata a sectorului companiei. Marja peste medie poate indica avantaj competitiv sau putere de pricing; sub medie, marje mai subtiri decat concurenta. Media pe sector e o valoare de referinta statica, nu una masurata live.",
      en: "What percentage of revenue remains after the cost of goods sold (COGS), compared to an estimated average for the company's sector. Above average may indicate a competitive advantage or pricing power; below average, thinner margins than competitors. The sector average is a static reference value, not measured live.",
    },
  },
  {
    roKey: "ROE (%)",
    enKey: "ROE (%)",
    term: { ro: "ROE (Return on Equity)", en: "ROE (Return on Equity)" },
    category: "calitativ",
    definition: {
      ro: "Cat profit genereaza compania pentru fiecare unitate investita de actionari, exprimat in procente, comparat cu o medie estimata a sectorului. Peste medie = folosire eficienta a capitalului. Media pe sector e o valoare de referinta statica, nu una masurata live.",
      en: "How much profit the company generates per unit invested by shareholders, as a percentage, compared to an estimated sector average. Above average = efficient use of capital. The sector average is a static reference value, not measured live.",
    },
  },
  {
    roKey: "Dividend yield (%)",
    enKey: "Dividend yield (%)",
    term: { ro: "Dividend Yield", en: "Dividend Yield" },
    category: "calitativ",
    definition: {
      ro: "Ce procent din pretul actiunii primesti anual sub forma de dividende. Relevant pentru investitori orientati spre venit pasiv.",
      en: "What percentage of the share price you receive annually as dividends. Relevant for income-oriented investors.",
    },
  },
  {
    roKey: "marketCap",
    enKey: "marketCap",
    term: { ro: "Market Cap", en: "Market Cap" },
    category: "calitativ",
    definition: {
      ro: "Valoarea totala a companiei pe bursa (pret per actiune x numar de actiuni). Indica marimea companiei.",
      en: "The company's total market value (price per share x number of shares). Indicates company size.",
    },
  },
  {
    roKey: "FCF (mil.)",
    enKey: "FCF (mil.)",
    term: { ro: "FCF (Free Cash Flow)", en: "FCF (Free Cash Flow)" },
    category: "calitativ",
    definition: {
      ro: "Cash-ul ramas dupa ce compania isi acopera investitiile de capital (capex). FCF pozitiv = genereaza mai mult cash decat cheltuieste - poate finanta dividende sau reducerea datoriei fara finantare externa.",
      en: "The cash left after the company covers its capital investments (capex). Positive FCF = it generates more cash than it spends - it can fund dividends or debt reduction without external financing.",
    },
  },
  {
    roKey: "WACC (%)",
    enKey: "WACC (%)",
    term: { ro: "WACC (Cost Mediu Ponderat al Capitalului)", en: "WACC (Weighted Average Cost of Capital)" },
    category: "calitativ",
    definition: {
      ro: "Costul mediu (ponderat intre capital propriu si datorie) pe care compania trebuie sa il acopere prin randamente. Estimat cu ipoteze simplificate (rata fara risc ~4.5%, prima de risc a pietei ~5%). Comparat cu ROE: daca ROE > WACC, compania creeaza valoare peste costul capitalului.",
      en: "The average cost (weighted between equity and debt) the company must cover through returns. Estimated with simplified assumptions (risk-free rate ~4.5%, market risk premium ~5%). Compared to ROE: if ROE > WACC, the company creates value above its cost of capital.",
    },
  },
];

export function glossaryDefinition(key: string, lang: Lang): string {
  const entry = GLOSSARY.find((g) => g.roKey === key || g.enKey === key);
  return entry ? entry.definition[lang] : "";
}
