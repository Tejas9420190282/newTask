
// TradingChart.jsx

import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const TradingChart = () => {
  const chartContainer = useRef(null);
  const chart = useRef(null);
  const candleSeries = useRef(null);

  const [rawData, setRawData] = useState([]);
  const [timeframe, setTimeframe] = useState("5m");
  const [price, setPrice] = useState(null);

  // 🔹 1️⃣ Create Chart
  useEffect(() => {
    chart.current = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      timeScale: {
        timeVisible: true, // 🔥 THIS LINE FIXES IT
        secondsVisible: false,
      },
    });

    candleSeries.current = chart.current.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    window.addEventListener("resize", () => {
      chart.current.applyOptions({
        width: chartContainer.current.clientWidth,
      });
    });

    return () => chart.current.remove();
  }, []);

  // 🔹 2️⃣ Fetch Data
  useEffect(() => {
    fetch("/csvjson.json")
      .then((res) => res.json())
      .then((data) => setRawData(data));
  }, []);

  // 🔹 3️⃣ Update Chart on Timeframe Change
   
    useEffect(() => {
    if (!rawData.length) return;

    let processed = [];

    if (timeframe === "5m") processed = rawData;
    if (timeframe === "15m") processed = groupCandles(rawData, 3);
    if (timeframe === "1h") processed = groupCandles(rawData, 12);

    const formatted = processed.map((item) => {
      const dateTime =
        item["<DATE>"].replace(/\./g, "-") + "T" + item["<TIME>"];

      return {
        time: Math.floor(new Date(dateTime).getTime() / 1000),
        open: item["<OPEN>"],
        high: item["<HIGH>"],
        low: item["<LOW>"],
        close: item["<CLOSE>"],
      };
    });

    candleSeries.current.setData(formatted);

    const last = formatted[formatted.length - 1];
    setPrice(last.close);
  }, [timeframe, rawData]);

  // 🔹 4️⃣ Group Candles Function
  /* function groupCandles(data, size) {
    const result = [];

    for (let i = 0; i < data.length; i += size) {
      const group = data.slice(i, i + size);

      const first = group[0];
      const last = group[group.length - 1];

      const high = Math.max(...group.map((c) => c["<HIGH>"]));
      const low = Math.min(...group.map((c) => c["<LOW>"]));

      result.push({
        "<DATE>": first["<DATE>"],
        "<TIME>": first["<TIME>"],
        "<OPEN>": first["<OPEN>"],
        "<HIGH>": high,
        "<LOW>": low,
        "<CLOSE>": last["<CLOSE>"],
      });
    }

    return result;
  } */

    function groupCandles(data, size) {
  const result = [];

  for (let i = 0; i < data.length; i += size) {
    const group = data.slice(i, i + size);

    if (group.length < size) break; // important

    const first = group[0];
    const last = group[group.length - 1];

    result.push({
      "<DATE>": first["<DATE>"],
      "<TIME>": first["<TIME>"],
      "<OPEN>": first["<OPEN>"],
      "<HIGH>": Math.max(...group.map(c => c["<HIGH>"])),
      "<LOW>": Math.min(...group.map(c => c["<LOW>"])),
      "<CLOSE>": last["<CLOSE>"],
    });
  }

  return result;
}

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">XAUUSD</h1>
          <p className="text-slate-400 text-sm">Gold vs US Dollar</p>
        </div>

        <div className="text-3xl font-bold text-green-400">
          {price ? price : "Loading..."}
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="flex gap-4 mb-6">
        {["5m", "15m", "1h"].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              timeframe === tf
                ? "bg-blue-600 shadow-lg shadow-blue-600/40"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/*  Chart Card  */}
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4">
        <div ref={chartContainer}></div>
      </div>
    </div>
  );
};

export default TradingChart;
 
 
