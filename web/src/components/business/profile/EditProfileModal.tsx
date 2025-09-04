import { useState } from "react";
import XIcon from "../../../assets/icons/actions/x.svg?react";
import UploadIcon from "../../../assets/icons/actions/upload.svg?react";
import TrashIcon from "../../../assets/icons/actions/trash.svg?react";
import { Input } from "../../ui/forms/Input";
import { Button } from "../../ui/buttons";

// Interface para props do modal de edição de perfil
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  profileImage?: string | null;
  onSave: (data: {
    name: string;
    email: string;
    profileImage?: string | null;
  }) => void;
  onOpenChangePassword: () => void;
}

// Modal para edição de informações do perfil do usuário
export function EditProfileModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  profileImage,
  onSave,
  onOpenChangePassword,
}: EditProfileModalProps) {
  // Estados para campos editáveis do perfil
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  // Estado para controle de imagem de perfil
  const [originalProfileImage] = useState<string | null>(profileImage || null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(
    profileImage || null
  );
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // Função para fechar modal e resetar estados
  const handleClose = () => {
    setName(userName);
    setEmail(userEmail);
    setCurrentProfileImage(profileImage || null);
    setHasImageChanged(false);
    onClose();
  };

  // Retorna null se o modal não estiver aberto
  if (!isOpen) return null;

  // Função para salvar alterações do perfil
  const handleSave = () => {
    const data = {
      name,
      email,
      // Só enviar profileImage se ela foi alterada
      ...(hasImageChanged && { profileImage: currentProfileImage }),
    };
    onSave(data);
    handleClose();
  };

  // Função para abrir modal de alteração de senha
  const handleTogglePasswordEdit = () => {
    onOpenChangePassword();
  };

  // Função para fazer upload de nova imagem de perfil
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentProfileImage(e.target?.result as string);
        setHasImageChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para remover imagem alterada e restaurar original
  const handleRemoveImage = () => {
    setCurrentProfileImage(originalProfileImage);
    setHasImageChanged(false);
  };

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
      <div
        className="fixed inset-0 bg-gray-200/50 z-[9998] flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Modal de edição de perfil */}
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[440px] z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do modal com título e botão fechar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-500">
            <h2 className="text-gray-200 font-bold text-md">Perfil</h2>
            <button
              onClick={handleClose}
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Conteúdo do modal com campos editáveis */}
          <div className="p-6 space-y-5">
            {/* Seção de imagem de perfil com upload */}
            <div className="flex gap-[12px] items-center space-y-4">
              <div className="relative">
                {currentProfileImage ? (
                  <img
                    src={currentProfileImage}
                    alt="Profile"
                    className="w-[48px] h-[48px] rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[48px] h-[48px] rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(name)}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* Botão para upload de nova imagem */}
                <label className="flex items-center space-x-2 text-gray-300 font-bold hover:text-gray-200 cursor-pointer text-xs hover:bg-gray-500 rounded-md px-2 py-1.5">
                  <UploadIcon className="w-[14px] h-[14px]" />
                  <span>Nova imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Botão para remover imagem alterada */}
                {hasImageChanged && (
                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                    title="Restaurar imagem anterior"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Campos do formulário */}
            <div className="space-y-4">
              {/* Campo para editar nome */}
              <div>
                <Input
                  variant="minimal"
                  legend="NOME"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Campo para editar email */}
              <div>
                <Input
                  variant="minimal"
                  legend="E-MAIL"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Campo de senha com botão para alterar */}
              <div>
                <div className="relative">
                  <Input
                    variant="minimal"
                    legend="SENHA"
                    name="password"
                    type="text"
                    value="••••••••"
                    disabled={true}
                    placeholder="••••••••"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={handleTogglePasswordEdit}
                    className="absolute right-0 top-7 px-2 py-1.5 text-xs"
                  >
                    Alterar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer do modal com botão de salvar */}
          <div className="px-6 py-4 border-t border-gray-500">
            <Button variant="primary" fullWidth onClick={handleSave} size="lg">
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
