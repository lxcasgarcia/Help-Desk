import { Route, Routes } from "react-router";

import { NotFound } from "../pages/NotFound";
import { AppLayout } from "../components/layout/AppLayout";
import { ClientCalls } from "../pages/ClientCalls";
import { ClientCreateCall } from "../pages/ClientCreateCall";
import { ClientCallDetail } from "../pages/ClientCallDetail";

// Rotas específicas para usuários clientes
export function ClientRoutes() {
  return (
    <Routes>
      {/* Layout principal da aplicação com rotas aninhadas */}
      <Route path="/" element={<AppLayout />}>
        {/* Página inicial - Lista de chamados do cliente */}
        <Route path="/" element={<ClientCalls />} />
        {/* Criação de novo chamado */}
        <Route path="/create" element={<ClientCreateCall />} />
        {/* Detalhes de um chamado específico */}
        <Route path="/calls/:id" element={<ClientCallDetail />} />
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
