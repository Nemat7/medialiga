import { apiClient } from '../client';

export interface EMatch {
  id: number;
  date: string;        // formatted_date: "Jan 15"
  time: string;        // formatted_time: "20:00"
  teamA: string;       // team_a
  teamB: string;       // team_b
  scoreA: number | null;
  scoreB: number | null;
  status: "upcoming" | "live" | "completed";
  location?: string;
  tournament_round?: string;
  created_at: string;
}

export interface MatchCreateData {
  teamA: string;
  teamB: string;
  match_date: string;  // YYYY-MM-DD
  match_time: string;  // HH:MM
  status?: "upcoming" | "live" | "completed";
  scoreA?: number;
  scoreB?: number;
  location?: string;
  tournament_round?: string;
}

export const matchApi = {
  // Получить все матчи
  getAll: (params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    ordering?: string;
  }) => apiClient.get<EMatch[]>('/api/efootball/matches/', { params }),

  // Получить расписание (специальный endpoint)
  getSchedule: () => apiClient.get<EMatch[]>('/api/efootball/matches/schedule/'),

  // Получить предстоящие матчи
  getUpcoming: () => apiClient.get<EMatch[]>('/api/efootball/matches/upcoming/'),

  // Получить матчи в прямом эфире
  getLive: () => apiClient.get<EMatch[]>('/api/efootball/matches/live/'),

  // Получить завершенные матчи
  getCompleted: () => apiClient.get<EMatch[]>('/api/efootball/matches/completed/'),

  // Получить матч по ID
  getById: (id: number) => apiClient.get<EMatch>(`/api/efootball/matches/${id}/`),

  // Создать матч
  create: (data: MatchCreateData) => {
    // Преобразуем поля для Django
    const djangoData = {
      team_a: data.teamA,
      team_b: data.teamB,
      match_date: data.match_date,
      match_time: data.match_time,
      status: data.status || 'upcoming',
      score_a: data.scoreA,
      score_b: data.scoreB,
      location: data.location,
      tournament_round: data.tournament_round,
    };
    return apiClient.post<EMatch>('/api/efootball/matches/', djangoData);
  },

  // Обновить счет
  updateScore: (id: number, scoreA: number, scoreB: number) =>
    apiClient.post<EMatch>(`/api/efootball/matches/${id}/update_score/`, {
      scoreA,
      scoreB
    }),

  // Удалить матч
  delete: (id: number) => apiClient.delete(`/api/efootball/matches/${id}/`),
};