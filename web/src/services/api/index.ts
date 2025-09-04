// Exportar a instância base do axios
export { api } from "./base";

// Exportar todos os serviços da aplicação
export { ClientsService } from "./clients";
export { ServicesService } from "./services";
export { TechniciansService } from "./technicians";
export { CallsService } from "./calls";
export { AuthService } from "./auth";

// Exportar tipos base para paginação
export type { PaginationParams, PaginationResponse } from "./base";

// Exportar tipos de autenticação
export type { LoginRequest, LoginResponse, RegisterRequest } from "./auth";
