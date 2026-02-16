import { useQuery } from "@tanstack/react-query";
import { genreService } from "@/services";
import type { GenresResponse } from "@/types";

export function useGenres() {
  return useQuery<GenresResponse, Error>({
    queryKey: ["genres"],
    queryFn: () => genreService.getMainGenres(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
