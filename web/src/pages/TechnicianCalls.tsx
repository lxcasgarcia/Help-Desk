import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCalls } from "../contexts/CallsContext";
import { CallsService } from "../services/api/calls";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { Button, ButtonEdit } from "../components/ui/buttons";
import { formatDate, formatCurrency } from "../utils/formatters";
import { getStatusLabel } from "../utils/status";
import type { CallAPIResponse } from "../types/entities/calls";

// Ícones para os status
import ClockIcon from "../assets/icons/status/clock-2.svg?react";
import CheckIcon from "../assets/icons/status/circle-check.svg?react";
import QuestionIcon from "../assets/icons/status/circle-help.svg?react";

// Avatar padrão
import userSvg from "../assets/icons/entities/user.svg";

type CallStatus = "open" | "in_progress" | "closed";

// Interface para props do card de chamado
interface CallCardProps {
  call: CallAPIResponse;
  onStatusChange: (callId: string, newStatus: CallStatus) => void;
}

// Componente de card para exibir informações do chamado
function CallCard({ call, onStatusChange }: CallCardProps) {
  // Função para obter ícone baseado no status
  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case "open":
        return <QuestionIcon className="w-4 h-4 text-feedback-open" />;
      case "in_progress":
        return <ClockIcon className="w-4 h-4 text-feedback-progress" />;
      case "closed":
        return <CheckIcon className="w-4 h-4 text-feedback-done" />;
      default:
        return <QuestionIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Função para obter cor baseada no status
  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case "open":
        return "bg-feedback-open/20 text-feedback-open";
      case "in_progress":
        return "bg-feedback-progress/20 text-feedback-progress";
      case "closed":
        return "bg-feedback-done/20 text-feedback-done";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Função para obter cor do ícone baseada no status
  const getStatusIconColor = (status: CallStatus) => {
    switch (status) {
      case "open":
        return "bg-feedback-open/20 text-feedback-open p-1.5";
      case "in_progress":
        return "bg-feedback-progress/20 text-feedback-progress p-1.5";
      case "closed":
        return "bg-feedback-done/20 text-feedback-done p-1.5";
      default:
        return "bg-gray-500 text-gray-600 p-1.5";
    }
  };

  // Função para obter botão de ação baseado no status
  const getActionButton = (status: CallStatus) => {
    switch (status) {
      case "open":
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStatusChange(call.id, "in_progress")}
            className="flex items-center gap-2 px-2 py-1.5 text-xs"
          >
            <ClockIcon className="w-4 h-4" />
            Iniciar
          </Button>
        );
      case "in_progress":
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStatusChange(call.id, "closed")}
            className="flex items-center gap-2 px-3 py-2 text-sm"
          >
            <CheckIcon className="w-4 h-4" />
            Encerrar
          </Button>
        );
      case "closed":
        return null; // Não mostrar botão se já estiver encerrado
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-600 rounded-lg p-4 border border-gray-500 transition-shadow w-full min-w-0">
      {/* Header com ID e botões de ação */}
      <div className="flex justify-between items-center min-w-0">
        <span className="text-sm font-bold text-gray-400 truncate">
          {call.id.slice(-5).toUpperCase()}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ButtonEdit to={`/calls/${call.id}`} />
          {getActionButton(call.status)}
        </div>
      </div>

      {/* Título e serviço do chamado */}
      <div className="mb-4 mt-1 min-w-0">
        <h3 className="font-bold text-gray-100 text-sm truncate">
          {call.name}
        </h3>
        <p className="text-gray-200 text-xs truncate">
          {call.services?.[0]?.name || "Serviço não especificado"}
        </p>
      </div>

      {/* Data/hora e valor */}
      <div className="flex justify-between items-center mb-4 min-w-0">
        <span className="text-gray-200 text-xs truncate">
          {formatDate(call.createdAt)}
        </span>
        <span className="font-bold text-gray-200 text-sm flex-shrink-0">
          {formatCurrency(call.totalValue)}
        </span>
      </div>

      {/* Footer com cliente e ícone de status */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-500 min-w-0">
        {/* Avatar e nome do cliente */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <img
            src={call.client.profileImage || userSvg}
            alt="Cliente"
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-sm font-bold text-gray-200 truncate">
            {call.client.name}
          </span>
        </div>

        {/* Ícone de status no canto direito */}
        <div
          className={`rounded-full ${getStatusIconColor(
            call.status
          )} flex items-center justify-center flex-shrink-0`}
        >
          {getStatusIcon(call.status)}
        </div>
      </div>
    </div>
  );
}

