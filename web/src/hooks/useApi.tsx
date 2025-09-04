import { useState, useCallback } from "react";
import { AxiosError } from "axios";

// Hook genérico para chamadas assíncronas com estados padrão
export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Executa função assíncrona controlando loading, erro e dados
  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      // Evita chamadas duplicadas quando já está carregando
      if (loading) return;

      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message || "Erro na requisição"
            : "Erro inesperado";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Reseta dados e mensagem de erro
  const resetData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, setData, resetData };
}
