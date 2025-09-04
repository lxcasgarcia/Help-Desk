import userSvg from "../assets/icons/entities/user.svg";
import EyeIcon from "../assets/icons/actions/eye.svg?react";

import { TagStatus } from "../components/business/badges/TagStatus";
import { Pagination } from "../components/ui/navigation/Pagination";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { Button } from "../components/ui/buttons";

import { usePagination } from "../hooks/usePagination";
import { useApi } from "../hooks/useApi";

import { formatDate, formatCurrency } from "../utils/formatters";
import { getStatusVariant, getStatusLabel } from "../utils/status";

import { useEffect } from "react";
import { useNavigate } from "react-router";

import { CallsService } from "../services/api/calls";

import type { CallAPIResponse } from "../types/entities/calls";

// Página de listagem de chamados do cliente
export function ClientCalls() {
  const navigate = useNavigate();
  // Estados para gerenciar os dados da API
  const { page, totalPages, setTotalPages, handlePagination } = usePagination();
  const { data: calls, loading, error, execute } = useApi<CallAPIResponse[]>();

  // Função para buscar os chamados da API
  const fetchCalls = async (pageNum: number) => {
    const response = await CallsService.getAll({ page: pageNum, limit: 10 });
    setTotalPages(response.pagination.totalPages);
    return response.calls;
  };

  // Carrega chamados quando a página muda
  useEffect(() => {
    execute(() => fetchCalls(page));
  }, [page]);

  // Renderiza estado de carregamento
  if (loading) {
    return (
      <LoadingState title="Meus chamados" message="Carregando chamados..." />
    );
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <ErrorState
        title="Meus chamados"
        error={error}
        onRetry={() => execute(() => fetchCalls(page))}
      />
    );
  }

  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Cabeçalho da página */}
      <header className="mb-6">
        <h1 className="text-blue-dark text-xl font-bold">Meus chamados</h1>
      </header>

      {/* Tabela de chamados */}
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-left border border-gray-500 rounded-lg">
          <thead className="border-b border-gray-500">
            <tr>
              <th className="p-3 text-sm font-bold text-gray-400 w-32">
                Atualizado em
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-20">Id</th>
              <th className="p-3 text-sm font-bold text-gray-400 w-64">
                Título
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-40">
                Serviço
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-32">
                Valor total
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-40">
                Técnico
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-24">
                Status
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-22"></th>
            </tr>
          </thead>

          <tbody>
            {/* Mensagem quando não há chamados */}
            {!calls || calls.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Nenhum chamado encontrado
                </td>
              </tr>
            ) : (
              // Lista de chamados do cliente
              calls.map((call) => (
                <tr key={call.id} className="border-b border-gray-500">
                  <td className="p-3 text-xs text-gray-200">
                    {formatDate(call.updatedAt || call.createdAt)}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {call.id.slice(-5).toUpperCase()}
                  </td>
                  <td className="p-3 text-gray-200">
                    {/* Título do chamado */}
                    <h3 className="font-bold text-sm">{call.name}</h3>
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {/* Nome do serviço principal */}
                    {call.services?.[0]?.name || "Serviço não especificado"}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {formatCurrency(call.totalValue)}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {/* Avatar e nome do técnico */}
                    <div className="flex items-center gap-2">
                      <img
                        src={call.technician.profileImage || userSvg}
                        alt="Técnico"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm">{call.technician.name}</span>
                    </div>
                  </td>
                  <td className="p-3 w-24">
                    {/* Tag de status do chamado */}
                    <div className="flex justify-start">
                      <TagStatus
                        variant={getStatusVariant(call.status)}
                        label={getStatusLabel(call.status)}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-200 flex justify-end">
                    {/* Botão para visualizar detalhes do chamado */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/calls/${call.id}`)}
                      className="flex items-center justify-center w-8 h-8"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação da lista */}
      <Pagination
        current={page}
        total={totalPages}
        onNext={() => handlePagination("next")}
        onPrevious={() => handlePagination("previous")}
      />
    </div>
  );
}
