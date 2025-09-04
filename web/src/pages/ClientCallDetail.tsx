import ArrowLeftSvg from "../assets/icons/navigation/arrow-left.svg?react";
import ClientImage from "../assets/images/avatar/Avatar.png";

import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { TagStatus } from "../components/business/badges/TagStatus";
import { Button } from "../components/ui/buttons";

import { useApi } from "../hooks/useApi";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { CallsService } from "../services/api/calls";
import type { CallDetailAPIResponse } from "../types/dtos/responses/call-detail";

import { formatDate, formatCurrency } from "../utils/formatters";
import { getStatusVariant, getStatusLabel } from "../utils/status";

// Página de detalhes do chamado para clientes
export function ClientCallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: call,
    loading,
    error,
    execute,
  } = useApi<CallDetailAPIResponse["call"]>();

  // Função para buscar detalhes do chamado
  const fetchCallDetail = async () => {
    if (!id) throw new Error("ID do chamado não encontrado");

    const response = await CallsService.getById(id);
    return response.call;
  };

  // Carrega detalhes do chamado quando o ID muda
  useEffect(() => {
    if (id) {
      execute(fetchCallDetail);
    }
  }, [id]);

  // Renderiza estado de carregamento
  if (loading) {
    return (
      <LoadingState
        title="Detalhes do chamado"
        message="Carregando chamado..."
      />
    );
  }

  // Renderiza estado de erro
  if (error || !call) {
    return (
      <ErrorState
        title="Detalhes do chamado"
        error={error || "Chamado não encontrado"}
        onRetry={() => execute(fetchCallDetail)}
      />
    );
  }

  return (
    <div className="flex px-[183px] py-[56px] flex-col min-h-screen overflow-y-auto pb-20">
      {/* Cabeçalho da página com botão de voltar */}
      <header className="mb-6 flex items-center justify-between max-w-[800px]">
        <div>
          {/* Botão de voltar */}
          <button
            onClick={() => navigate(-1)}
            className="bg-transparent text-gray-300 p-[2px] flex gap-2 items-center"
          >
            <ArrowLeftSvg className="w-[14px] h-[14px]" />
            <span className="text-xs text-gray-300 font-bold">Voltar</span>
          </button>

          <h1 className="text-blue-dark text-xl font-bold">
            Chamado detalhado
          </h1>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Card de informações do chamado */}
        <div className="p-6 border border-gray-500 rounded-lg max-w-[480px] w-full flex flex-col gap-[20px]">
          <div>
            <header>
              <div className="flex items-center justify-between">
                {/* ID do chamado */}
                <h3 className="text-gray-300 text-xs font-bold">
                  {call.id.slice(-5).toUpperCase()}
                </h3>

                {/* Tag de status */}
                <TagStatus
                  variant={getStatusVariant(call.status)}
                  label={getStatusLabel(call.status)}
                />
              </div>

              <h2 className="text-gray-200 text-md font-bold">{call.name}</h2>
            </header>
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold">Descrição</h3>
            <p className="text-gray-200 text-sm">{call.description}</p>
          </div>

          <div>
            <h3 className="text-gray-400 text-xs font-bold">Categoria</h3>
            <p className="text-gray-200 text-sm">
              {call.services[0]?.name || "Não especificado"}
            </p>
          </div>

          {/* Datas de criação e atualização */}
          <div className="flex gap-22">
            <div>
              <h3 className="text-gray-400 text-xs font-bold">Criado em</h3>
              <p className="text-gray-200 text-sm">
                {formatDate(call.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs font-bold">Atualizado em</h3>
              <p className="text-gray-200 text-sm">
                {call.updatedAt
                  ? formatDate(call.updatedAt)
                  : "Nunca foi atualizado"}
              </p>
            </div>
          </div>
        </div>

        {/* Card de informações do técnico e valores */}
        <div className="p-6 border border-gray-500 rounded-lg max-w-[296px] w-full flex flex-col gap-[32px]">
          <div className="mb-[32px]">
            <header>
              <h3 className="text-gray-400 text-xs font-bold">
                Técnico responsável
              </h3>
              {/* Avatar e informações do técnico */}
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={call.technician.profileImage || ClientImage}
                  alt=""
                  className="w-[32px] h-[32px] rounded-full object-cover"
                />
                <div>
                  <h1 className="text-gray-200 text-sm">
                    {call.technician.name}
                  </h1>
                  <p className="text-gray-300 text-xs">
                    {call.technician.email}
                  </p>
                </div>
              </div>
            </header>
          </div>

          {/* Seção de valores e custos */}
          <div className="flex flex-col gap-[16px]">
            {/* Preço base do serviço */}
            <div className="flex flex-col gap-[8px]">
              <h3 className="text-gray-400 text-xs font-bold">Valores</h3>
              <div className="flex items-center justify-between">
                <p className="text-gray-200 text-sm">Preço base</p>
                <p className="text-gray-200 text-sm">
                  {formatCurrency(call.services[0]?.assignedValue || 0)}
                </p>
              </div>
            </div>

            {/* Serviços adicionais */}
            <div className="flex flex-col gap-[8px]">
              <h3 className="text-gray-400 text-xs font-bold">Adicionais</h3>
              {call.services.slice(1).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between"
                >
                  <p className="text-gray-200 text-sm">{service.name}</p>
                  <p className="text-gray-200 text-sm">
                    {formatCurrency(service.assignedValue || 0)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total do chamado */}
            <div className="flex items-center justify-between pt-[12px] border-t border-gray-500">
              <h1 className="text-gray-200 text-sm font-bold">Total</h1>
              <h1 className="text-gray-200 text-sm font-bold">
                {formatCurrency(call.totalValue)}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
