// Função para formatar horário removendo segundos
export function formatTime(time: string): string {
  return time.slice(0, 5); // "08:00:00" -> "08:00"
}
