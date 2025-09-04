import { api } from "./base";
import type { PaginationParams } from "./base";
import type {
  TechniciansPaginationAPIResponse,
  TechnicianAPIResponse,
} from "../../types/entities/technicians";
import type { TechnicianDetailResponse } from "../../types/dtos/responses/technician-detail";
import type { TechnicianCreateData } from "../../types/dtos/requests/technician-create";

// Serviço para operações relacionadas a técnicos
export class TechniciansService {
  private static baseUrl = "/technicians";

  // Função para buscar técnicos com paginação
  static async getAll(
    params?: PaginationParams
  ): Promise<TechniciansPaginationAPIResponse> {
    const response = await api.get<TechniciansPaginationAPIResponse>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  // Função para buscar técnico por ID
  static async getById(id: string): Promise<TechnicianAPIResponse> {
    const response = await api.get<TechnicianAPIResponse>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  // Função para criar novo técnico
  static async create(
    data: TechnicianCreateData
  ): Promise<TechnicianAPIResponse> {
    const response = await api.post<TechnicianAPIResponse>(this.baseUrl, data);
    return response.data;
  }

  // Função para atualizar técnico
  static async update(
    id: string,
    data: Partial<TechnicianDetailResponse>
  ): Promise<TechnicianAPIResponse> {
    const response = await api.put<TechnicianAPIResponse>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  // Função para deletar técnico
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Função para buscar técnicos disponíveis
  static async getAvailable(
    params?: PaginationParams
  ): Promise<TechniciansPaginationAPIResponse> {
    const response = await api.get<TechniciansPaginationAPIResponse>(
      `${this.baseUrl}/available`,
      { params }
    );
    return response.data;
  }
}
