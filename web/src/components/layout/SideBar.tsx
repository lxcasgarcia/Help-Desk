import logoSvg from "../../assets/images/logos/Logo_IconLight.svg";
import userSvg from "../../assets/images/avatar/Avatar.png";
import ClipBoardIcon from "../../assets/icons/entities/clipboard-list.svg?react";
import UsersIcon from "../../assets/icons/entities/users.svg?react";
import WrenchIcon from "../../assets/icons/entities/wrench.svg?react";
import BriefCaseIcon from "../../assets/icons/entities/briefcase-business.svg?react";
import PlusIcon from "../../assets/icons/entities/+.svg?react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ProfileModal } from "../business/profile/ProfileModal";
import { EditProfileModal } from "../business/profile/EditProfileModal";
import { ChangePasswordModal } from "../business/profile/ChangePasswordModal";
import { NavLink } from "react-router";
import { AuthService } from "../../services/api/auth";

// Configuração dos menus por tipo de usuário
const menusByRole = {
  admin: [
    { to: "/", icon: ClipBoardIcon, label: "Chamados" },
    { to: "/technicians", icon: UsersIcon, label: "Técnicos" },
    { to: "/clients", icon: BriefCaseIcon, label: "Clientes" },
    { to: "/services", icon: WrenchIcon, label: "Serviços" },
  ],
  technician: [{ to: "/", icon: ClipBoardIcon, label: "Meus chamados" }],
  client: [
    { to: "/", icon: ClipBoardIcon, label: "Meus chamados" },
    { to: "/create", icon: PlusIcon, label: "Criar chamado" },
  ],
};

// Labels de role para exibição na interface
const roleLabels = {
  admin: "admin",
  technician: "técnico",
  client: "cliente",
};

// Sidebar principal com navegação e perfil do usuário
export function SideBar() {
  const { session, remove, updateSession } = useAuth();
  // Estados para controle dos modais de perfil
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Dados do usuário logado e configuração do menu
  const user = session?.user;
  const userRole = (user?.role || "client") as keyof typeof menusByRole;
  const menuItems = menusByRole[userRole] || menusByRole.client;
  const roleLabel = roleLabels[userRole];

  // Debug: verificar dados do usuário
  console.log("🔍 SideBar - User completo:", user);
  console.log("🔍 SideBar - ProfileImage:", user?.profileImage);
  console.log("🔍 SideBar - ProfileImage existe:", !!user?.profileImage);

  // Função para abrir modal de edição de perfil
  const handleProfileClick = () => {
    setProfileModalOpen(false);
    setEditProfileModalOpen(true);
  };

  // Função para salvar alterações do perfil
  const handleSaveProfile = async (data: {
    name: string;
    email: string;
    password?: string;
    profileImage?: string | null;
  }) => {
    try {
      console.log("Dados do perfil para salvar:", data);

      // Processa upload de nova imagem se fornecida
      if (data.profileImage && data.profileImage.startsWith("data:")) {
        // Converte base64 para File para upload
        const response = await fetch(data.profileImage);
        const blob = await response.blob();
        const file = new File([blob], "profile-image.jpg", {
          type: "image/jpeg",
        });

        // Faz upload da nova imagem
        const uploadResult = await AuthService.updateProfileImage(file);
        console.log("Imagem atualizada:", uploadResult);
      }

      // Atualiza dados básicos do perfil (nome, email, senha)
      const updateData: any = {};
      if (data.name !== user?.name) updateData.name = data.name;
      if (data.email !== user?.email) updateData.email = data.email;
      if (data.password) updateData.password = data.password;

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await AuthService.updateProfile(updateData);
        console.log("Perfil atualizado:", updatedUser);
      }

      // Recarrega dados do usuário e atualiza a sessão
      const freshUserData = await AuthService.getProfile();
      console.log("Dados atualizados do usuário:", freshUserData);

      // Atualiza a sessão com dados frescos
      updateSession(freshUserData);

      // Fecha o modal de edição
      setEditProfileModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  // Função para alterar senha do usuário
  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      // Valida senha atual e define nova senha
      await AuthService.changePassword(currentPassword, newPassword);

      console.log("Senha alterada com sucesso!");
      alert("Senha alterada com sucesso!");

      // Fecha o modal de alterar senha
      setChangePasswordModalOpen(false);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha. Verifique se a senha atual está correta.");
    }
  };

  // Função para fazer logout do usuário
  const handleLogoutClick = () => {
    setProfileModalOpen(false);
    remove();
  };

  return (
    <div className="h-full w-[200px] mt-3 flex flex-col">
      {/* Header da sidebar com logo e role */}
      <div className="flex items-center gap-3 border-b-2 border-gray-200 py-[25px] pl-5">
        <img src={logoSvg} alt="Help Desk" className="w-[44px] h-[44px]" />
        <div className="flex flex-col">
          <h1 className="text-gray-600 font-bold text-lg">HelpDesk</h1>
          <p className="text-blue-light text-xxs font-bold uppercase">
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Menu de navegação principal */}
      <nav className="flex-1 py-6 space-y-2 px-5">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-sm
               ${
                 isActive
                   ? "bg-blue-dark text-gray-600"
                   : "bg-transparent text-gray-400 hover:bg-gray-200 hover:text-gray-500"
               }`
            }
          >
            <item.icon className="w-[20px] h-[20px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Seção de perfil do usuário */}
      <div className="flex border-t-2 border-gray-200 relative">
        <button
          onClick={() => setProfileModalOpen(!profileModalOpen)}
          className="flex gap-3 p-5 w-full hover:bg-gray-200 transition-colors cursor-pointer"
        >
          {/* Avatar do usuário (imagem personalizada ou padrão) */}
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="User"
              className="w-[32px] h-[32px] rounded-full object-cover"
            />
          ) : (
            <img src={userSvg} alt="User" className="w-[32px] h-[32px]" />
          )}
          <div className="flex flex-col justify-start">
            <h2 className="text-gray-600 text-sm text-left">
              {user?.name || "Usuário"}
            </h2>
            <p className="text-gray-400 text-xs text-left">
              {user?.email || "email@exemplo.com"}
            </p>
          </div>
        </button>

        {/* Modal de opções do perfil */}
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          userName={user?.name || "Usuário"}
          userEmail={user?.email || "email@exemplo.com"}
          profileImage={user?.profileImage || null}
          onProfileClick={handleProfileClick}
          onLogoutClick={handleLogoutClick}
        />

        {/* Modal de edição de perfil */}
        <EditProfileModal
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          userName={user?.name || "Usuário"}
          userEmail={user?.email || "email@exemplo.com"}
          profileImage={user?.profileImage || null}
          onSave={handleSaveProfile}
          onOpenChangePassword={() => {
            setEditProfileModalOpen(false);
            setChangePasswordModalOpen(true);
          }}
        />

        {/* Modal de alteração de senha */}
        <ChangePasswordModal
          isOpen={changePasswordModalOpen}
          onClose={() => setChangePasswordModalOpen(false)}
          onChangePassword={handleChangePassword}
        />
      </div>
    </div>
  );
}
