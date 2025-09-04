// Tipos de roles disponíveis para usuários
export type UserAPIRole = "client" | "technician" | "admin";

// Interface para resposta de usuário da API
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserAPIRole;
  profileImage?: string | null;
};

// Interface para resposta de autenticação da API
export type UserAPIResponse = {
  token: string;
  user: UserResponse;
};
