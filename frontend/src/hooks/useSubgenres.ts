import { useQuery } from "@tanstack/react-query";
import { genreService } from "@/services";
import type { SubgenresResponse } from "@/types";

export function useSubgenres(mainGenre: string) {
  return useQuery<SubgenresResponse, Error>({
    queryKey: ["subgenres", mainGenre],
    queryFn: () => genreService.getSubgenres(mainGenre),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!mainGenre,
  });
}
