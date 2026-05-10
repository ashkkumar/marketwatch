# This class is responsible for communicating with the Alpaca API and returns
# clean structured market data that the app uses. Primarily used to fetch 
# live quotes, fetching historial price bars and getting a list of tickers

import os
from dotenv import load_dotenv
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.live import StockDataStream
from alpaca.data.requests import StockLatestQuoteRequest, StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from datetime import datetime, timedelta
import pandas as pd

"""
this function reads .env file and makes the API keys avaialble as environment variables
Your keys never appear in your code and is the correct way to handle credentials
"""
load_dotenv()

# Watchlist
WATCHLIST = ["AAPL", "NVDA", "MSFT","GOOGL", "AMZN", "BBAI", "META", "JPM"]

# Initialize the alpaca client using .env keys
"""
StockHistoricalDataClient is Alpaca's client for fetching market data. You inialize it
once at module level so its reused across requests rather than recreated every time
"""
client = StockHistoricalDataClient(
    api_key = os.getenv("ALPACA_API_KEY"),
    secret_key = os.getenv("ALPACA_SECRET_KEY")
    )

"""
this fucntion fetches the current best bid and ask price for every ticket simulatenously
in one API call, the mid price is the average of the bid and ask rounded to 2 decimals.
This is a common way to estimate the "true" price
"""
def get_latest_quote() ->list[dict]:
    """
    Fetch the latest bid/ask quote for every ticker in the watchlist/
    Returns a clean list of dicts ready to be served by the API
    """
    request = StockLatestQuoteRequest(symbol_or_symbols=WATCHLIST)
    quotes = client.get_stock_latest_quote(request)

    result = []
    for symbol, quote in quotes.items():
        result.append({
            "symbol": symbol,
            "ask_price": float(quote.ask_price),
            "bid_price": float(quote.bid_price),
            "mid_price": round((float(quote.ask_price) + float(quote.bid_price)) / 2, 2),
            "timestamp": quote.timestamp.isoformat()
            })
        
    return result

"""
this function fetches daily candlestick data -- open, high, low, close, volume for a single
ticket. The days parameter defaults to 30 but we can pass any value. Alpaca returns a pandas
Dataframe with a MultiIndex so we reset it to get a clean structure to work with
"""
def get_price_bars(symbol: str, days: int = 30) -> list[dict]:
    """
    Fetch daily OHLCV bars for a given symbol over the last N days
    This is what feeds the candlesticks chart on the frontend
    """
    start = datetime.now() - timedelta(days=days)

    request = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe = TimeFrame.Day,
        start=start
        )

    bars =  client.get_stock_bars(request)
    df = bars.df

    # Alpaca returns a MultiIndex dataframe, resetting it for a clean structure
    if isinstance(df.index, pd.MultiIndex):
        df = df.reset_index(level=0, drop=True)

    result = []
    for timestamp, row in df.iterrows():
        result.append({
            "timestamp": timestamp.isoformat(),
            "open": round(float(row["open"]), 2),
            "high": round(float(row["high"]), 2),
            "low": round(float(row["low"]), 2),
            "close": round(float(row["close"]), 2),
            "volume": int(row["volume"])
            })

    return result

def get_watchlist() -> list[str]:
    """
    Returns the current watchlist, ,keepign this fucntion
    allows us to make it dynamic later
    """
    return WATCHLIST
    
