// Função para formatar data e hora no padrão brasileiro
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Função para formatar valor monetário no padrão brasileiro
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Função para formatar horário removendo segundos
export function formatTime(time: string): string {
  return time.slice(0, 5); // "08:00:00" -> "08:00"
}
