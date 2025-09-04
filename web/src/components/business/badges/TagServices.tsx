import newSvg from "../../../assets/icons/status/circle-help.svg";
import infoSvg from "../../../assets/icons/status/clock-2.svg";
import sucessSvg from "../../../assets/icons/status/circle-check.svg";
import dangerSvg from "../../../assets/icons/status/circle-alert.svg";

// Interface para props da tag de serviços
interface TagStatusProps {
  variant?: "active" | "inactive";
  label: string;
}

// Componente para exibir tag de status de serviço
export function TagServices({ variant = "active", label }: TagStatusProps) {
  // Variantes de estilo para diferentes status
  const variants = {
    active: {
      bg: "bg-feedback-done/20",
      text: "text-feedback-done",
    },
    inactive: {
      bg: "bg-feedback-danger/20",
      text: "text-feedback-danger",
    },
  };

  // Seleciona variante atual ou usa padrão
  const currentVariant = variants[variant] || variants.active;

  return (
    <span
      className={`
                inline-flex items-center gap-1.5
                font-bold text-xs
                p-1.5
                rounded-full
                whitespace-nowrap
                max-w-fit
                ${currentVariant.bg}
                ${currentVariant.text}
            `}
    >
      {label}
    </span>
  );
}
