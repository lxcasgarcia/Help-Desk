import { Button } from "../buttons";

// Interface para props do componente de estado de erro
interface ErrorStateProps {
  title: string;
  error: string;
  onRetry?: () => void;
}

// Componente para exibir estados de erro com opção de retry
export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Header com título do erro */}
      <header className="mb-6">
        <h1 className="text-blue-dark text-xl font-bold">{title}</h1>
      </header>
      {/* Conteúdo centralizado com mensagem de erro e botão */}
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-red-400">Erro: {error}</p>
        {/* Botão de retry (opcional) */}
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
