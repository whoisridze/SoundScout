import api from "./api";
import type { SearchResponse } from "@/types";

class SearchService {
  async search(query: string): Promise<SearchResponse> {
    const response = await api.get<SearchResponse>("/search", {
      params: { q: query },
    });
    return response.data;
  }
}

export const searchService = new SearchService();
