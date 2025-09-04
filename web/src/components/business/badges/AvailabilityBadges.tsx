import { formatAvailabilityBadges } from "../../../utils/availability";

// Interface para props dos badges de disponibilidade
interface AvailabilityBadgesProps {
  availability: string[];
  maxVisible?: number;
  className?: string;
}

// Componente para exibir badges de horários de disponibilidade
export function AvailabilityBadges({
  availability,
  maxVisible = 4,
  className = "",
}: AvailabilityBadgesProps) {
  // Formata horários visíveis e calcula quantidade restante
  const { visible, remaining } = formatAvailabilityBadges(
    availability,
    maxVisible
  );

  return (
    <div className={`flex items-center gap-[4px] ${className}`}>
      {/* Renderiza badges dos horários visíveis */}
      {visible.map((time, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-transparent text-gray-400 text-xs font-bold rounded-full border border-gray-500"
        >
          {time}
        </span>
      ))}
      {/* Badge indicando quantidade de horários restantes */}
      {remaining > 0 && (
        <span className="px-2 py-1 bg-transparent text-gray-400 text-xs font-bold rounded-full border border-gray-500">
          +{remaining}
        </span>
      )}
    </div>
  );
}
