import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {useState, useEffect} from "react";

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
      <div>
        <h1>MarketWatch - {symbol}</h1>

          {/* ticker selector */}
        <div>
            {watchlist.map(ticker => (
                <button
                    key={ticker}
                    onClick={() => setSymbol(ticker)}
                >
                    {ticker}
                </button>
            ))}
        </div>
          {/*data display*/}
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {data && (
              <div>
                  <p>Total Bars: {data.summary.total_bars}</p>
                  <p>Volume anomalies: {data.summary.count_volume_anomalies}</p>
                  <p>Price anomalies: {data.summary.count_price_anomalies}</p>
              </div>
          )}

      </div>

  );
}

export default App
