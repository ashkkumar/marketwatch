from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data import get_watchlist, get_price_bars, get_latest_quote
from anomaly import get_anomaly_summary, detect_price_anomalies, detect_volume_anomalies

app = FastAPI(title="MarketPulse API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
@app.get("/")
async def home():
    return {"message": "Hello World"}

@app.get("/watchlist")
async def get_watchlist():
    return get_watchlist()

@app.get("/quotes")
async def get_quotes():
    try:
        return get_latest_quote()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/bars/{symbol}")
async def get_bars(symbol: str, days: int = 30):
    try:
        return get_price_bars(symbol, days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/anomalies/{symbol}")
async def get_anomalies(symbol: str, days: int = 30):

    try:
        bars = get_price_bars(symbol, days)
        bars = detect_volume_anomalies(bars)
        bars = detect_price_anomalies(bars)
        summary = get_anomaly_summary(bars)
        return {
            "symbol": symbol,
            "bars": bars,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))