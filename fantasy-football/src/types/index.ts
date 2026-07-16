export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface Club {
  id: number;
  season_id: number;
  name: string;
  short_name: string;
  logo: string | null;
  status: boolean;
  players_count: number;
}

export interface Player {
  id: number;
  club_id: number;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  position: Position;
  price: number;
  photo: string | null;
  status: "active" | "injured" | "suspended";
  club: Pick<Club, "id" | "name" | "short_name" | "logo">;
}

export interface Round {
  id: number;
  season_id: number;
  number: number;
  name: string;
  starts_at: string;
  ends_at: string;
  deadline_at: string;
  status: "upcoming" | "live" | "finished" | "finalized";
}

export interface ScoringRules {
  goal: Record<Position, number>;
  assist: number;
  own_goal: number;
  red_card: number;
  clean_sheet: Record<Position, number>;
  yellow_card: number;
  missed_penalty: number;
  player_of_match: number;
  played_60_minutes: number;
  captain_multiplier: number;
  triple_captain_multiplier: number;
}

export interface Ruleset {
  id: number;
  name: string;
  squad_size: number;
  starting_size: number;
  bench_size: number;
  budget: number;
  max_players_per_club: number;
  positions: Record<Position, number>;
  starting_min: Record<Position, number>;
  scoring_rules: ScoringRules;
  transfer_rules: {
    max_saved_transfers: number;
    extra_transfer_penalty: number;
    free_transfers_per_round: number;
  };
  chip_rules: {
    free_hit: number;
    wildcard: number;
    bench_boost: number;
    triple_captain: number;
  };
}

export interface Season {
  id: number;
  ruleset_id: number;
  name: string;
  date_from: string;
  date_to: string;
  status: "active" | "finished" | "upcoming";
  ruleset: Ruleset;
  rounds: Round[];
}

export interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  manager_id: number;
  manager_name: string;
  user_id: number;
  total_points: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
  per_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
