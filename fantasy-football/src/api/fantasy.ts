import { apiClient } from "./client";
import type {
  ApiResponse,
  Club,
  LeaderboardEntry,
  PaginatedResponse,
  Player,
  Position,
  Season,
} from "@/types";

export const fantasyApi = {
  getActiveSeason: async (): Promise<Season> => {
    const { data } = await apiClient.get<ApiResponse<Season>>(
      "/v1/fantasy/seasons/active"
    );
    return data.data;
  },

  getClubs: async (): Promise<Club[]> => {
    const { data } = await apiClient.get<ApiResponse<Club[]>>(
      "/v1/fantasy/clubs"
    );
    return data.data;
  },

  getPlayers: async (params?: {
    position?: Position;
    club_id?: number;
    search?: string;
  }): Promise<Player[]> => {
    const { data } = await apiClient.get<ApiResponse<Player[]>>(
      "/v1/fantasy/players",
      { params }
    );
    return data.data;
  },

  getLeaderboard: async (page = 1): Promise<PaginatedResponse<LeaderboardEntry>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<LeaderboardEntry>>>(
      "/v1/fantasy/leaderboard",
      { params: { page } }
    );
    return data.data;
  },

  getMe: async () => {
    const { data } = await apiClient.get("/v1/fantasy/me");
    return data.data;
  },

  getMyTeam: async () => {
    const { data } = await apiClient.get("/v1/fantasy/team/me");
    return data.data;
  },

  getDashboard: async () => {
    const { data } = await apiClient.get("/v1/fantasy/dashboard");
    return data.data;
  },

  createTeam: async (payload: {
    season_id: number;
    name: string;
    players: Array<{
      player_id: number;
      is_starting: boolean;
      is_captain: boolean;
      is_vice_captain: boolean;
      bench_order?: number;
    }>;
  }) => {
    const { data } = await apiClient.post("/v1/fantasy/team", payload);
    return data.data;
  },
};
