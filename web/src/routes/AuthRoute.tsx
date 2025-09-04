import { Route, Routes } from "react-router";

import { AuthLayout } from "../components/layout/AuthLayout";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";
import { NotFound } from "../pages/NotFound";

// Rotas de autenticação (login e cadastro)
export function AuthRoutes() {
  return (
    <Routes>
      {/* Layout de autenticação com rotas aninhadas */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
