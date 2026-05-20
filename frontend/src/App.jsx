import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {useState, useEffect} from "react";
import CandlestickChart from "./components/CandlestickChart.jsx";
import TickerTape from "./components/TickerTape.jsx";

const API = "http://localhost:8000"

function App() {
    const [symbol, setSymbol] = useState("NVDA");
    const [watchlist, setWatchlist] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetch watchlist once on mount
    useEffect(() => {
        fetch(`${API}/watchlist`)
            .then(res => res.json())
            .then(tickers => setWatchlist(tickers))
            .catch(err => console.error("Watchlist fetch failed:", err));
    }, []);

    // fetch anomaly data whenever symbol changes

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${API}/anomalies/${symbol}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [symbol]);

  return (
      <div className="app">

          {/* header */}
          <header className="header">
              <div className="logo">
                  <span className="logo-mark">▲</span>
                  <span className="logo-text">Market
                      <span></span>
                  </span>
              </div>
              <div className="watchlist-tabs">
                  {watchlist.map(ticker => (
                      <button
                        key={ticker}
                        className={`tab ${ticker === symbol ? "tab-active" : ""}`}
                        onClick={() => setSymbol(ticker)}
                      >
                          {ticker}
                      </button>
                  ))}
              </div>
              <div className="header-right">
                  <span className="live-badge">
                  <span className="live-dot" />
                      LIVE
                  </span>
              </div>
          </header>

          <TickerTape />

        {/* stats bar */}
          {data && (
              <div className="stats-bar">
                  <div className="stat">
                      <span className="stat-label">SYMBOL</span>
                      <span className="stat-value">{data.symbol}</span>
                  </div>
                  <div className="stat">
                      <span className="stat-label">BARS ANALYZED</span>
                      <span className="stat-value">{data.summary.total_bars}</span>
                  </div>
                  <div className="stat">
                      <span className="stat-label">VOLUME ANOMALIES</span>
                      <span className="stat-value">{data.summary.count_volume_anomalies}</span>
                  </div>
                  <div className="stat">
                      <span className="stat-label">PRICE ANOMALIES</span>
                      <span className="stat-value">{data.summary.count_price_anomalies}</span>
                  </div>
                  <div className="stat">
                      <span className="stat-label">PEAK ANOMALY DATE</span>
                      <span className="stat-value">
                          {data.summary.peak_anomaly?.timestamp?.slice(0, 10)}</span>
                  </div>
                  <div className="stat">
                      <span className="stat-label">PEAK SCORE</span>
                      <span className="stat-value">
                          {data.summary.peak_anomaly?.score}</span>
                  </div>
              </div>
          )}

          {/* main content */}
          <div className="main">
              <div className="chart-area">
                  {loading && <div className="loading">Fetching market data...</div>}
                  {error && <div className="error">Error: {error}</div>}
                  {data && <CandlestickChart bars={data.bars} symbol={symbol} />}
              </div>
              <div className="alert-panel">
                  <h3 className="panel-title">ANOMALY ALERTS</h3>
                  {data && data.bars
                      .filter(bar => bar.volume_anomaly || bar.price_anomaly)
                      .map(bar => (
                          <div key={bar.timestamp} className="alert-item">
                              <span className="alert-date">{bar.timestamp.slice(0, 10)}</span>
                              <span className="alert-close">${bar.close}</span>
                              <div className="alert-tags">
                                  {data.bars.volume_anomaly && <span className="tag tag-volume">VOL</span>}
                                  {data.bars.price_anomaly && <span className="tag tag-price">PRICE</span>}
                              </div>
                              <span className="alert-score">{bar.anomaly_score}</span>
                          </div>
                      ))
                  }
              </div>
          </div>

      </div>

  );
}

export default App
