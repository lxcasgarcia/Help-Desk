import ArrowLeftSvg from "../assets/icons/navigation/arrow-left.svg?react";
import ClientImage from "../assets/images/avatar/Avatar.png";
import Check from "../assets/icons/status/circle-check.svg?react";
import Clock from "../assets/icons/status/clock-2.svg?react";
import CircleHelp from "../assets/icons/status/circle-help.svg?react";
import Trash from "../assets/icons/actions/trash.svg?react";
import Plus from "../assets/icons/entities/+.svg?react";

import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { TagStatus } from "../components/business/badges/TagStatus";
import { Input } from "../components/ui/forms/Input";
import { Button } from "../components/ui/buttons";

import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useCalls } from "../contexts/CallsContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { CallsService } from "../services/api/calls";
import type { CallDetailAPIResponse } from "../types/dtos/responses/call-detail";
import { AxiosError } from "axios";

import { formatDate, formatCurrency } from "../utils/formatters";
import { getStatusVariant, getStatusLabel } from "../utils/status";

// Página de detalhes completos do chamado
export function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { updateCall } = useCalls();
  const {
    data: call,
    loading,
    error,
    execute,
    setData: setCall,
  } = useApi<CallDetailAPIResponse["call"]>();

  // Estados para controle de operações
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [additionalServices, setAdditionalServices] = useState<
    Array<{
      id: string;
      name: string;
      assignedValue: number;
    }>
  >([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceValue, setNewServiceValue] = useState("");

  // Verificar se o usuário é técnico
  const isTechnician = session?.user?.role === "technician";

  // Função para buscar detalhes do chamado
  const fetchCallDetail = async () => {
    if (!id) throw new Error("ID do chamado não encontrado");

    const response = await CallsService.getById(id);
    return response.call;
  };

  // Função para alterar status do chamado
  async function handleStatusChange(
    newStatus: "open" | "in_progress" | "closed"
  ) {
    if (!id || !call) return;

    try {
      setUpdatingStatus(true);

      await CallsService.updateStatus(id, newStatus);
      // Atualiza o estado local com o novo status
      setCall((prev) =>
        prev
          ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() }
          : null
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data?.message || "Erro ao atualizar status");
      } else {
        alert("Erro inesperado ao atualizar status");
      }
      console.error("Erro ao atualizar status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Carrega detalhes do chamado quando o ID muda
  useEffect(() => {
    if (id) {
      execute(fetchCallDetail);
    }
  }, [id]);

  // Função para obter status disponíveis baseado no status atual
  function getAvailableStatuses(currentStatus: string) {
    // Para técnicos, mostrar apenas opções relevantes baseadas no status atual
    if (currentStatus === "open") {
      return [
        {
          value: "closed",
          label: "Encerrar",
          icon: Check,
          className: "bg-gray-500 hover:bg-gray-400 text-gray-200",
        },
        {
          value: "in_progress",
          label: "Iniciar atendimento",
          icon: Clock,
          className: "bg-gray-200 hover:bg-gray-100 text-gray-600",
        },
      ];
    } else if (currentStatus === "in_progress") {
      return [
        {
          value: "closed",
          label: "Encerrar",
          icon: Check,
          className: "bg-gray-500 hover:bg-gray-400 text-gray-200",
        },
      ];
    } else if (currentStatus === "closed") {
      return []; // Não mostrar opções se já estiver encerrado
    }

    // Fallback para outros casos
    const allStatuses = [
      {
        value: "open",
        label: "Aberto",
        icon: CircleHelp,
        className: "bg-gray-200 hover:bg-gray-100 text-gray-600",
      },
      {
        value: "in_progress",
        label: "Em atendimento",
        icon: Clock,
        className: "bg-gray-200 hover:bg-gray-100 text-gray-600",
      },
      {
        value: "closed",
        label: "Encerrado",
        icon: Check,
        className: "bg-gray-200 hover:bg-gray-100 text-gray-600",
      },
    ];

    return allStatuses.filter((status) => status.value !== currentStatus);
  }

  // Funções para gerenciar serviços adicionais (apenas para técnicos)
  const handleAddService = async () => {
    if (!newServiceName.trim() || !newServiceValue.trim()) return;

    const value = parseFloat(
      newServiceValue.replace(/[^\d,]/g, "").replace(",", ".")
    );
    if (isNaN(value)) return;

    const newService = {
      id: Date.now().toString(), // ID temporário
      name: newServiceName.trim(),
      assignedValue: value,
    };

    try {
      // Salvar no backend
      const updatedCall = await CallsService.updateAdditionalServices(id!, [
        ...additionalServices,
        newService,
      ]);

      // Atualizar estado local
      setCall(updatedCall.call);
      setAdditionalServices([...additionalServices, newService]);

      // Atualizar o contexto para sincronizar com a página de chamados
      if (id) {
        const newTotalValue =
          (updatedCall.call.services[0]?.assignedValue || 0) +
          [...additionalServices, newService].reduce(
            (sum, service) => sum + service.assignedValue,
            0
          );

        updateCall(id, { totalValue: newTotalValue });
      }

      setNewServiceName("");
      setNewServiceValue("");
      setShowAddServiceModal(false);
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      alert("Erro ao adicionar serviço. Tente novamente.");
    }
  };

  // Função para remover serviço adicional
  const handleRemoveService = async (serviceId: string) => {
    try {
      const updatedServices = additionalServices.filter(
        (service) => service.id !== serviceId
      );

      // Salvar no backend
      const updatedCall = await CallsService.updateAdditionalServices(
        id!,
        updatedServices
      );

      // Atualizar estado local
      setCall(updatedCall.call);
      setAdditionalServices(updatedServices);

      // Atualizar o contexto para sincronizar com a página de chamados
      if (id) {
        const newTotalValue =
          (updatedCall.call.services[0]?.assignedValue || 0) +
          updatedServices.reduce(
            (sum, service) => sum + service.assignedValue,
            0
          );

        updateCall(id, { totalValue: newTotalValue });
      }
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      alert("Erro ao remover serviço. Tente novamente.");
    }
  };

  // Inicializar serviços adicionais com os serviços existentes (exceto o primeiro)
  useEffect(() => {
    if (call && call.services.length > 1) {
      // Os serviços já vêm no formato correto, apenas pegar os adicionais (exceto o primeiro)
      setAdditionalServices(call.services.slice(1));
    } else {
      setAdditionalServices([]);
    }
  }, [call]);

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
      {/* Cabeçalho da página com botões de ação */}
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

        {/* Botões de alteração de status */}
        <div className="flex gap-2">
          {getAvailableStatuses(call.status).map((status) => {
            const IconComponent = status.icon;
            return (
              <button
                key={status.value}
                onClick={() =>
                  handleStatusChange(
                    status.value as "open" | "in_progress" | "closed"
                  )
                }
                disabled={updatingStatus}
                className={`flex items-center gap-2 px-[16px] py-[10px] rounded-lg disabled:opacity-50 transition-colors ${status.className}`}
              >
                {IconComponent && (
                  <IconComponent className="w-[18px] h-[18px]" />
                )}
                <p className="text-sm font-bold">
                  {updatingStatus ? "Atualizando..." : status.label}
                </p>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex gap-6">
        {/* Coluna esquerda - Informações do chamado */}
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

          {/* Informações do cliente */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-gray-400 text-xs font-bold">Cliente</h3>
            <div className="flex items-center gap-2">
              <img
                src={call.client.profileImage || ClientImage}
                alt=""
                className="w-[20px] h-[20px] rounded-full object-cover"
              />
              <p className="text-gray-200 text-sm">{call.client.name}</p>
            </div>
          </div>
        </div>

        {/* Coluna direita - Técnico e valores */}
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
              {additionalServices.map((service) => (
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
                {formatCurrency(
                  (call.services[0]?.assignedValue || 0) +
                    additionalServices.reduce(
                      (sum, service) => sum + service.assignedValue,
                      0
                    )
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {/* Seção de Serviços Adicionais - Apenas para técnicos */}
        {isTechnician && (
          <div className="p-6 border border-gray-500 rounded-lg max-w-[480px] w-full flex flex-col gap-[20px]">
            {/* Cabeçalho com botão de adicionar */}
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-xs font-bold">
                Serviços adicionais
              </h3>
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="w-8 h-8 bg-gray-200 text-gray-600 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de serviços adicionais */}
            <div className="max-h-[400px] overflow-y-auto pr-2">
              {additionalServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between mb-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-gray-200 text-xs font-bold">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-gray-200 text-xs">
                      {formatCurrency(service.assignedValue)}
                    </span>

                    {/* Botão de remover serviço */}
                    <button
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-400 bg-gray-500 p-[7px] rounded-md"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Mensagem quando não há serviços adicionais */}
              {additionalServices.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Nenhum serviço adicional
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para adicionar serviço adicional */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-gray-100/50 flex items-center justify-center z-50">
          <div className="bg-gray-600 rounded-lg p-6 max-w-[440px] w-full">
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-200 text-md font-bold">
                Serviço adicional
              </h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Separador visual */}
            <div className="-mx-[24px] border-t border-gray-500 mb-6"></div>

            {/* Campos do formulário */}
            <div className="space-y-4">
              <div>
                <Input
                  variant="minimal"
                  legend="DESCRIÇÃO"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Nome do serviço"
                />
              </div>

              <div>
                <Input
                  variant="minimal"
                  legend="VALOR"
                  value={newServiceValue}
                  onChange={(e) => setNewServiceValue(e.target.value)}
                  placeholder="Valor do serviço"
                />
              </div>
            </div>

            {/* Botão de salvar */}
            <div className="mt-6">
              <button
                onClick={handleAddService}
                className="w-full text-sm bg-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
