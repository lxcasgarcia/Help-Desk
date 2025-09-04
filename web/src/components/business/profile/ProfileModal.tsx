import CircleUserIcon from "../../../assets/icons/status/circle-user.svg?react";
import LogOutIcon from "../../../assets/icons/entities/log-out.svg?react";
import { Button } from "../../ui/buttons";

// Interface para props do modal de perfil do usuário
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  profileImage?: string | null;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

// Modal de perfil com opções de editar perfil e logout
export function ProfileModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  profileImage,
  onProfileClick,
  onLogoutClick,
}: ProfileModalProps) {
  // Retorna null se o modal não estiver aberto
  if (!isOpen) return null;

  // Função para gerar iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Modal de opções do perfil */}
      <div className="absolute left-full bottom-[20px] ml-[8px] bg-gray-100 rounded-lg shadow-xl z-[9999] w-56">
        {/* Seção de opções do usuário */}
        <div className="p-4">
          <h4 className="text-gray-400 text-xxs font-bold uppercase mb-3 tracking-wide">
            OPÇÕES
          </h4>

          <div className="space-y-1">
            {/* Botão para editar perfil */}
            <Button
              variant="secondary"
              onClick={onProfileClick}
              className="w-full bg-transparent flex items-center gap-3 py-2 text-gray-200 hover:bg-transparent rounded-md transition-colors text-left justify-start"
            >
              <CircleUserIcon className="w-5 h-5 text-gray-500" />
              <span className="text-md text-gray-500">Perfil</span>
            </Button>

            {/* Botão para fazer logout */}
            <Button
              variant="danger"
              onClick={onLogoutClick}
              className="w-full bg-transparent flex items-center gap-3 py-2 text-feedback-danger hover:bg-transparent rounded-md transition-colors text-left justify-start"
            >
              <LogOutIcon className="w-5 h-5 text-feedback-danger" />
              <span className="text-md text-feedback-danger">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
