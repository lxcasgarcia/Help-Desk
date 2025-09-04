import type { ReactNode } from "react";
import X from "../../../assets/icons/actions/x.svg?react";
import { Button } from "../buttons";

// Interface para props do componente Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Modal reutilizável com overlay e botão de fechar
export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Retorna null se o modal não estiver aberto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100/50 flex items-center justify-center z-50">
      {/* Container do modal com posicionamento relativo */}
      <div className="bg-gray-600 rounded-lg px-[28px] py-[24px] w-full max-w-[520px] mx-4 relative">
        {/* Botão de fechar no canto superior direito */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="absolute top-7 right-6 text-gray-300 hover:text-gray-200 text-xl font-bold flex items-center justify-center p-0 bg-transparent border-none"
        >
          <X className="w-[18px] h-[18px]" />
        </Button>
        {/* Conteúdo do modal */}
        {children}
      </div>
    </div>
  );
}
