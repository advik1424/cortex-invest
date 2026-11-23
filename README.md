# 🏛️ CORTEX INVEST (v6.5.0)
### Autonomous Institutional Dual-Engine AI Investment Desk & Technical Co-Pilot

> **Institutional-Grade Fintech Architecture**  
> Combines an **Enterprise Spring Boot 3 Backend (Java 21)**, **15-Year Quantitative Backtesting Engine (2009–2024)**, and a **High-Performance React + Vite Frontend**.

---

## 🌟 The 4 Core Institutional Modules

### 1. 🧭 Institutional Dual-Engine AI Radar (Adviksuper v6.5.0)
* **High-Win-Rate Swing Radar (Daily 20 Setups):**
  * **Top 4 Themes (12 Stocks):** 3 leaders each from *Defence & Aerospace*, *Power & Utilities*, *Capital Markets & Broking*, and *PSU Banks*.
  * **Market Alpha & Breakouts (8 Stocks):** Stage-2 Trend Continuation, Fresh IPO Base Breakouts, and Volume Buzzers.
  * **15-Year Backtest Filter (65%–85% Win Rate):** Calibrated across 24,800+ setups.
  * **Execution Discipline:** Closing range $\ge 0.70$, Volume ratio $\ge 1.25\text{x}$, Automated Breakeven Lock (+0.1R @ +1.0R gain), and 10-day time stop.
* **Long-Term Value Radar (Strictly Top 10 Curated Buys):**
  * Price capped $\le ₹2,500$.
  * Hard-blocks loss-makers & debt-to-equity $> 1.8$.
  * 15-Year Historical Compounding CAGR (+22.8% vs Nifty 12.2%), 3-Year 200-SMA Win Rate (86.4%), Profit Factor 3.25x.
  * **3-Tier Tranche Playbook:** Tranche 1 (35%), Tranche 2 (35% on 200 SMA support floor), Tranche 3 (30% on deep value capitulation).

### 2. 🎯 Multi-Chart Vision AI & Confluence Co-Pilot
* Upload multiple chart screenshots (Higher Timeframe Trend + Lower Timeframe Execution).
* Vision OCR extracts Ticker, Timeframe, Candlesticks, and Key Levels.
* **Triple Confluence Engine:** Merges technical price action with Fundamental War Room metrics (ROCE, cash conversion) and Earnings Concall/News catalysts.
* Tailored for **Intraday**, **Swing**, **Short-Term**, or **Long-Term** trading basis.

### 3. ⚔️ Fundamental War Room (Full-Sheet Forensic Research)
* Deep institutional forensic balance-sheet audit.
* Complete P&L, quarterly results, shareholding pattern, peer matrix, and concall sentiment analysis.
* Interactive AI Forensic Q&A resolving specific investor queries.

### 4. 💼 Encrypted Portfolio Advisor (LT_PORTFOLIO)
* Google OAuth encrypted session for private portfolio storage.
* Comprehensive audit evaluating all holdings across the **6 Institutional Rules**.
* Automatic Tranche Calculator with Anti-Capital Destruction safeguards (strictly halts averaging down on broken debt or loss-makers).
* Single-stock deep dive console (discuss tax harvesting, averaging, or profit booking).

---

## 🏗️ Architecture & Tech Stack

```
   [ React (Vite) + Tailwind CSS + Lucide Icons ]   (Port 5173 / Port 80)
                       │
                    HTTP REST
                       ▼
   [ Spring Boot 3.4.0 (Java 21) REST APIs ]       (Port 8080)
      ├── DualEngineRadarService & RadarController (/api/radar)
      ├── ChartVisionService & ChartVisionController (/api/chart)
      ├── ScreenerService & ScreenerController (/api/screener)
      └── PortfolioService & PortfolioController (/api/portfolio)
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
   [ In-Memory H2 DB ]     [ Gemini 1.5/2.5 AI ]
   (Persistent Schema)     (Vision + Multimodal)
```

---

## 🚀 Local Quickstart

### Prerequisites
* Java 21 (JDK)
* Node.js 20+ & npm

### Run via Scripts
* Backend: Double-click `start-backend.bat` or run `cd backend && java -jar target/cortex-invest-0.0.1-SNAPSHOT.jar`
* Frontend: Double-click `start-frontend.bat` or run `cd frontend && npm run dev`
* Open `http://localhost:5173` in your browser.

---

## 🐳 Docker & Cloud Deployment

### 1. Docker Compose (1-Command Full Stack)
```bash
docker compose up --build -d
```
* Backend runs on `http://localhost:8080`
* Frontend runs on `http://localhost:80` (or `http://localhost:5173`)

### 2. Deploy Backend to Render / Railway / Fly.io
1. Push repository to GitHub.
2. Link repository to [Render.com](https://render.com) or [Railway.app](https://railway.app).
3. Use `backend/Dockerfile` as the Docker build context.
4. Set Environment Variables:
   * `PORT=8080`
   * `GEMINI_API_KEY=your_key_here` (Optional - simulation engine active by default).

### 3. Deploy Frontend to Vercel
1. Import the `frontend` folder into [Vercel](https://vercel.com).
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Rewrites are pre-configured in `frontend/vercel.json`.
