import React from "react";
import { Button } from "./Button";

// Interface para props do botão de paginação
type ButtonPaginationProps = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

// Botão de paginação com estilo secundário e tamanho pequeno
export function ButtonPagination({
  onClick,
  disabled = false,
  children,
  className = "",
}: ButtonPaginationProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={`px-3 py-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
