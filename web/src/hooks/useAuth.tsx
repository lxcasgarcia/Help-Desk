import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Hook para consumir o AuthContext com tipagem e segurança
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
