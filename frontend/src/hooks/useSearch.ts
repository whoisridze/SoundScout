import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search";
import type { SearchResponse } from "@/types";

export function useSearch(query: string) {
  return useQuery<SearchResponse, Error>({
    queryKey: ["search", query],
    queryFn: () => searchService.search(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
