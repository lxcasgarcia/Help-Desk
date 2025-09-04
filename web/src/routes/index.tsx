import { BrowserRouter } from "react-router";
import { AuthRoutes } from "./AuthRoute";
import { AdminRoutes } from "./AdminRoutes";
import { TechnicianRoutes } from "./TechnicianRoutes";
import { ClientRoutes } from "./ClientRoutes";
import { useAuth } from "../hooks/useAuth";

// Componente principal de roteamento da aplicação
export function Routes() {
  const { session, isLoading } = useAuth();

  // Renderiza tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  // Função para determinar qual rota renderizar baseado no role do usuário
  function Route() {
    switch (session?.user.role) {
      case "admin":
        return <AdminRoutes />;
      case "technician":
        return <TechnicianRoutes />;
      case "client":
        return <ClientRoutes />;
      default:
        return <AuthRoutes />;
    }
  }

  return (
    <BrowserRouter>
      <Route />
    </BrowserRouter>
  );
}
