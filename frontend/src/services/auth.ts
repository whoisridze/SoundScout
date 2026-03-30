import axios from "axios";
import api from "./api";
import type { AuthTokens, User, LoginCredentials, RegisterRequest } from "@/types";

const API_URL = `${import.meta.env.VITE_API_URL || "/api/v1"}/auth`;

const TOKEN_KEY = "soundscout_access_token";
const REFRESH_TOKEN_KEY = "soundscout_refresh_token";

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await axios.post<AuthTokens>(`${API_URL}/login`, credentials);
      this.setTokens(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await axios.post<User>(`${API_URL}/register`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await axios.post(
          `${API_URL}/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      if (!this.getAccessToken()) throw new Error("Not authenticated");

      // Use api instance with interceptors for auto token refresh
      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const response = await axios.post<AuthTokens>(`${API_URL}/refresh`, {
        refresh_token: refreshToken,
      });

      // Only access token is returned on refresh
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      return response.data;
    } catch (error) {
      this.clearTokens();
      throw this.handleError(error);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail;
      if (typeof message === "string") {
        return new Error(message);
      }
      if (Array.isArray(message) && message[0]?.msg) {
        return new Error(message[0].msg);
      }
      if (error.response?.status === 401) {
        return new Error("Invalid email or password");
      }
      if (error.response?.status === 409) {
        return new Error("An account with this email or username already exists");
      }
    }
    return new Error("An unexpected error occurred");
  }
}

export const authService = new AuthService();
