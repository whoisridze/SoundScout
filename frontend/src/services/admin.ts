import api from "./api";
import type {
  AdminStatsResponse,
  AdminUserUpdate,
  UserListResponse,
  User,
  CommentListResponse,
} from "@/types";

class AdminService {
  async getStats(): Promise<AdminStatsResponse> {
    const response = await api.get<AdminStatsResponse>("/admin/stats");
    return response.data;
  }

  async getUsers(
    page = 1,
    perPage = 20,
    search?: string
  ): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>("/admin/users", {
      params: { page, per_page: perPage, ...(search ? { search } : {}) },
    });
    return response.data;
  }

  async updateUser(userId: string, data: AdminUserUpdate): Promise<User> {
    const response = await api.put<User>(`/admin/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }

  async getComments(
    page = 1,
    perPage = 20,
    includeDeleted = false
  ): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>("/admin/comments", {
      params: { page, per_page: perPage, include_deleted: includeDeleted },
    });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/admin/comments/${commentId}`);
  }
}

export const adminService = new AdminService();
