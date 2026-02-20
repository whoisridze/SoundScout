import { useQuery } from "@tanstack/react-query";
import { artistService } from "@/services";
import type {
  ArtistDetailResponse,
  SimilarArtistsResponse,
  ArtistTracksResponse,
} from "@/types";

interface UseArtistDetailResult {
  artist: ArtistDetailResponse | undefined;
  similarArtists: SimilarArtistsResponse | undefined;
  tracks: ArtistTracksResponse | undefined;
  isArtistLoading: boolean;
  isTracksLoading: boolean;
  isSimilarLoading: boolean;
  isArtistError: boolean;
  artistError: Error | null;
  refetch: () => void;
}

export function useArtistDetail(artistId: string): UseArtistDetailResult {
  const artistQuery = useQuery<ArtistDetailResponse, Error>({
    queryKey: ["artist", artistId],
    queryFn: () => artistService.getArtistDetails(artistId),
    enabled: !!artistId,
  });

  const similarQuery = useQuery<SimilarArtistsResponse, Error>({
    queryKey: ["artist", artistId, "similar"],
    queryFn: () => artistService.getSimilarArtists(artistId),
    enabled: !!artistId,
  });

  const tracksQuery = useQuery<ArtistTracksResponse, Error>({
    queryKey: ["artist", artistId, "tracks"],
    queryFn: () => artistService.getArtistTracks(artistId),
    enabled: !!artistId,
  });

  return {
    artist: artistQuery.data,
    similarArtists: similarQuery.data,
    tracks: tracksQuery.data,
    isArtistLoading: artistQuery.isLoading,
    isTracksLoading: tracksQuery.isLoading,
    isSimilarLoading: similarQuery.isLoading,
    isArtistError: artistQuery.isError,
    artistError: artistQuery.error || null,
    refetch: () => {
      artistQuery.refetch();
      similarQuery.refetch();
      tracksQuery.refetch();
    },
  };
}
