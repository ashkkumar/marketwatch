import { useState, useEffect } from "react";

const API = "http://localhost:8000";

function TickerTape() {
  const [quotes, setQuotes] = useState([]);

  const fetchQuotes = () => {
    fetch(`${API}/quotes`)
      .then(res => res.json())
      .then(data => {
        // Filter out quotes with missing ask price
        const valid = data.filter(q => q.ask_price > 0);
        setQuotes(valid);
      })
      .catch(err => console.error("Quotes fetch failed:", err));
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchQuotes();

    // Then refresh every 30 seconds
    const interval = setInterval(fetchQuotes, 30000);

    // Cleanup — stop the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  if (quotes.length === 0) return null;

  // Duplicate the list so the scroll loops seamlessly
  const items = [...quotes, ...quotes];

  return (
    <div className="ticker-tape">
      <div className="ticker-scroll">
        {items.map((quote, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-symbol">{quote.symbol}</span>
            <span className="ticker-price">${quote.mid_price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TickerTape;