import api from "./api";
import type {
  ArtistsByGenreResponse,
  ArtistDetailResponse,
  SimilarArtistsResponse,
  ArtistTracksResponse,
} from "@/types";

class ArtistService {
  async getArtistsByGenre(
    genre: string,
    limit: number = 10
  ): Promise<ArtistsByGenreResponse> {
    const encodedGenre = encodeURIComponent(genre);
    const response = await api.get<ArtistsByGenreResponse>(
      `/artists/${encodedGenre}`,
      { params: { limit } }
    );
    return response.data;
  }

  async getArtistDetails(artistId: string): Promise<ArtistDetailResponse> {
    const response = await api.get<ArtistDetailResponse>(
      `/artists/artist/${artistId}`
    );
    return response.data;
  }

  async getSimilarArtists(artistId: string): Promise<SimilarArtistsResponse> {
    const response = await api.get<SimilarArtistsResponse>(
      `/artists/artist/${artistId}/similar`
    );
    return response.data;
  }

  async getArtistTracks(artistId: string): Promise<ArtistTracksResponse> {
    const response = await api.get<ArtistTracksResponse>(
      `/artists/artist/${artistId}/tracks`
    );
    return response.data;
  }
}

export const artistService = new ArtistService();
