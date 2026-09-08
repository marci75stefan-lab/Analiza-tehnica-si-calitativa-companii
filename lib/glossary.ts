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
      "Cat platesti pe fiecare unitate de profit al companiei. Valoare mica poate insemna companie ieftina relativ la profit; valoare mare, asteptari ridicate din partea pietei.",
  },
  {
    key: "eps",
    term: "EPS (Earnings Per Share)",
    category: "calitativ",
    definition: "Profitul net al companiei impartit la numarul de actiuni. Cat profit produce fiecare actiune.",
  },
  {
    key: "Debt/Equity",
    term: "Debt/Equity",
    category: "calitativ",
    definition:
      "Cat datoreaza compania comparativ cu capitalul propriu al actionarilor. Valoare mare = grad de indatorare ridicat = risc financiar mai mare.",
  },
  {
    key: "Profit margin",
    term: "Profit Margin",
    category: "calitativ",
    definition:
      "Ce procent din venituri ramane profit net dupa toate cheltuielile. Marja mare = companie eficienta.",
  },
  {
    key: "ROE",
    term: "ROE (Return on Equity)",
    category: "calitativ",
    definition:
      "Cat profit genereaza compania pentru fiecare unitate investita de actionari. ROE mare = folosire eficienta a capitalului.",
  },
  {
    key: "Dividend yield",
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
];

export function glossaryDefinition(key: string): string {
  return GLOSSARY.find((g) => g.key === key)?.definition ?? "";
}
