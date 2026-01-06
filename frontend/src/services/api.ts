import axios from 'axios';
import type {
  TokenResponse,
  User,
  GameSession,
  AskResponse,
  GameResult,
  GameHistoryItem,
  GameDetail,
  AdminUser,
  AdminStats,
} from '../types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post<TokenResponse>('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  register: async (username: string, password: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/register', { username, password });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateTutorial: async (completed: boolean): Promise<void> => {
    await api.patch('/users/me/tutorial', { completed });
  },
};

export const gameApi = {
  startGame: async (): Promise<GameSession> => {
    const response = await api.post<GameSession>('/game/start');
    return response.data;
  },

  askQuestion: async (sessionId: number, godIndex: number, question: string): Promise<AskResponse> => {
    const response = await api.post<AskResponse>('/game/ask', {
      session_id: sessionId,
      god_index: godIndex,
      question,
    });
    return response.data;
  },

  submitGuess: async (sessionId: number, guesses: string[]): Promise<GameResult> => {
    const response = await api.post<GameResult>('/game/submit', {
      session_id: sessionId,
      guesses,
    });
    return response.data;
  },
};

export const historyApi = {
  getHistory: async (limit = 20, offset = 0): Promise<GameHistoryItem[]> => {
    const response = await api.get<GameHistoryItem[]>('/history', {
      params: { limit, offset },
    });
    return response.data;
  },

  getGameDetail: async (sessionId: number): Promise<GameDetail> => {
    const response = await api.get<GameDetail>(`/history/${sessionId}`);
    return response.data;
  },
};

export const adminApi = {
  getUsers: async (limit = 50, offset = 0): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>('/admin/users', {
      params: { limit, offset },
    });
    return response.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
  },

  toggleUserDisabled: async (userId: string): Promise<{ id: string; is_disabled: boolean }> => {
    const response = await api.patch<{ id: string; is_disabled: boolean }>(
      `/admin/users/${userId}/disable`
    );
    return response.data;
  },
};

export default api;
