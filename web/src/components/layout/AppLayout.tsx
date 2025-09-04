import { Outlet } from "react-router";
import { SideBar } from "./SideBar";

// Layout principal da aplicação com sidebar e área de conteúdo
export function AppLayout() {
  return (
    <div className="w-screen h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar lateral com navegação */}
      <SideBar />

      {/* Área principal de conteúdo com roteamento */}
      <div className="bg-gray-600 rounded-tl-2xl flex-1 px-12 mt-3">
        <Outlet />
      </div>
    </div>
  );
}
