import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services";
import { useAuth } from "@/contexts";
import type {
  User,
  UserProfileResponse,
  PublicUserProfileResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  EmailChangeRequest,
  DeleteAccountRequest,
  FavoriteListResponse,
  CommentListResponse,
  ActivityFeedResponse,
} from "@/types";

export function useProfile() {
  return useQuery<UserProfileResponse, Error>({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
  });
}

export function usePublicProfile(username: string) {
  return useQuery<PublicUserProfileResponse, Error>({
    queryKey: ["publicProfile", username],
    queryFn: () => profileService.getPublicProfile(username),
    enabled: !!username,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<void, Error, ProfileUpdateRequest>({
    mutationFn: (data) => profileService.updateProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await refreshUser();
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<User, Error, File>({
    mutationFn: (file) => profileService.uploadAvatar(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["artistComments"] });
      queryClient.invalidateQueries({ queryKey: ["trackComments"] });
      queryClient.invalidateQueries({ queryKey: ["userComments"] });
      await refreshUser();
    },
  });
}

export function useUploadBanner() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<User, Error, File>({
    mutationFn: (file) => profileService.uploadBanner(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await refreshUser();
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<User, Error, void>({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["artistComments"] });
      queryClient.invalidateQueries({ queryKey: ["trackComments"] });
      queryClient.invalidateQueries({ queryKey: ["userComments"] });
      await refreshUser();
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<User, Error, void>({
    mutationFn: () => profileService.deleteBanner(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await refreshUser();
    },
  });
}

export function useChangeEmail() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<User, Error, EmailChangeRequest>({
    mutationFn: (data) => profileService.changeEmail(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await refreshUser();
    },
  });
}

export function useChangePassword() {
  return useMutation<void, Error, PasswordChangeRequest>({
    mutationFn: (data) => profileService.changePassword(data),
  });
}

export function useDeleteAccount() {
  return useMutation<void, Error, DeleteAccountRequest>({
    mutationFn: (data) => profileService.deleteAccount(data),
    onSuccess: () => {
      // Account is already deleted on server — clear local tokens directly
      // Don't call logout() as it tries to hit /auth/logout which will 401
      localStorage.removeItem("soundscout_access_token");
      localStorage.removeItem("soundscout_refresh_token");
    },
  });
}

export function useUserFavorites(username: string, page = 1) {
  return useQuery<FavoriteListResponse, Error>({
    queryKey: ["userFavorites", username, page],
    queryFn: () => profileService.getUserFavorites(username, page),
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserComments(username: string, page = 1) {
  return useQuery<CommentListResponse, Error>({
    queryKey: ["userComments", username, page],
    queryFn: () => profileService.getUserComments(username, page),
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserActivity(username: string, page = 1) {
  return useQuery<ActivityFeedResponse, Error>({
    queryKey: ["userActivity", username, page],
    queryFn: () => profileService.getUserActivity(username, page),
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
  });
}
