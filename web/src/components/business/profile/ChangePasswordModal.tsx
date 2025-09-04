import { useState } from "react";
import ArrowLeftIcon from "../../../assets/icons/navigation/arrow-left.svg?react";
import XIcon from "../../../assets/icons/actions/x.svg?react";
import { Input } from "../../ui/forms/Input";
import { Button } from "../../ui/buttons";

// Interface para props do modal de alteração de senha
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => void;
}

// Modal para alteração de senha do usuário
export function ChangePasswordModal({
  isOpen,
  onClose,
  onChangePassword,
}: ChangePasswordModalProps) {
  // Estados para senha atual e nova senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  console.log("🔍 ChangePasswordModal - isOpen:", isOpen);
  console.log("🔍 ChangePasswordModal - Renderizando...");

  // Retorna null se o modal não estiver aberto
  if (!isOpen) {
    console.log("🔍 ChangePasswordModal - Não está aberto, retornando null");
    return null;
  }

  // Função para salvar alteração de senha
  const handleSave = () => {
    if (currentPassword.trim() && newPassword.trim()) {
      onChangePassword(currentPassword, newPassword);
      handleClose();
    }
  };

  // Função para fechar modal e limpar estados
  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-200/50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[440px]">
        {/* Header do modal com botão voltar e fechar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h3 className="text-gray-200 font-bold text-md">Alterar senha</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-gray-400 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo do modal com campos de senha */}
        <div className="p-6 gap-4">
          {/* Campo para senha atual */}
          <div className="space-y-2">
            <Input
              variant="minimal"
              legend="SENHA ATUAL"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
            />
          </div>

          {/* Campo para nova senha com validação */}
          <div>
            <Input
              variant="minimal"
              legend="NOVA SENHA"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
            />
            <p className="text-xs text-gray-400 italic">Mínimo de 6 dígitos</p>
          </div>
        </div>

        {/* Footer do modal com botão de salvar */}
        <div className="px-6 py-4 border-t border-gray-500">
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={!currentPassword.trim() || !newPassword.trim()}
            size="md"
            className="text-sm font-normal"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
