import api from "./api";
import type {
  FavoriteTrack,
  FavoriteTrackCreate,
  FavoriteListResponse,
  FavoriteCheckResponse,
  FavoriteBatchResponse,
} from "@/types";

class FavoritesService {
  async addFavorite(track: FavoriteTrackCreate): Promise<FavoriteTrack> {
    const response = await api.post<FavoriteTrack>("/favorites", track);
    return response.data;
  }

  async removeFavorite(spotifyId: string): Promise<void> {
    await api.delete(`/favorites/${encodeURIComponent(spotifyId)}`);
  }

  async getFavorites(page = 1, perPage = 20): Promise<FavoriteListResponse> {
    const response = await api.get<FavoriteListResponse>("/favorites", {
      params: { page, per_page: perPage },
    });
    return response.data;
  }

  async checkFavorite(spotifyId: string): Promise<boolean> {
    const response = await api.get<FavoriteCheckResponse>(
      `/favorites/check/${encodeURIComponent(spotifyId)}`
    );
    return response.data.is_favorite;
  }

  async checkFavoritesBatch(spotifyIds: string[]): Promise<string[]> {
    const response = await api.post<FavoriteBatchResponse>(
      "/favorites/check-batch",
      spotifyIds
    );
    return response.data.favorited;
  }
}

export const favoritesService = new FavoritesService();
