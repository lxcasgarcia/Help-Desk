// Horários comerciais padrão disponíveis
export const DEFAULT_COMMERCIAL_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

// Função para formatar badges de disponibilidade com limite de exibição
export function formatAvailabilityBadges(
  availability: string[],
  maxVisible: number = 4
): { visible: string[]; remaining: number } {
  if (!availability || availability.length === 0) {
    availability = DEFAULT_COMMERCIAL_HOURS;
  }

  const sortedTimes = [...availability].sort();
  const visibleTimes = sortedTimes.slice(0, maxVisible);
  const remainingCount = Math.max(0, sortedTimes.length - maxVisible);

  return {
    visible: visibleTimes,
    remaining: remainingCount,
  };
}
