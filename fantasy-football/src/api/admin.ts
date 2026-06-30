import { apiClient } from "./client";

const STORAGE_BASE = "https://apifantasy.footballplus.tv/storage";

/** Turns a relative path returned by the API into an absolute URL.
 *  Laravel stores uploads under /storage/ (symlinked from public/storage). */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${STORAGE_BASE}${path}`;
}

export interface AdminClub {
  id: number;
  season_id: number;
  name: string;
  short_name: string;
  logo: string | null;
  status: boolean;
  players_count?: number;
}

export interface AdminPlayer {
  id: number;
  club_id: number;
  display_name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  price: number;
  photo: string | null;
  status: "active" | "injured" | "suspended";
  club?: { id: number; name: string; short_name: string; logo: string | null };
}

export interface PlayerMatchStat {
  player_id: number;
  minutes: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  goals_conceded: number;
  saves: number;
  penalties_saved: number;
  penalties_missed: number;
  own_goals: number;
  clean_sheet: boolean;
  player_of_match: boolean;
}

// Extracts an array from either a plain `{ data: [] }` or paginated `{ data: { data: [] } }` response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractList<T>(data: any): T[] {
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.data?.data)) return data.data.data as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
}

export const adminApi = {
  // ── Clubs ──────────────────────────────────────────────────────────────────
  getClubs: async (): Promise<AdminClub[]> => {
    const { data } = await apiClient.get("/v1/fantasy/clubs");
    return extractList<AdminClub>(data);
  },

  createClub: async (payload: {
    season_id: number;
    name: string;
    short_name: string;
    status: boolean;
  }): Promise<AdminClub> => {
    const { data } = await apiClient.post("/v1/admin/fantasy/clubs", payload);
    return data.data;
  },

  updateClub: async (clubId: number, payload: { name: string; short_name: string; status: boolean }): Promise<AdminClub> => {
    const { data } = await apiClient.put(`/v1/admin/fantasy/clubs/${clubId}`, payload);
    return data.data;
  },

  uploadClubLogo: async (clubId: number, file: File) => {
    const form = new FormData();
    form.append("logo", file);
    const { data } = await apiClient.post(`/v1/admin/fantasy/clubs/${clubId}/logo`, form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deleteClubLogo: async (clubId: number) => {
    const { data } = await apiClient.delete(`/v1/admin/fantasy/clubs/${clubId}/logo`);
    return data;
  },

  // ── Players ────────────────────────────────────────────────────────────────
  getPlayers: async (params?: { season_id?: number; club_id?: number; position?: string; search?: string }): Promise<AdminPlayer[]> => {
    const { data } = await apiClient.get("/v1/admin/fantasy/players", { params });
    return extractList<AdminPlayer>(data);
  },

  createPlayer: async (payload: {
    season_id: number;
    club_id: number;
    display_name: string;
    position: string;
    price: number;
    status: string;
  }): Promise<AdminPlayer> => {
    const { data } = await apiClient.post("/v1/admin/fantasy/players", payload);
    return data.data;
  },

  updatePlayer: async (playerId: number, payload: { display_name: string; price: number; status: string }): Promise<AdminPlayer> => {
    const { data } = await apiClient.put(`/v1/admin/fantasy/players/${playerId}`, payload);
    return data.data;
  },

  activatePlayer: async (playerId: number) => {
    const { data } = await apiClient.post(`/v1/admin/fantasy/players/${playerId}/activate`);
    return data;
  },

  deactivatePlayer: async (playerId: number) => {
    const { data } = await apiClient.post(`/v1/admin/fantasy/players/${playerId}/deactivate`);
    return data;
  },

  changePlayerPrice: async (playerId: number, price: number) => {
    const { data } = await apiClient.post(`/v1/admin/fantasy/players/${playerId}/change-price`, { price });
    return data;
  },

  uploadPlayerPhoto: async (playerId: number, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    const { data } = await apiClient.post(`/v1/admin/fantasy/players/${playerId}/photo`, form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deletePlayerPhoto: async (playerId: number) => {
    const { data } = await apiClient.delete(`/v1/admin/fantasy/players/${playerId}/photo`);
    return data;
  },

  // ── Fixtures & Points ──────────────────────────────────────────────────────
  storeFixtureStats: async (fixtureId: number, payload: { home_score: number; away_score: number; players: PlayerMatchStat[] }) => {
    const { data } = await apiClient.post(`/v1/admin/fantasy/fixtures/${fixtureId}/stats`, payload);
    return data;
  },

  calculateFixturePoints: async (fixtureId: number) => {
    const { data } = await apiClient.post(`/v1/admin/fantasy/fixtures/${fixtureId}/calculate-points`);
    return data;
  },

  calculateRoundTeamPoints: async (roundId: number) => {
    const { data } = await apiClient.post(`/v1/admin/fantasy/rounds/${roundId}/calculate-team-points`);
    return data;
  },
};
