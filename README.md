# Market Watcher — Live Market Intelligence Dashboard

## What it does
Real-time market dashboard that ingests live stock data from Alpaca 
Markets and automatically detects anomalous price and volume behavior 
using statistical and ML-based methods. Anomalies are visualized 
directly on an interactive candlestick chart.

## Anomaly Detection
- **Volume anomalies** — Z-score analysis flags days where volume 
  exceeds 2 standard deviations above the 90-day mean
- **Price anomalies** — Isolation Forest ML algorithm detects unusual 
  OHLC price patterns compared to recent history

## Tech Stack
**Backend:** Python, FastAPI, Alpaca Markets API, scikit-learn, NumPy, pandas  
**Frontend:** React, Vite, TradingView Lightweight Charts  
**ML:** Isolation Forest (price anomalies), Z-score (volume anomalies)

## Setup
1. Clone the repo
2. Create `backend/.env`:
```
ALPACA_API_KEY=your_key_here
ALPACA_SECRET_KEY=your_secret_here
```
3. Install backend dependencies:
```
bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
4. Install frontend dependencies:
```
bash
cd frontend
npm install
npm run dev
```
5. Open http://localhost:5173

## Architecture

```
Alpaca API → data.py → anomaly.py → FastAPI → React Dashboard
```
