import { useQuery } from "@tanstack/react-query";
import { artistService } from "@/services";
import type { ArtistsByGenreResponse } from "@/types";

export function useArtists(genre: string, limit: number = 10) {
  return useQuery<ArtistsByGenreResponse, Error>({
    queryKey: ["artists", genre, limit],
    queryFn: () => artistService.getArtistsByGenre(genre, limit),
    enabled: !!genre,
  });
}
