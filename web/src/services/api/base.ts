import axios from "axios";

// Instância base do axios para comunicação com a API
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://help-desk-1-qfgm.onrender.com",
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@helpdesk:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro da API:", error.response || error);
    return Promise.reject(error);
  }
);

// Tipos base para respostas paginadas
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
