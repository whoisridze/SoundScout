import api from "./api";
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

class ProfileService {
  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>("/profile");
    return response.data;
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<void> {
    await api.put("/profile", data);
  }

  async getPublicProfile(username: string): Promise<PublicUserProfileResponse> {
    const response = await api.get<PublicUserProfileResponse>(
      `/profile/user/${encodeURIComponent(username)}`
    );
    return response.data;
  }

  async getUserFavorites(
    username: string,
    page = 1,
    perPage = 15
  ): Promise<FavoriteListResponse> {
    const response = await api.get<FavoriteListResponse>(
      `/profile/user/${encodeURIComponent(username)}/favorites`,
      { params: { page, per_page: perPage } }
    );
    return response.data;
  }

  async getUserComments(
    username: string,
    page = 1,
    perPage = 15
  ): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>(
      `/profile/user/${encodeURIComponent(username)}/comments`,
      { params: { page, per_page: perPage } }
    );
    return response.data;
  }
  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<User>("/profile/avatar", formData);
    return response.data;
  }

  async uploadBanner(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<User>("/profile/banner", formData);
    return response.data;
  }

  async deleteAvatar(): Promise<User> {
    const response = await api.delete<User>("/profile/avatar");
    return response.data;
  }

  async deleteBanner(): Promise<User> {
    const response = await api.delete<User>("/profile/banner");
    return response.data;
  }

  async changeEmail(data: EmailChangeRequest): Promise<User> {
    const response = await api.put<User>("/profile/email", data);
    return response.data;
  }

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await api.put("/profile/password", data);
  }

  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    await api.post("/profile/delete-account", data);
  }

  async getUserActivity(
    username: string,
    page = 1,
    perPage = 15,
  ): Promise<ActivityFeedResponse> {
    const response = await api.get<ActivityFeedResponse>(
      `/profile/user/${encodeURIComponent(username)}/activity`,
      { params: { page, per_page: perPage } },
    );
    return response.data;
  }
}

export const profileService = new ProfileService();
