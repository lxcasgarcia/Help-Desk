import { api } from "./base";
import type { PaginationParams, PaginationResponse } from "./base";
import type {
  ClientsPaginationAPIResponse,
  ClientAPIResponse,
} from "../../types/entities/clients";
import type { ClientDetailResponse } from "../../types/dtos/responses/client-detail";

// Serviço para operações relacionadas a clientes
export class ClientsService {
  private static baseUrl = "/clients";

  // Função para buscar clientes com paginação
  static async getAll(
    params?: PaginationParams
  ): Promise<ClientsPaginationAPIResponse> {
    const response = await api.get<ClientsPaginationAPIResponse>(this.baseUrl, {
      params,
    });
    return response.data;
  }

  // Função para buscar cliente por ID
  static async getById(id: string): Promise<ClientAPIResponse> {
    const response = await api.get<ClientAPIResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Função para criar novo cliente
  static async create(
    data: Omit<ClientDetailResponse, "id">
  ): Promise<ClientAPIResponse> {
    const response = await api.post<ClientAPIResponse>(this.baseUrl, data);
    return response.data;
  }

  // Função para atualizar cliente
  static async update(
    id: string,
    data: Partial<ClientDetailResponse>
  ): Promise<ClientAPIResponse> {
    const response = await api.put<ClientAPIResponse>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  // Função para deletar cliente
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Função para buscar clientes por nome (busca)
  static async search(
    query: string,
    params?: PaginationParams
  ): Promise<ClientsPaginationAPIResponse> {
    const response = await api.get<ClientsPaginationAPIResponse>(
      `${this.baseUrl}/search`,
      {
        params: { q: query, ...params },
      }
    );
    return response.data;
  }
}
