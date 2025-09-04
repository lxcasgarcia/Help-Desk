import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { CallAPIResponse } from "../types/entities/calls";

// Interface de dados expostos pelo CallsContext
interface CallsContextData {
  calls: CallAPIResponse[];
  setCalls: (calls: CallAPIResponse[]) => void;
  updateCall: (callId: string, updatedCall: Partial<CallAPIResponse>) => void;
  refreshCalls: () => Promise<void>;
}

// Contexto para gerenciamento de lista de chamados
const CallsContext = createContext<CallsContextData>({} as CallsContextData);

// Props do provider de chamados
interface CallsProviderProps {
  children: ReactNode;
}

// Provider para centralizar estado e operações de chamados
export function CallsProvider({ children }: CallsProviderProps) {
  const [calls, setCalls] = useState<CallAPIResponse[]>([]);

  // Atualiza um chamado específico na lista
  const updateCall = (
    callId: string,
    updatedCall: Partial<CallAPIResponse>
  ) => {
    setCalls((prevCalls) =>
      prevCalls.map((call) =>
        call.id === callId ? { ...call, ...updatedCall } : call
      )
    );
  };

  // Placeholder para recarregar lista de chamados
  const refreshCalls = async () => {
    // Implementar quando houver endpoint/uso definido
  };

  return (
    <CallsContext.Provider
      value={{ calls, setCalls, updateCall, refreshCalls }}
    >
      {children}
    </CallsContext.Provider>
  );
}

// Hook para consumir o CallsContext com segurança
export function useCalls() {
  const context = useContext(CallsContext);
  if (!context) {
    throw new Error("useCalls deve ser usado dentro de um CallsProvider");
  }
  return context;
}
