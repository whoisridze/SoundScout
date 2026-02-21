import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services";
import type {
  AdminStatsResponse,
  AdminUserUpdate,
  UserListResponse,
  User,
  CommentListResponse,
} from "@/types";

export function useAdminStats() {
  return useQuery<AdminStatsResponse, Error>({
    queryKey: ["adminStats"],
    queryFn: () => adminService.getStats(),
  });
}

export function useAdminUsers(page = 1, search?: string) {
  return useQuery<UserListResponse, Error>({
    queryKey: ["adminUsers", page, search],
    queryFn: () => adminService.getUsers(page, 20, search),
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: string; data: AdminUserUpdate }>({
    mutationFn: ({ userId, data }) => adminService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useAdminComments(page = 1, includeDeleted = false) {
  return useQuery<CommentListResponse, Error>({
    queryKey: ["adminComments", page, includeDeleted],
    queryFn: () => adminService.getComments(page, 20, includeDeleted),
  });
}

export function useAdminDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (commentId) => adminService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminComments"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["userComments"] });
      queryClient.invalidateQueries({ queryKey: ["trackComments"] });
      queryClient.invalidateQueries({ queryKey: ["artistComments"] });
    },
  });
}
