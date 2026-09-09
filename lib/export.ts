import jsPDF from "jspdf";
import { isCompleteAnalysis, type AnalyzeResponse } from "./types";
import { t, localeFor, type Lang } from "./i18n";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportToCsv(response: AnalyzeResponse, lang: Lang = "ro"): void {
  const headers = [
    t(lang, "csvHeaderTicker"),
    t(lang, "csvHeaderCompany"),
    t(lang, "csvHeaderPrice"),
    t(lang, "csvHeaderCurrency"),
    t(lang, "csvHeaderTechScore"),
    t(lang, "csvHeaderTrend"),
    t(lang, "csvHeaderRecommendation"),
    t(lang, "csvHeaderPE"),
    t(lang, "csvHeaderEPS"),
    t(lang, "csvHeaderDTE"),
    t(lang, "csvHeaderMargin"),
    t(lang, "csvHeaderROE"),
    t(lang, "csvHeaderDividend"),
    t(lang, "csvHeaderVerdict"),
  ];

  const rows = response.results.filter(isCompleteAnalysis).map((r) => [
    r.ticker,
    r.companyName,
    r.price.current,
    r.currency,
    r.technical.score,
    r.technical.trend,
    r.technical.recommendation,
    r.fundamentals.trailingPE,
    r.fundamentals.trailingEps,
    r.fundamentals.debtToEquity,
    r.fundamentals.profitMargins,
    r.fundamentals.returnOnEquity,
    r.fundamentals.dividendYield,
    r.qualitative.verdict,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `analiza-${dateStamp()}.csv`);
}

export function exportToPdf(response: AnalyzeResponse, lang: Lang = "ro"): void {
  const doc = new jsPDF();
  const marginX = 14;
  const pageBottom = 275;
  let y = 15;

  doc.setFontSize(14);
  doc.text(t(lang, "appTitle"), marginX, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleString(localeFor(lang)), marginX, y);
  doc.setTextColor(0);
  y += 10;

  for (const r of response.results.filter(isCompleteAnalysis)) {
    if (y > pageBottom - 30) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(12);
    doc.text(`${r.companyName} (${r.ticker})`, marginX, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`${t(lang, "pdfPriceCurrent")} ${r.price.current} ${r.currency}`, marginX, y);
    y += 5;
    doc.text(
      `${t(lang, "pdfTechnicalSignal")} ${r.technical.recommendation} ${t(lang, "pdfScoreTrend", {
        score: r.technical.score,
        trend: r.technical.trend,
      })}`,
      marginX,
      y
    );
    y += 5;
    doc.text(
      doc.splitTextToSize(`${t(lang, "pdfVerdict")} ${r.qualitative.verdict}`, 180),
      marginX,
      y
    );
    y += 5;
    doc.text(
      `P/E: ${r.fundamentals.trailingPE ?? "N/A"}  EPS: ${r.fundamentals.trailingEps ?? "N/A"}  Debt/Equity: ${r.fundamentals.debtToEquity ?? "N/A"}`,
      marginX,
      y
    );
    y += 9;
  }

  if (y > pageBottom - 20) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(doc.splitTextToSize(response.disclaimer, 180), marginX, y);

  doc.save(`analiza-${dateStamp()}.pdf`);
}
