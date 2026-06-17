import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fantasyApi } from "@/api/fantasy";
import { useAuth } from "@/context/AuthContext";
import type { Position } from "@/types";

export const useSeason = () =>
  useQuery({
    queryKey: ["season"],
    queryFn: fantasyApi.getActiveSeason,
    staleTime: 5 * 60 * 1000,
  });

export const useClubs = () =>
  useQuery({
    queryKey: ["clubs"],
    queryFn: fantasyApi.getClubs,
    staleTime: 10 * 60 * 1000,
  });

export const usePlayers = (filters?: {
  position?: Position;
  club_id?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: ["players", filters],
    queryFn: () => fantasyApi.getPlayers(filters),
    staleTime: 2 * 60 * 1000,
  });

export const useLeaderboard = (page = 1) =>
  useQuery({
    queryKey: ["leaderboard", page],
    queryFn: () => fantasyApi.getLeaderboard(page),
    staleTime: 60 * 1000,
  });

export const useMe = () => {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["me"],
    queryFn: fantasyApi.getMe,
    enabled: isLoggedIn,
    retry: false,
  });
};

export const useMyTeam = () => {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["my-team"],
    queryFn: fantasyApi.getMyTeam,
    enabled: isLoggedIn,
    retry: false,
  });
};

export const useDashboard = () => {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fantasyApi.getDashboard,
    enabled: isLoggedIn,
    retry: false,
    staleTime: 60 * 1000,
  });
};

export const useMakeTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerOutId, playerInId }: { playerOutId: number; playerInId: number }) =>
      fantasyApi.makeTransfer(playerOutId, playerInId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-team"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
