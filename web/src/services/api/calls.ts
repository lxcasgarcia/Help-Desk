import { api } from "./base";
import type { PaginationParams } from "./base";
import type {
  CallsPaginationAPIResponse,
  CallAPIResponse,
} from "../../types/entities/calls";
import type { CallDetailAPIResponse } from "../../types/dtos/responses/call-detail";

// Serviço para operações relacionadas a chamados
export class CallsService {
  private static baseUrl = "/calls";

  // Função para buscar chamados com paginação
  static async getAll(
    params?: PaginationParams
  ): Promise<CallsPaginationAPIResponse> {
    // Backend espera o parâmetro 'perPage'. Se vier 'limit', convertemos.
    const queryParams: Record<string, any> | undefined = params
      ? { ...params }
      : undefined;
    if (queryParams && typeof queryParams.limit !== "undefined") {
      queryParams.perPage = queryParams.limit;
      delete queryParams.limit;
    }

    const response = await api.get<CallsPaginationAPIResponse>(this.baseUrl, {
      params: queryParams,
    });
    return response.data;
  }

  // Função para buscar chamado por ID
  static async getById(id: string): Promise<CallDetailAPIResponse> {
    const response = await api.get<CallDetailAPIResponse>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  // Função para criar novo chamado
  static async create(data: {
    name: string;
    description: string;
    serviceIds: string[];
  }): Promise<CallAPIResponse> {
    const response = await api.post<CallAPIResponse>(this.baseUrl, data);
    return response.data;
  }

  // Função para atualizar chamado
  static async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      technicianId?: string;
    }
  ): Promise<CallAPIResponse> {
    const response = await api.put<CallAPIResponse>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  // Função para deletar chamado
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Função para atualizar status do chamado
  static async updateStatus(
    id: string,
    status: "open" | "in_progress" | "closed"
  ): Promise<CallAPIResponse> {
    const response = await api.patch<CallAPIResponse>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
    return response.data;
  }

  // Função para atribuir técnico ao chamado
  static async assignTechnician(
    id: string,
    technicianId: string
  ): Promise<CallAPIResponse> {
    const response = await api.patch<CallAPIResponse>(
      `${this.baseUrl}/${id}/assign`,
      { technicianId }
    );
    return response.data;
  }

  // Função para buscar chamados por cliente
  static async getByClient(
    clientId: string,
    params?: PaginationParams
  ): Promise<CallsPaginationAPIResponse> {
    const response = await api.get<CallsPaginationAPIResponse>(
      `${this.baseUrl}/client/${clientId}`,
      { params }
    );
    return response.data;
  }

  // Função para buscar chamados por técnico
  static async getByTechnician(
    technicianId: string,
    params?: PaginationParams
  ): Promise<CallsPaginationAPIResponse> {
    const response = await api.get<CallsPaginationAPIResponse>(
      `${this.baseUrl}/technician/${technicianId}`,
      { params }
    );
    return response.data;
  }

  // Função para atualizar serviços adicionais do chamado
  static async updateAdditionalServices(
    id: string,
    additionalServices: Array<{
      id: string;
      name: string;
      assignedValue: number;
    }>
  ): Promise<CallDetailAPIResponse> {
    const response = await api.patch<CallDetailAPIResponse>(
      `${this.baseUrl}/${id}/additional-services`,
      { additionalServices }
    );
    return response.data;
  }

  // Função para verificar disponibilidade de técnicos
  static async checkAvailability(): Promise<any> {
    const response = await api.get("/calls/availability");
    return response.data;
  }
}
