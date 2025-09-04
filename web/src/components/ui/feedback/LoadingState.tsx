// Interface para props do componente de estado de carregamento
interface LoadingStateProps {
  title: string;
  message?: string;
}

// Componente para exibir estados de carregamento com título e mensagem
export function LoadingState({
  title,
  message = "Carregando...",
}: LoadingStateProps) {
  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Header com título da operação */}
      <header className="mb-6">
        <h1 className="text-blue-dark text-xl font-bold">{title}</h1>
      </header>
      {/* Conteúdo centralizado com mensagem de loading */}
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
