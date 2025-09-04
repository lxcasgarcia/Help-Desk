import { api } from "./base";
import type { UserResponse } from "../../types/entities/user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "technician" | "client";
  profileImage?: string | null;
}

export class AuthService {
  private static baseUrl = "/sessions";

  /**
   * Fazer login
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Fazer logout
   */
  static async logout(): Promise<void> {
    await api.delete(`${this.baseUrl}`);
  }

  /**
   * Registrar novo usuário
   */
  static async register(data: RegisterRequest): Promise<LoginResponse> {
    const userData = {
      ...data,
      profileImage: data.profileImage || null,
    };
    const response = await api.post<LoginResponse>("/users", userData);
    return response.data;
  }

  /**
   * Verificar se o token é válido e obter dados completos do usuário
   */
  static async validateToken(): Promise<UserResponse> {
    const response = await api.get<UserResponse>("/users/profile");
    return response.data;
  }

  /**
   * Obter dados completos do usuário logado
   */
  static async getProfile(): Promise<UserResponse> {
    const response = await api.get<UserResponse>("/users/profile");
    return response.data;
  }

  /**
   * Atualizar perfil do usuário logado
   */
  static async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
  }): Promise<UserResponse> {
    const response = await api.put<{ user: UserResponse }>(
      "/users/profile",
      data
    );
    return response.data.user;
  }

  /**
   * Atualizar imagem de perfil
   */
  static async updateProfileImage(
    file: File
  ): Promise<{ profileImage: string }> {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await api.patch<{ profileImage: string }>(
      "/uploads/profile-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Função para solicitar redefinição de senha
  static async requestPasswordReset(email: string): Promise<void> {
    await api.post("/users/forgot-password", { email });
  }

  // Função para redefinir senha
  static async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/users/reset-password", { token, password });
  }

  // Função para alterar senha do usuário logado
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.patch("/users/profile/password", {
      oldPassword: currentPassword,
      newPassword: newPassword,
    });
  }
}
