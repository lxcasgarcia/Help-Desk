import { createContext, type ReactNode } from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api/base";
import { AuthService } from "../services/api/auth";
import type { UserAPIResponse } from "../types/entities/user";

// Interface de dados expostos pelo AuthContext
type AuthContext = {
  isLoading: boolean;
  session: null | UserAPIResponse;
  save: (data: UserAPIResponse) => void;
  updateSession: (userData: any) => void;
  remove: () => void;
};

// Chave base para o localStorage
const LOCAL_STORAGE_KEY = "@helpdesk";

// Contexto de autenticação da aplicação
export const AuthContext = createContext({} as AuthContext);

// Provider para encapsular autenticação e sessão
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<null | UserAPIResponse>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Salva token, configura header e sincroniza sessão com dados frescos
  async function save(data: UserAPIResponse) {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}:token`, data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    try {
      // Busca dados completos do usuário após login
      const freshUserData = await AuthService.getProfile();

      const completeSession = {
        token: data.token,
        user: freshUserData,
      };

      // Persiste usuário completo no localStorage
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}:user`,
        JSON.stringify(freshUserData)
      );

      setSession(completeSession);
    } catch (error) {
      // Fallback: mantém dados do login se perfil falhar
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}:user`,
        JSON.stringify(data.user)
      );
      setSession(data);
    }
  }

  // Atualiza suavemente os dados do usuário na sessão
  function updateSession(userData: any) {
    if (session) {
      const updatedSession = {
        ...session,
        user: userData,
      };

      setSession(updatedSession);
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}:user`,
        JSON.stringify(userData)
      );
    }
  }

  // Remove sessão, limpa storage e redireciona
  function remove() {
    setSession(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}:user`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}:token`);

    window.location.assign("/");
  }

  // Carrega sessão do localStorage e valida no servidor
  async function loadUser() {
    const user = localStorage.getItem(`${LOCAL_STORAGE_KEY}:user`);
    const token = localStorage.getItem(`${LOCAL_STORAGE_KEY}:token`);

    if (token && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Sincroniza com backend para garantir dados atualizados
        const userData = await AuthService.getProfile();

        setSession({
          token,
          user: userData,
        });
      } catch (error) {
        // Fallback: utiliza dados persistidos localmente
        setSession({
          token,
          user: JSON.parse(user),
        });
      }
    }

    setIsLoading(false);
  }

  // Executa carregamento inicial da sessão
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, save, updateSession, isLoading, remove }}
    >
      {children}
    </AuthContext.Provider>
  );
}
