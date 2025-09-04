import React from "react";
import leftSvg from "../../../assets/icons/navigation/Left.svg";
import rightSvg from "../../../assets/icons/navigation/Right.svg";
import { ButtonPagination } from "../buttons";

// Interface para props do componente de paginação
type Props = {
  current: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
};

// Componente de paginação com navegação anterior/próxima
export function Pagination({ current, total, onNext, onPrevious }: Props) {
  return (
    <div className="flex flex-1 justify-center items-center gap-2 mt-[24px]">
      {/* Botão para página anterior */}
      <ButtonPagination onClick={onPrevious} disabled={current === 1}>
        <img src={leftSvg} alt="Ícone de voltar" />
      </ButtonPagination>

      {/* Indicador de página atual/total */}
      <span className="text-sm text-gray-200">
        {current}/{total}
      </span>

      {/* Botão para próxima página */}
      <ButtonPagination onClick={onNext} disabled={current === total}>
        <img src={rightSvg} alt="Ícone de voltar" />
      </ButtonPagination>
    </div>
  );
}
