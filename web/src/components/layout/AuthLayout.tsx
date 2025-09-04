import { Outlet } from "react-router";

import logoSvg from "../../assets/images/logos/logo.svg";

// Layout para páginas de autenticação (login/registro)
export function AuthLayout() {
  return (
    <div className="w-screen h-screen bg-[url('assets/images/backgrounds/Login_Background.png')] bg-center bg-cover flex justify-end items-center overflow-hidden">
      {/* Container centralizado com logo e formulário */}
      <div className="bg-gray-600 px-35 pb-30 rounded-tl-md flex items-center flex-col w-full h-full md:max-w-[680px] md:max-h-[781px] mt-3">
        {/* Logo da aplicação */}
        <img src={logoSvg} alt="Help Desk" className="my-10" />

        {/* Área de roteamento para formulários de auth */}
        <Outlet />
      </div>
    </div>
  );
}
