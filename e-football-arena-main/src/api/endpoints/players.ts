import { apiClient } from '../client';

export interface Player {
  id: number;
  name: string;
  position: string;
  team: number;
  rating: number;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerCreateData {
  name: string;
  position: string;
  team: number;
  rating: number;
  age: number;
}

export const playerApi = {
  // Получить всех игроков
  getAll: () => apiClient.get<Player[]>('/players/'),

  // Получить игрока по ID
  getById: (id: number) => apiClient.get<Player>(`/players/${id}/`),

  // Создать нового игрока
  create: (data: PlayerCreateData) => apiClient.post<Player>('/players/', data),

  // Обновить игрока
  update: (id: number, data: Partial<PlayerCreateData>) =>
    apiClient.put<Player>(`/players/${id}/`, data),

  // Удалить игрока
  delete: (id: number) => apiClient.delete(`/players/${id}/`),

  // Поиск игроков
  search: (query: string) =>
    apiClient.get<Player[]>('/players/', { params: { search: query } }),
};