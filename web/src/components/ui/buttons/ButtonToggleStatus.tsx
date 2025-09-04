import React from "react";
import BanIcon from "../../../assets/icons/status/ban.svg?react";
import CircleCheckIcon from "../../../assets/icons/status/circle-check.svg?react";

// Interface para props do botão de toggle de status
interface ButtonToggleStatusProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}

// Botão para alternar status ativo/inativo com ícones e loading
export function ButtonToggleStatus({
  isActive,
  onToggle,
  disabled = false,
  loading = false,
  title,
}: ButtonToggleStatusProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onToggle}
      title={title}
      className="px-3 py-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {/* Renderiza estado de loading, ativo ou inativo */}
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-200">Processando...</span>
        </>
      ) : isActive ? (
        <>
          <BanIcon className="w-4 h-4 text-gray-200" />
          <span className="text-sm text-gray-200">Desativar</span>
        </>
      ) : (
        <>
          <CircleCheckIcon className="w-4 h-4 text-gray-200" />
          <span className="text-sm text-gray-200">Reativar</span>
        </>
      )}
    </button>
  );
}
