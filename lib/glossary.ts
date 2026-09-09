export interface GlossaryTerm {
  key: string;
  term: string;
  category: "tehnic" | "calitativ";
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    key: "ema",
    term: "EMA (Exponential Moving Average)",
    category: "tehnic",
    definition:
      "Medie mobila care da mai multa greutate preturilor recente. Arata directia generala a pretului, fara zgomotul zilnic.",
  },
  {
    key: "emaCross",
    term: "EMA cross (9/21)",
    category: "tehnic",
    definition:
      "Cand o EMA rapida (9 zile) trece peste una lenta (21 zile) - semnal ca momentul recent e mai puternic decat cel de fond.",
  },
  {
    key: "rsi",
    term: "RSI (Relative Strength Index)",
    category: "tehnic",
    definition:
      "Numar intre 0 si 100. Sub 30 = vandut excesiv, posibil rebound. Peste 70 = cumparat excesiv, posibila corectie.",
  },
  {
    key: "macd",
    term: "MACD",
    category: "tehnic",
    definition:
      "Compara doua medii mobile exponentiale pentru a detecta schimbari de moment. Cand linia MACD trece peste linia signal, momentul devine pozitiv.",
  },
  {
    key: "bollinger",
    term: "Bollinger Bands",
    category: "tehnic",
    definition:
      "Benzi in jurul unei medii mobile, calculate cu volatilitatea recenta. Pret aproape de banda de jos = posibila subevaluare pe termen scurt; aproape de banda de sus = posibila supraevaluare.",
  },
  {
    key: "trend",
    term: "Trend de fond (bullish/bearish)",
    category: "tehnic",
    definition:
      "Directia generala a pretului pe termen lung (EMA50 vs EMA200). Semnalele scurte care contrazic trendul mare sunt retrogradate la Neutru/Prudenta.",
  },
  {
    key: "previousClose",
    term: "Inchidere anterioara",
    category: "tehnic",
    definition: "Pretul de inchidere din ultima zi de tranzactionare anterioara (Previous Close).",
  },
  {
    key: "open",
    term: "Deschidere",
    category: "tehnic",
    definition: "Pretul la care a inceput tranzactionarea in ziua curenta (Open).",
  },
  {
    key: "dayRange",
    term: "Interval zilnic (Day's Range)",
    category: "tehnic",
    definition: "Cel mai mic si cel mai mare pret la care s-a tranzactionat actiunea in ziua curenta.",
  },
  {
    key: "week52Range",
    term: "Interval 52 saptamani (52 Week Range)",
    category: "tehnic",
    definition:
      "Cel mai mic si cel mai mare pret de inchidere din ultimul an. Util pentru a vedea unde se situeaza pretul curent fata de extremele recente.",
  },
  {
    key: "YTD",
    term: "YTD (Year to Date)",
    category: "tehnic",
    definition:
      "De la inceputul anului calendaristic curent pana azi (ex. 1 ianuarie - azi). Util pentru a vedea performanta doar din acest an.",
  },
  {
    key: "score",
    term: "Scor tehnic",
    category: "tehnic",
    definition:
      "Suma celor 4 semnale (EMA cross, RSI, MACD, Bollinger), interval -8..+8. Cu cat e mai mare, cu atat semnalele sunt mai puternic pozitive.",
  },
  {
    key: "recommendation",
    term: "Recomandare",
    category: "tehnic",
    definition:
      "Traducerea scorului tehnic intr-un verdict text. Semnal algoritmic educational, nu recomandare de investitii reala.",
  },
  {
    key: "P/E",
    term: "P/E (Price/Earnings)",
    category: "calitativ",
    definition:
      "Cat platesti pe fiecare unitate de profit al companiei, comparat cu o medie estimata a sectorului. Sub medie poate insemna companie ieftina relativ la profit; peste medie, asteptari ridicate din partea pietei. Media pe sector e o valoare de referinta statica, nu una masurata live.",
  },
  {
    key: "eps",
    term: "EPS (Earnings Per Share)",
    category: "calitativ",
    definition: "Profitul net al companiei impartit la numarul de actiuni. Cat profit produce fiecare actiune.",
  },
  {
    key: "Debt/Equity (%)",
    term: "Debt/Equity",
    category: "calitativ",
    definition:
      "Cat datoreaza compania comparativ cu capitalul propriu al actionarilor, exprimat in procente. Valoare mare = grad de indatorare ridicat = risc financiar mai mare.",
  },
  {
    key: "Profit margin (%)",
    term: "Profit Margin",
    category: "calitativ",
    definition:
      "Ce procent din venituri ramane profit net dupa toate cheltuielile, comparat cu o medie estimata a sectorului. Peste medie = companie eficienta. Media pe sector e o valoare de referinta statica, nu una masurata live.",
  },
  {
    key: "Gross Margin vs Industrie (%)",
    term: "Gross Margin vs Industrie",
    category: "calitativ",
    definition:
      "Ce procent din venituri ramane dupa costul bunurilor vandute (COGS), comparat cu o medie estimata a sectorului companiei. Marja peste medie poate indica avantaj competitiv sau putere de pricing; sub medie, marje mai subtiri decat concurenta. Media pe sector e o valoare de referinta statica, nu una masurata live.",
  },
  {
    key: "ROE (%)",
    term: "ROE (Return on Equity)",
    category: "calitativ",
    definition:
      "Cat profit genereaza compania pentru fiecare unitate investita de actionari, exprimat in procente, comparat cu o medie estimata a sectorului. Peste medie = folosire eficienta a capitalului. Media pe sector e o valoare de referinta statica, nu una masurata live.",
  },
  {
    key: "Dividend yield (%)",
    term: "Dividend Yield",
    category: "calitativ",
    definition:
      "Ce procent din pretul actiunii primesti anual sub forma de dividende. Relevant pentru investitori orientati spre venit pasiv.",
  },
  {
    key: "marketCap",
    term: "Market Cap",
    category: "calitativ",
    definition: "Valoarea totala a companiei pe bursa (pret per actiune x numar de actiuni). Indica marimea companiei.",
  },
  {
    key: "FCF (mil.)",
    term: "FCF (Free Cash Flow)",
    category: "calitativ",
    definition:
      "Cash-ul ramas dupa ce compania isi acopera investitiile de capital (capex). FCF pozitiv = genereaza mai mult cash decat cheltuieste - poate finanta dividende sau reducerea datoriei fara finantare externa.",
  },
  {
    key: "WACC (%)",
    term: "WACC (Cost Mediu Ponderat al Capitalului)",
    category: "calitativ",
    definition:
      "Costul mediu (ponderat intre capital propriu si datorie) pe care compania trebuie sa il acopere prin randamente. Estimat cu ipoteze simplificate (rata fara risc ~4.5%, prima de risc a pietei ~5%). Comparat cu ROE: daca ROE > WACC, compania creeaza valoare peste costul capitalului.",
  },
];

export function glossaryDefinition(key: string): string {
  return GLOSSARY.find((g) => g.key === key)?.definition ?? "";
}
