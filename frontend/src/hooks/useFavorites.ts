import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesService } from "@/services";
import { trackToFavoriteCreate } from "@/utils";
import type { Track } from "@/types";

export function useFavoriteCheck(spotifyId: string) {
  return useQuery<boolean, Error>({
    queryKey: ["favoriteCheck", spotifyId],
    queryFn: () => favoritesService.checkFavorite(spotifyId),
    enabled: !!spotifyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFavoritesBatch(spotifyIds: string[]) {
  return useQuery<string[], Error>({
    queryKey: ["favoritesBatch", spotifyIds],
    queryFn: () => favoritesService.checkFavoritesBatch(spotifyIds),
    enabled: spotifyIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (track: Track) =>
      favoritesService.addFavorite(trackToFavoriteCreate(track)),
    onSuccess: (_data, track) => {
      queryClient.setQueryData(["favoriteCheck", track.id], true);
      queryClient.invalidateQueries({ queryKey: ["favoritesBatch"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
      queryClient.invalidateQueries({ queryKey: ["userActivity"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (spotifyId: string) =>
      favoritesService.removeFavorite(spotifyId),
    onSuccess: (_data, spotifyId) => {
      queryClient.setQueryData(["favoriteCheck", spotifyId], false);
      queryClient.invalidateQueries({ queryKey: ["favoritesBatch"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
      queryClient.invalidateQueries({ queryKey: ["userActivity"] });
    },
  });

  return {
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
