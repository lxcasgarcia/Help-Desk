import React from "react";

// Tipos para variantes e tamanhos do botão
type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

// Interface para props do componente Button
type Props = React.ComponentProps<"button"> & {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

// Componente Button reutilizável com variantes e estados
export function Button({
  children,
  isLoading,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className = "",
  ...rest
}: Props) {
  // Classes base para todos os botões
  const baseClasses =
    "font-bold flex items-center justify-center rounded-lg cursor-pointer transition ease-linear disabled:opacity-50 disabled:cursor-not-allowed";

  // Classes específicas para cada variante de cor
  const variantClasses = {
    primary: "bg-gray-200 text-gray-600 hover:bg-gray-100 font-sm font-normal",
    secondary:
      "bg-gray-500 text-gray-200 hover:bg-gray-400 font-sm font-normal",
    danger: "bg-red-500 text-white hover:bg-red-600 font-sm font-normal",
    success: "bg-green-500 text-white hover:bg-green-600 font-sm font-normal",
  };

  // Classes específicas para cada tamanho
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };

  // Classe para largura total (opcional)
  const widthClass = fullWidth ? "w-full" : "";

  // Combina todas as classes em uma string
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} disabled={isLoading} className={classes} {...rest}>
      {/* Renderiza spinner de loading ou conteúdo normal */}
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
