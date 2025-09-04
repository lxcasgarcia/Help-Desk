import React from "react";
import { Button } from "./Button";
import PenLineIcon from "../../../assets/icons/actions/pen-line.svg";

// Interface para props do botão de edição
type ButtonEditProps = {
  to?: string;
  onClick?: () => void;
  className?: string;
};

// Botão de edição com ícone de caneta e variante secundária
export function ButtonEdit({ to, onClick, className = "" }: ButtonEditProps) {
  // Função para lidar com clique (onClick ou navegação)
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      window.location.href = to;
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      className={`p-[7px] ${className}`}
      onClick={handleClick}
    >
      <img src={PenLineIcon} alt="Editar" className="w-4 h-4" />
    </Button>
  );
}
