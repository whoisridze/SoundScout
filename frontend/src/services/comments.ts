import api from "./api";
import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentListResponse,
} from "@/types";

class CommentsService {
  async createComment(data: CommentCreateRequest): Promise<Comment> {
    const response = await api.post<Comment>("/comments", data);
    return response.data;
  }

  async getTrackComments(
    trackId: string,
    page = 1,
    perPage = 20
  ): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>(
      `/comments/track/${encodeURIComponent(trackId)}`,
      { params: { page, per_page: perPage } }
    );
    return response.data;
  }

  async getArtistComments(
    artistId: string,
    page = 1,
    perPage = 15
  ): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>(
      `/comments/artist/${encodeURIComponent(artistId)}`,
      { params: { page, per_page: perPage } }
    );
    return response.data;
  }

  async getMyComments(page = 1, perPage = 20): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>("/comments/my", {
      params: { page, per_page: perPage },
    });
    return response.data;
  }

  async updateComment(
    commentId: string,
    data: CommentUpdateRequest
  ): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${commentId}`, data);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }
}

export const commentsService = new CommentsService();
