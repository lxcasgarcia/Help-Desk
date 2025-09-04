// Tipos de status possíveis para chamados
export type CallStatus = "open" | "in_progress" | "closed";
// Variantes de cor para os badges de status
export type StatusVariant = "new" | "info" | "sucess" | "danger";

// Função para obter a variante de cor baseada no status
export function getStatusVariant(status: CallStatus): StatusVariant {
  const statusMap: Record<CallStatus, StatusVariant> = {
    open: "new",
    in_progress: "info",
    closed: "sucess",
  };
  return statusMap[status] || "new";
}

// Função para obter o label em português do status
export function getStatusLabel(status: CallStatus): string {
  const labelMap: Record<CallStatus, string> = {
    open: "Aberto",
    in_progress: "Em atendimento",
    closed: "Encerrado",
  };
  return labelMap[status] || "Novo";
}

// Função para obter status disponíveis para mudança (excluindo o atual)
export function getAvailableStatuses(currentStatus: CallStatus) {
  const allStatuses = [
    { value: "open", label: "Aberto" },
    { value: "in_progress", label: "Em atendimento" },
    { value: "closed", label: "Encerrado" },
  ];
  return allStatuses.filter((status) => status.value !== currentStatus);
}
