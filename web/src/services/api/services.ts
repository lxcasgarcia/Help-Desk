import { api } from "./base";
import type { PaginationParams } from "./base";
import type {
  ServicesPaginationAPIResponse,
  ServiceAPIResponse,
} from "../../types/entities/services";
import type { ServiceDetailResponse } from "../../types/dtos/responses/service-detail";
import type { ServiceCreateData } from "../../types/dtos/requests/service-create";

// Serviço para operações relacionadas a serviços
export class ServicesService {
  private static baseUrl = "/services";

  // Função para buscar serviços com paginação
  static async getAll(
    params?: PaginationParams
  ): Promise<ServicesPaginationAPIResponse> {
    // Converter limit para perPage para compatibilidade com o backend
    const queryParams: any = params ? { ...params } : undefined;
    if (queryParams && typeof queryParams.limit !== "undefined") {
      queryParams.perPage = queryParams.limit;
      delete queryParams.limit;
    }

    const response = await api.get<ServicesPaginationAPIResponse>(
      this.baseUrl,
      { params: queryParams }
    );
    return response.data;
  }

  // Função para buscar serviço por ID
  static async getById(id: string): Promise<ServiceAPIResponse> {
    const response = await api.get<ServiceAPIResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Função para criar novo serviço
  static async create(data: ServiceCreateData): Promise<ServiceAPIResponse> {
    const response = await api.post<ServiceAPIResponse>(this.baseUrl, data);
    return response.data;
  }

  // Função para atualizar serviço
  static async update(
    id: string,
    data: Partial<ServiceDetailResponse>
  ): Promise<ServiceAPIResponse> {
    const response = await api.put<ServiceAPIResponse>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  // Função para deletar serviço
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Função para alternar status do serviço (ativo/inativo)
  static async toggleStatus(id: string): Promise<ServiceAPIResponse> {
    // Primeiro, buscar o serviço atual para obter o status
    const currentService = await this.getById(id);

    // Fazer a requisição para alterar o status (inverter o valor atual)
    const response = await api.patch<ServiceAPIResponse>(
      `${this.baseUrl}/${id}/status`,
      { active: !currentService.active }
    );
    return response.data;
  }

  // Função para buscar serviços ativos apenas
  static async getActive(
    params?: PaginationParams
  ): Promise<ServicesPaginationAPIResponse> {
    // Converter limit para perPage para compatibilidade com o backend
    const queryParams: any = params ? { ...params } : undefined;
    if (queryParams && typeof queryParams.limit !== "undefined") {
      queryParams.perPage = queryParams.limit;
      delete queryParams.limit;
    }

    const response = await api.get<ServicesPaginationAPIResponse>(
      `${this.baseUrl}/active`,
      { params: queryParams }
    );
    return response.data;
  }
}
