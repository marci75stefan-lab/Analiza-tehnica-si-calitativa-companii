export type Lang = "ro" | "en";

export const LANGS: Lang[] = ["ro", "en"];

type Vars = Record<string, string | number>;

const DICT = {
  appTitle: {
    ro: "Analiza Tehnica si Calitativa a Companiilor Listate la Bursa",
    en: "Technical and Qualitative Analysis of Listed Companies",
  },
  appSubtitle: {
    ro: "Proiect educational. Semnalele generate nu constituie recomandare de investitii.",
    en: "Educational project. Generated signals do not constitute investment advice.",
  },
  dataSource: { ro: "Sursa datelor: Yahoo Finance.", en: "Data source: Yahoo Finance." },
  searchPlaceholder: {
    ro: "Cauta dupa numele companiei (ex: Apple, Banca Transilvania)",
    en: "Search by company name (e.g. Apple, Bank of America)",
  },
  searchHint: {
    ro: "Nu stii simbolul bursier (ticker)? Cauta compania dupa nume mai sus.",
    en: "Don't know the ticker symbol? Search the company by name above.",
  },
  tickerPlaceholder: {
    ro: "ex: AAPL, SNP.RO, TLV.RO (max {max})",
    en: "e.g. AAPL, SNP.RO, TLV.RO (max {max})",
  },
  analyze: { ro: "Analizeaza", en: "Analyze" },
  loading: { ro: "Se incarca...", en: "Loading..." },
  periodLabel: { ro: "Perioada:", en: "Period:" },
  period6mo: { ro: "6 luni", en: "6mo" },
  periodYtd: { ro: "YTD", en: "YTD" },
  period1y: { ro: "1 an", en: "1y" },
  period2y: { ro: "2 ani", en: "2y" },
  period5y: { ro: "5 ani", en: "5y" },
  exportCsv: { ro: "Export CSV", en: "Export CSV" },
  exportPdf: { ro: "Export PDF", en: "Export PDF" },
  watchlistTitle: { ro: "Watchlist", en: "Watchlist" },
  watchlistEmpty: {
    ro: "Watchlist gol. Adauga un ticker din rezultatele analizei.",
    en: "Watchlist is empty. Add a ticker from the analysis results.",
  },
  inWatchlist: { ro: "In watchlist", en: "In watchlist" },
  addWatchlist: { ro: "+ Watchlist", en: "+ Watchlist" },
  removeFromWatchlistAria: { ro: "Sterge {ticker} din watchlist", en: "Remove {ticker} from watchlist" },
  historyTitle: { ro: "Istoric analize", en: "Analysis history" },
  clearHistory: { ro: "Sterge istoric", en: "Clear history" },
  historyEmpty: { ro: "Nicio analiza salvata inca.", en: "No analysis saved yet." },
  glossaryTitle: { ro: "Glosar de termeni", en: "Glossary of terms" },
  glossaryTechnical: { ro: "Analiza tehnica", en: "Technical analysis" },
  glossaryQualitative: { ro: "Analiza calitativa", en: "Qualitative analysis" },
  importantTitle: { ro: "Important!", en: "Important!" },
  importantSubtitle: {
    ro: "Ce sa NU faci cu banii la bursa",
    en: "What NOT to do with your money in the market",
  },
  technicalSignalTitle: { ro: "Semnal tehnic", en: "Technical signal" },
  qualitativeAnalysisTitle: { ro: "Analiza calitativa", en: "Qualitative analysis" },
  scoreLabel: { ro: "Scor:", en: "Score:" },
  scoreInterval: { ro: "(interval -8..+8)", en: "(range -8..+8)" },
  trendLabel: { ro: "/ trend de fond:", en: "/ underlying trend:" },
  emaCrossLabel: { ro: "EMA cross (9/21):", en: "EMA cross (9/21):" },
  rsiLabel: { ro: "RSI(14):", en: "RSI(14):" },
  rsiValueSuffix: { ro: "(valoare: {value})", en: "(value: {value})" },
  macdLabel: { ro: "MACD:", en: "MACD:" },
  bollingerLabel: { ro: "Bollinger Bands:", en: "Bollinger Bands:" },
  previousCloseLabel: { ro: "Inchidere anterioara:", en: "Previous close:" },
  openLabel: { ro: "Deschidere:", en: "Open:" },
  dayRangeLabel: { ro: "Interval zilnic:", en: "Day's range:" },
  week52RangeLabel: { ro: "Interval 52 saptamani:", en: "52 week range:" },
  peLabel: { ro: "P/E:", en: "P/E:" },
  epsLabel: { ro: "EPS:", en: "EPS:" },
  dteLabel: { ro: "Debt/Equity:", en: "Debt/Equity:" },
  roeLabel: { ro: "ROE:", en: "ROE:" },
  todaySuffix: { ro: "azi", en: "today" },
  dataUnavailable: { ro: "Date indisponibile.", en: "Data unavailable." },
  unknownError: { ro: "Eroare necunoscuta", en: "Unknown error" },
  serverError: {
    ro: "Serverul de analiza nu a raspuns corect (posibil oprit sau indisponibil momentan). Incearca din nou.",
    en: "The analysis server did not respond correctly (it may be down or temporarily unavailable). Try again.",
  },
  tableTicker: { ro: "Ticker", en: "Ticker" },
  tablePrice: { ro: "Pret", en: "Price" },
  tableTechScore: { ro: "Scor tehnic", en: "Technical score" },
  tableRecommendation: { ro: "Recomandare", en: "Recommendation" },
  tablePE: { ro: "P/E", en: "P/E" },
  tableVerdict: { ro: "Verdict calitativ", en: "Qualitative verdict" },
  searchingLabel: { ro: "Se cauta...", en: "Searching..." },
  noResultsLabel: { ro: "Niciun rezultat.", en: "No results." },
  priceChartPrice: { ro: "Pret", en: "Price" },
  tooltipAria: { ro: "Detalii termen", en: "Term details" },
  csvHeaderTicker: { ro: "Ticker", en: "Ticker" },
  csvHeaderCompany: { ro: "Companie", en: "Company" },
  csvHeaderPrice: { ro: "Pret curent", en: "Current price" },
  csvHeaderCurrency: { ro: "Moneda", en: "Currency" },
  csvHeaderTechScore: { ro: "Scor tehnic", en: "Technical score" },
  csvHeaderTrend: { ro: "Trend", en: "Trend" },
  csvHeaderRecommendation: { ro: "Recomandare", en: "Recommendation" },
  csvHeaderPE: { ro: "P/E", en: "P/E" },
  csvHeaderEPS: { ro: "EPS", en: "EPS" },
  csvHeaderDTE: { ro: "Debt/Equity", en: "Debt/Equity" },
  csvHeaderMargin: { ro: "Profit Margin", en: "Profit Margin" },
  csvHeaderROE: { ro: "ROE", en: "ROE" },
  csvHeaderDividend: { ro: "Dividend Yield", en: "Dividend Yield" },
  csvHeaderVerdict: { ro: "Verdict calitativ", en: "Qualitative verdict" },
  pdfPriceCurrent: { ro: "Pret curent:", en: "Current price:" },
  pdfTechnicalSignal: { ro: "Semnal tehnic:", en: "Technical signal:" },
  pdfScoreTrend: { ro: "(scor {score}, trend {trend})", en: "(score {score}, trend {trend})" },
  pdfVerdict: { ro: "Verdict calitativ:", en: "Qualitative verdict:" },
  financialWarning1: {
    ro: "Nu investi la bursa daca nu ai deja un fond de siguranta/urgenta (3-6 luni de cheltuieli) pus separat, in afara investitiilor.",
    en: "Don't invest in the market unless you already have a separate emergency fund (3-6 months of expenses) set aside outside your investments.",
  },
  financialWarning2: {
    ro: "Nu investi decat bani pe care iti poti permite sa ii pierzi in totalitate - nu banii de care ai nevoie in curand.",
    en: "Only invest money you can afford to lose entirely - not money you'll need soon.",
  },
  financialWarning3: {
    ro: "Nu investi cu bani imprumutati sau pe datorie (credite, cardul de credit).",
    en: "Don't invest with borrowed money or debt (loans, credit cards).",
  },
  financialWarning4: {
    ro: "Nu pune toti banii intr-o singura companie sau intr-un singur sector - diversifica.",
    en: "Don't put all your money into a single company or sector - diversify.",
  },
  financialWarning5: {
    ro: "Nu lua decizii de investitie pe baza de frica, lacomie sau FOMO (teama de a rata o ocazie).",
    en: "Don't make investment decisions based on fear, greed, or FOMO (fear of missing out).",
  },
  financialWarning6: {
    ro: 'Nu urma "sfaturi" de pe retele sociale sau de la persoane fara verificare proprie a informatiei.',
    en: 'Don\'t follow "tips" from social media or other people without verifying the information yourself.',
  },
  financialWarning7: {
    ro: "Nu ignora orizontul de timp - bursa e potrivita pentru bani de care nu ai nevoie pe termen scurt (ideal 5+ ani).",
    en: "Don't ignore your time horizon - the market suits money you won't need short-term (ideally 5+ years).",
  },
  financialWarning8: {
    ro: "Nu confunda semnalele algoritmice din aceasta aplicatie cu recomandari de investitii reale - sunt generate educational, fara garantii.",
    en: "Don't confuse this app's algorithmic signals with real investment advice - they're generated for education, with no guarantees.",
  },
} satisfies Record<string, Record<Lang, string>>;

export type DictKey = keyof typeof DICT;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

export function t(lang: Lang, key: DictKey, vars?: Vars): string {
  return interpolate(DICT[key][lang], vars);
}

export function localeFor(lang: Lang): string {
  return lang === "en" ? "en-US" : "ro-RO";
}
