import newSvg from "../../../assets/icons/status/circle-help.svg?react";
import infoSvg from "../../../assets/icons/status/clock-2.svg?react";
import sucessSvg from "../../../assets/icons/status/circle-check.svg?react";
import dangerSvg from "../../../assets/icons/status/circle-alert.svg?react";

// Interface para props da tag de status
interface TagStatusProps {
  variant?: "new" | "info" | "sucess" | "danger";
  label: string;
}

// Componente para exibir tag de status com ícone e cores
export function TagStatus({ variant = "info", label }: TagStatusProps) {
  // Variantes de estilo para diferentes tipos de status
  const variants = {
    new: {
      bg: "bg-feedback-open/20",
      text: "text-feedback-open",
      icon: newSvg,
    },
    info: {
      bg: "bg-feedback-progress/20",
      text: "text-feedback-progress",
      icon: infoSvg,
    },
    sucess: {
      bg: "bg-feedback-done/20",
      text: "text-feedback-done",
      icon: sucessSvg,
    },
    danger: {
      bg: "bg-feedback-danger/20",
      text: "text-feedback-danger",
      icon: dangerSvg,
    },
  };

  // Seleciona variante atual ou usa padrão
  const currentVariant = variants[variant] || variants.info;
  const IconComponent = currentVariant.icon;

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
      {/* Ícone do status com cor correspondente */}
      <IconComponent className={`w-4 h-4 ${currentVariant.text}`} />
      {label}
    </span>
  );
}
