// web/src/components/DeleteConfirmModal.tsx
import { Modal } from "../ui/feedback/Modal";
import { Button } from "../ui/buttons";

// Função para gerar mensagem de aviso baseada no tipo de item
function getWarningMessage(itemType: string): string {
  switch (itemType) {
    case "cliente":
      return "Ao excluir, todos os chamados deste cliente serão removidos e esta ação não poderá ser desfeita.";
    case "técnico":
      return "Ao excluir, o técnico será removido do sistema e esta ação não poderá ser desfeita.";
    case "serviço":
      return "Ao excluir, o serviço será removido do sistema e esta ação não poderá ser desfeita.";
    default:
      return "Esta ação não poderá ser desfeita.";
  }
}

// Interface para props do modal de confirmação de exclusão
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  loading?: boolean;
}

// Modal para confirmar exclusão de itens com avisos específicos
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "cliente",
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full">
        {/* Título do modal */}
        <div className="mb-6">
          <h2 className="text-md font-bold text-gray-200">
            Excluir {itemType}
          </h2>
        </div>

        {/* Linha separadora superior */}
        <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

        {/* Conteúdo com confirmação e aviso */}
        <div className="mb-8">
          <p className="text-gray-200 text-md mb-5">
            Deseja realmente excluir <strong>{itemName}</strong>?
          </p>

          <p className="text-gray-200 text-md">{getWarningMessage(itemType)}</p>
        </div>

        {/* Linha separadora inferior */}
        <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

        {/* Botões de ação (cancelar e confirmar) */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            fullWidth
            onClick={onConfirm}
            disabled={loading}
            isLoading={loading}
          >
            Sim, excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
