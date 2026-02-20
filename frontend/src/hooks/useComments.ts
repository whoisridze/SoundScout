import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsService } from "@/services";
import type {
  CommentListResponse,
  CommentCreateRequest,
  CommentUpdateRequest,
  Comment,
} from "@/types";

export function useTrackComments(trackId: string, page = 1) {
  return useQuery<CommentListResponse, Error>({
    queryKey: ["trackComments", trackId, page],
    queryFn: () => commentsService.getTrackComments(trackId, page),
    enabled: !!trackId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useArtistComments(artistId: string, page = 1) {
  return useQuery<CommentListResponse, Error>({
    queryKey: ["artistComments", artistId, page],
    queryFn: () => commentsService.getArtistComments(artistId, page),
    enabled: !!artistId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, CommentCreateRequest>({
    mutationFn: (data) => commentsService.createComment(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trackComments", variables.track_id],
      });
      queryClient.invalidateQueries({ queryKey: ["artistComments"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userComments"] });
      queryClient.invalidateQueries({ queryKey: ["userActivity"] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation<
    Comment,
    Error,
    { commentId: string; data: CommentUpdateRequest }
  >({
    mutationFn: ({ commentId, data }) =>
      commentsService.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackComments"] });
      queryClient.invalidateQueries({ queryKey: ["artistComments"] });
      queryClient.invalidateQueries({ queryKey: ["userComments"] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (commentId) => commentsService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackComments"] });
      queryClient.invalidateQueries({ queryKey: ["artistComments"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userComments"] });
      queryClient.invalidateQueries({ queryKey: ["userActivity"] });
    },
  });
}
