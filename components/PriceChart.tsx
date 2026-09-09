"use client";

import { useEffect, useRef, useState } from "react";
import { ColorType, createChart, type IChartApi } from "lightweight-charts";
import type { PriceHistoryPoint } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";

type Mode = "price" | "percent";

export default function PriceChart({ data }: { data: PriceHistoryPoint[] }) {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [mode, setMode] = useState<Mode>("price");

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#374151" },
      width: containerRef.current.clientWidth,
      height: 280,
      grid: { vertLines: { visible: false }, horzLines: { color: "#f3f4f6" } },
      timeScale: { borderColor: "#e5e7eb" },
      rightPriceScale: { borderColor: "#e5e7eb" },
    });
    chartRef.current = chart;

    if (mode === "price") {
      const series = chart.addCandlestickSeries({
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderVisible: false,
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      });
      series.setData(
        data.map((d) => ({ time: d.date, open: d.open, high: d.high, low: d.low, close: d.close }))
      );
    } else {
      const base = data[0]?.close;
      const series = chart.addLineSeries({
        color: "#2563eb",
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
  }, [data, mode]);

  return (
    <div>
      <div className="mb-1 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setMode("price")}
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            mode === "price" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {t("priceChartPrice")}
        </button>
        <button
          type="button"
          onClick={() => setMode("percent")}
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            mode === "percent" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          %
        </button>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
