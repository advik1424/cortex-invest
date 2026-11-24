import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  timeout: 60000,
});

// Automatically inject logged-in user's email into request headers for private user isolation
api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('cortex_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user?.email) {
        config.headers['X-User-Email'] = user.email;
      }
    }
  } catch (e) {
    // Ignore storage read error
  }
  return config;
});

export const screenerApi = {
  getData: (ticker) => api.get(`/screener/${ticker}`),
  search: (query) => api.get(`/screener/search?q=${query}`),
  getAiAnalysis: (payload) => api.post('/screener/ai-analysis', payload),
  askAnalyst: (payload) => api.post('/screener/ask-analyst', payload),
};

export const chartApi = {
  analyze: (payload) => {
    // Supports both old signature (file, ticker, timeframe) and new object signature ({ files, file, tradingCategory, userQuery, ticker, timeframe })
    const formData = new FormData();
    if (payload instanceof File) {
      formData.append('file', payload);
    } else if (payload && typeof payload === 'object') {
      if (payload.files && payload.files.length > 0) {
        payload.files.forEach((f) => formData.append('files', f));
      } else if (payload.file) {
        formData.append('file', payload.file);
      }
      if (payload.tradingCategory) formData.append('tradingCategory', payload.tradingCategory);
      if (payload.userQuery) formData.append('userQuery', payload.userQuery);
      if (payload.ticker) formData.append('ticker', payload.ticker);
      if (payload.timeframe) formData.append('timeframe', payload.timeframe);
    }

    return api.post('/chart/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  scanLive: ({ tradingCategory = 'SWING', userQuery = '', ticker = 'RELIANCE', timeframe = 'Daily (1D)' } = {}) => {
    const params = new URLSearchParams();
    params.append('tradingCategory', tradingCategory);
    if (userQuery) params.append('userQuery', userQuery);
    params.append('ticker', ticker);
    params.append('timeframe', timeframe);
    return api.post(`/chart/scan?${params.toString()}`);
  },
};

export const portfolioApi = {
  getHoldings: () => api.get('/portfolio'),
  addHolding: (holding) => api.post('/portfolio/add', holding),
  deleteHolding: (id) => api.delete(`/portfolio/${id}`),
  diagnose: () => api.post('/portfolio/diagnose'),
  audit: () => api.get('/portfolio/audit'),
  discussStock: (payload) => api.post('/portfolio/discuss-stock', payload),
};

export const radarApi = {
  getSummary: () => api.get('/radar/summary'),
  getValueBuys: () => api.get('/radar/value-buys'),
  getSwingSignals: () => api.get('/radar/swing-signals'),
  getPortfolioAudit: () => api.get('/radar/portfolio-audit'),
};

export const marketApi = {
  getIntelligence: () => api.get('/market/intelligence'),
  getNewsSentiment: () => api.get('/market/news-sentiment'),
  getSectorInsights: () => api.get('/market/sector-insights'),
  getQuote: (ticker) => api.get(`/market/quote/${ticker}`),
};

export default api;
