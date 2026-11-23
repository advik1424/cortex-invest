import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ ticker, timeframe = 'D' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const cleanTicker = ticker ? ticker.toUpperCase().trim() : 'RELIANCE';
    // TradingView Indian symbols: NSE or BSE
    const tvSymbol = cleanTicker.includes(':') ? cleanTicker : `NSE:${cleanTicker}`;

    // Map timeframe
    let interval = 'D';
    if (timeframe.includes('15')) interval = '15';
    else if (timeframe.includes('1H') || timeframe.includes('60')) interval = '60';
    else if (timeframe.includes('4H') || timeframe.includes('240')) interval = '240';
    else if (timeframe.includes('1W') || timeframe.includes('Weekly')) interval = 'W';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: 'Asia/Kolkata',
      theme: 'light',
      style: '1', // Candlestick style
      locale: 'en',
      toolbar_bg: '#f8fafc',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      studies: [
        'STD;EMA', // 20 EMA
        'STD;RSI', // RSI Momentum
      ],
      container_id: 'tradingview_chart_container',
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ticker, timeframe]);

  return (
    <div className="w-full h-[520px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative">
      <div
        id="tradingview_chart_container"
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
      />
    </div>
  );
}

export default memo(TradingViewWidget);
