import { useEffect, useRef } from "react";
import {CandlestickSeries, createChart, createSeriesMarkers, HistogramSeries} from "lightweight-charts";

function CandlestickChart({ bars, symbol }) {
  const chartContainer = useRef(null);

  useEffect(() => {
    if (!bars || bars.length === 0) return;

    // Step 1 — create the chart
    const chart = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0d1117" },
        textColor: "#8b949e",
      },
      grid: {
        vertLines: { color: "#21262d" },
        horzLines: { color: "#21262d" },
      },
      timeScale: {
        borderColor: "#21262d",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#21262d",
      },
    });

    // Step 2 — add a candlestick series
    const series = chart.addSeries(CandlestickSeries,{
      upColor: "#00ff9d",
      downColor: "#ff4757",
      borderUpColor: "#00ff9d",
      borderDownColor: "#ff4757",
      wickUpColor: "#00ff9d",
      wickDownColor: "#ff4757",
    });

    // Step 3 — format and set the data
    const formatted = bars.map(bar => ({
      time: bar.timestamp.slice(0, 10),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    series.setData(formatted);

    // Step 4 — fit all bars into view
      // Step 4 — add anomaly markers
    const markers = [];

    bars.forEach(bar => {
      if (bar.volume_anomaly) {
        markers.push({
          time: bar.timestamp.slice(0, 10),
          position: "aboveBar",
          color: "#ff4757",
          shape: "arrowDown",
          text: "VOL"
        });
      }
      if (bar.price_anomaly) {
        markers.push({
          time: bar.timestamp.slice(0, 10),
          position: "aboveBar",
          color: "#58a6ff",
          shape: "arrowDown",
          text: "PRICE"
        });
      }
    });

    if (markers.length > 0) {
      createSeriesMarkers(series, markers);
    }

    // Step 5 — add volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const volumeData = bars.map(bar => ({
      time: bar.timestamp.slice(0, 10),
      value: bar.volume,
      color: bar.volume_anomaly ? "#ff4757" : bar.close >= bar.open ? "#00ff9d33" : "#ff475733",
    }));

volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    // Step 5 — cleanup when component unmounts
    return () => {
      chart.remove();
    };

  }, [bars]);

  return (
    <div style={{ width: "100%" }}>
      <div
        ref={chartContainer}
        style={{ width: "100%", height: "400px" }}
      />
    </div>
  );
}

export default CandlestickChart;