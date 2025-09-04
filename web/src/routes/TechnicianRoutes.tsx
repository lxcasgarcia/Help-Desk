import { Route, Routes } from "react-router";

import { AppLayout } from "../components/layout/AppLayout";
import { TechnicianCalls } from "../pages/TechnicianCalls";
import { CallDetail } from "../pages/CallDetail";
import { NotFound } from "../pages/NotFound";

// Rotas específicas para usuários técnicos
export function TechnicianRoutes() {
  return (
    <Routes>
      {/* Layout principal da aplicação com rotas aninhadas */}
      <Route path="/" element={<AppLayout />}>
        {/* Página inicial - Lista de chamados do técnico */}
        <Route path="/" element={<TechnicianCalls />} />
        {/* Detalhes de um chamado específico */}
        <Route path="/calls/:id" element={<CallDetail />} />
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