// Página principal de chamados do técnico
export function TechnicianCalls() {
  const { session } = useAuth();
  const { calls, setCalls, updateCall } = useCalls();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CSS customizado para esconder scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-scroll::-webkit-scrollbar {
        display: none;
      }
      .custom-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Função para buscar chamados do técnico
  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }

      // O backend já filtra automaticamente por técnico quando o usuário logado é técnico
      const response = await CallsService.getAll({
        page: 1,
        limit: 50, // Máximo aceito pelo backend
      });

      // Se não há chamados, definir como array vazio (não é erro)
      setCalls(response.calls || []);
    } catch (err) {
      console.error("Erro ao buscar chamados:", err);

      // Se é um erro de "não encontrado" ou lista vazia, não mostrar erro
      if (err instanceof Error && err.message.includes("não encontrado")) {
        setCalls([]);
        setError(null);
      } else {
        setError("Erro ao carregar chamados");
      }
    } finally {
      setLoading(false);
    }
  };

  // Carrega chamados ao montar o componente
  useEffect(() => {
    fetchCalls();
  }, []);

  // Função para alterar status do chamado
  const handleStatusChange = async (callId: string, newStatus: CallStatus) => {
    try {
      // Atualizar o status na API
      await CallsService.updateStatus(callId, newStatus);

      // Atualizar o contexto com o novo status
      updateCall(callId, { status: newStatus });
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);

      // Verificar se é o erro específico de chamado em andamento
      if (
        err?.response?.data?.message?.includes(
          "já possui um chamado em andamento"
        )
      ) {
        alert(
          "❌ Você já possui um chamado em andamento. Finalize o chamado atual antes de iniciar outro."
        );
      } else {
        // Outros erros
        const errorMessage =
          err?.response?.data?.message || "Erro ao atualizar status do chamado";
        alert(`Erro: ${errorMessage}`);
      }
    }
  };

  // Função para filtrar chamados por status
  const getCallsByStatus = (status: CallStatus) => {
    return calls.filter((call) => call.status === status);
  };

  // Agrupar chamados por status para exibição
  const openCalls = getCallsByStatus("open");
  const inProgressCalls = getCallsByStatus("in_progress");
  const closedCalls = getCallsByStatus("closed");

  // Renderiza estado de carregamento
  if (loading) {
    return (
      <LoadingState title="Meus chamados" message="Carregando chamados..." />
    );
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <ErrorState title="Meus chamados" error={error} onRetry={fetchCalls} />
    );
  }

  // Se não há chamados, mostrar mensagem amigável
  if (!calls || calls.length === 0) {
    return (
      <div className="flex px-12 py-13 flex-col">
        <header className="mb-6">
          <h1 className="text-blue-dark text-xl font-bold">Meus chamados</h1>
        </header>

        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="text-center">
            <h3 className="text-gray-600 text-lg font-semibold mb-2">
              Nenhum chamado encontrado
            </h3>
            <p className="text-gray-400 text-sm">
              Você ainda não possui chamados atribuídos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Configuração dos grupos de status para exibição
  const statusGroups = [
    {
      status: "in_progress" as CallStatus,
      label: "Em atendimento",
      color: "bg-feedback-progress/20 text-feedback-progress",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    {
      status: "open" as CallStatus,
      label: "Aberto",
      color: "bg-feedback-open/20 text-feedback-open",
      icon: <QuestionIcon className="w-4 h-4" />,
    },
    {
      status: "closed" as CallStatus,
      label: "Encerrado",
      color: "bg-feedback-done/20 text-feedback-done",
      icon: <CheckIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex px-12 py-13 flex-col h-screen overflow-hidden">
      {/* Cabeçalho da página */}
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-blue-dark text-xl font-bold">Meus chamados</h1>
      </header>

      {/* Container principal com scroll customizado */}
      <div
        className="space-y-8 pb-20 overflow-y-auto overflow-x-hidden flex-1 custom-scroll min-w-0"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {/* Renderiza grupos de chamados por status */}
        {statusGroups.map(({ status, label, color }) => {
          const statusCalls = getCallsByStatus(status);

          if (statusCalls.length === 0) return null;

          return (
            <div key={status} className="space-y-4">
              {/* Separador visual entre grupos */}
              <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>
              {/* Cabeçalho do grupo com contador */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${color} flex items-center gap-2`}
                >
                  {statusGroups.find((group) => group.status === status)?.icon}
                  {label}
                </span>
                <span className="text-gray-500 text-sm">
                  ({statusCalls.length})
                </span>
              </div>

              {/* Grid de cards de chamados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {statusCalls.map((call) => (
                  <CallCard
                    key={call.id}
                    call={call}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
