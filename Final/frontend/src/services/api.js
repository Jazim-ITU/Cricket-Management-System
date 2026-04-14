import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  getPlayers: (id) => api.get(`/teams/${id}/players`),
  getStats: (id) => api.get(`/teams/${id}/stats`),
};

export const playersAPI = {
  getAll: () => api.get('/players'),
  getById: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
  getStats: (id) => api.get(`/players/${id}/stats`),
};

export const coachesAPI = {
  getAll: () => api.get('/coaches'),
  getById: (id) => api.get(`/coaches/${id}`),
  create: (data) => api.post('/coaches', data),
  update: (id, data) => api.put(`/coaches/${id}`, data),
  delete: (id) => api.delete(`/coaches/${id}`),
};

export const tournamentsAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  getMatches: (id) => api.get(`/tournaments/${id}/matches`),
  getStandings: (id) => api.get(`/tournaments/${id}/standings`),
};

export const matchesAPI = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  delete: (id) => api.delete(`/matches/${id}`),
  getUmpires: (id) => api.get(`/matches/${id}/umpires`),
  assignUmpire: (id, data) => api.post(`/matches/${id}/umpires`, data),
};

export const statisticsAPI = {
  getTopBatsmen: (limit = 10) => api.get(`/statistics/top-batsmen?limit=${limit}`),
  getTopBowlers: (limit = 10) => api.get(`/statistics/top-bowlers?limit=${limit}`),
  getTeamPerformance: () => api.get('/statistics/team-performance'),
  getMatchStats: (matchId) => api.get(`/statistics/match/${matchId}`),
  recordStat: (data) => api.post('/statistics', data),
};

export const transactionsAPI = {
  assignCoach: (data) => api.post('/transactions/assign-coach', data),
  transferPlayer: (data) => api.post('/transactions/transfer-player', data),
};

export const offersAPI = {
  send: (data) => api.post('/offers/send', data),
  getSent: () => api.get('/offers/sent'),
  getMyOffers: () => api.get('/offers/my-offers'),
  respond: (offer_id, action) => api.put(`/offers/${offer_id}/respond`, { action }),
};

export default api;