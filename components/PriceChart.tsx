"use client";

import { useEffect, useRef, useState } from "react";
import { ColorType, createChart, type IChartApi } from "lightweight-charts";
import type { PriceHistoryPoint } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";

type Mode = "price" | "percent";

const CHART_COLORS = {
  light: { text: "#374151", grid: "#f3f4f6", border: "#e5e7eb", up: "#16a34a", down: "#dc2626", line: "#2563eb" },
  dark: { text: "#d1d5db", grid: "#1f2937", border: "#374151", up: "#22c55e", down: "#f43f5e", line: "#60a5fa" },
};

export default function PriceChart({ data }: { data: PriceHistoryPoint[] }) {
  const { t } = useLang();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [mode, setMode] = useState<Mode>("price");

  useEffect(() => {
    if (!containerRef.current) return;

    const colors = CHART_COLORS[theme];

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: colors.text },
      width: containerRef.current.clientWidth,
      height: 280,
      grid: { vertLines: { visible: false }, horzLines: { color: colors.grid } },
      timeScale: { borderColor: colors.border },
      rightPriceScale: { borderColor: colors.border },
    });
    chartRef.current = chart;

    if (mode === "price") {
      const series = chart.addCandlestickSeries({
        upColor: colors.up,
        downColor: colors.down,
        borderVisible: false,
        wickUpColor: colors.up,
        wickDownColor: colors.down,
      });
      series.setData(
        data.map((d) => ({ time: d.date, open: d.open, high: d.high, low: d.low, close: d.close }))
      );
    } else {
      const base = data[0]?.close;
      const series = chart.addLineSeries({
        color: colors.line,
        lineWidth: 2,
        priceFormat: { type: "percent", precision: 2, minMove: 0.01 },
      });
      series.setData(
        data.map((d) => ({
          time: d.date,
          value: base ? ((d.close - base) / base) * 100 : 0,
        }))
      );
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, mode, theme]);

  return (
    <div>
      <div className="mb-1 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setMode("price")}
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            mode === "price"
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {t("priceChartPrice")}
        </button>
        <button
          type="button"
          onClick={() => setMode("percent")}
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            mode === "percent"
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          %
        </button>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
