import React from "react";
import { Button } from "./Button";
import TrashIcon from "../../../assets/icons/actions/trash.svg?react";

// Interface para props do botão de exclusão
type ButtonTrashProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

// Botão de exclusão com ícone de lixeira e variante secundária
export function ButtonTrash({
  onClick,
  disabled = false,
  loading = false,
  className = "",
}: ButtonTrashProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={`p-[7px] ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      isLoading={loading}
    >
      <TrashIcon className="w-4 h-4 text-feedback-danger" />
    </Button>
  );
}
