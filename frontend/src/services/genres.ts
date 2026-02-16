import api from "./api";
import type { GenresResponse, SubgenresResponse, AllGenresResponse } from "@/types";

class GenreService {
  async getMainGenres(): Promise<GenresResponse> {
    const response = await api.get<GenresResponse>("/genres");
    return response.data;
  }

  async getSubgenres(mainGenre: string): Promise<SubgenresResponse> {
    const encodedGenre = encodeURIComponent(mainGenre);
    const response = await api.get<SubgenresResponse>(
      `/genres/${encodedGenre}/subgenres`
    );
    return response.data;
  }

  async getAllGenres(): Promise<AllGenresResponse> {
    const response = await api.get<AllGenresResponse>("/genres/all");
    return response.data;
  }
}

export const genreService = new GenreService();
