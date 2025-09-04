import { Route, Routes } from "react-router";

import { Call } from "../pages/Call";
import { NotFound } from "../pages/NotFound";
import { AppLayout } from "../components/layout/AppLayout";
import { Technicians } from "../pages/Technicians";
import { Clients } from "../pages/Client";
import { Services } from "../pages/Services";
import { CallDetail } from "../pages/CallDetail";
import { TechnicianCreate } from "../pages/TechnicianCreate";
import { TechnicianDetail } from "../pages/TechnicianDetail";

// Rotas específicas para usuários administradores
export function AdminRoutes() {
  return (
    <Routes>
      {/* Layout principal da aplicação com rotas aninhadas */}
      <Route path="/" element={<AppLayout />}>
        {/* Página inicial - Lista de chamados */}
        <Route path="/" element={<Call />} />
        {/* Detalhes de um chamado específico */}
        <Route path="/calls/:id" element={<CallDetail />} />
        {/* Gerenciamento de técnicos */}
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/technicians/create" element={<TechnicianCreate />} />
        <Route path="/technicians/:id" element={<TechnicianDetail />} />
        {/* Gerenciamento de clientes */}
        <Route path="/clients" element={<Clients />} />
        {/* Gerenciamento de serviços */}
        <Route path="/services" element={<Services />} />
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
