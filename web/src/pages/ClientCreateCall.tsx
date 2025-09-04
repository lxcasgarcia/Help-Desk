import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { Input } from "../components/ui/forms/Input";
import { TextArea } from "../components/ui/forms/TextArea";
import { Select } from "../components/ui/forms/Select";
import { Button } from "../components/ui/buttons";

import { useApi } from "../hooks/useApi";
import { ServicesService } from "../services/api/services";
import { CallsService } from "../services/api/calls";

import type { ServiceAPIResponse } from "../types/entities/services";

// Página de criação de novo chamado pelo cliente
export function ClientCreateCall() {
  const navigate = useNavigate();
  // Estados para os campos do formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook para gerenciar serviços da API
  const {
    data: services,
    loading: servicesLoading,
    error: servicesError,
    execute,
  } = useApi<ServiceAPIResponse[]>();

  // Função para carregar serviços ativos
  const loadServices = useCallback(async () => {
    console.log("Carregando serviços...");
    const response = await ServicesService.getAll({ page: 1, limit: 100 });
    console.log("Resposta da API:", response);
    console.log("Serviços recebidos:", response.services);
    console.log("Total de serviços:", response.services.length);

    const activeServices = response.services.filter(
      (service) => service.active
    );
    console.log("Serviços ativos:", activeServices);
    console.log("Total de serviços ativos:", activeServices.length);

    return activeServices;
  }, []);

  // Carrega serviços ao montar o componente
  useEffect(() => {
    execute(loadServices);
  }, []); // Executar apenas uma vez ao montar o componente

  // Serviço selecionado para o chamado
  const selectedService = services?.find(
    (service) => service.id === selectedServiceId
  );

  // Função para submeter formulário de criação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedServiceId) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (description.trim().length < 10) {
      alert("A descrição deve ter pelo menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await CallsService.create({
        name: title.trim(),
        description: description.trim(),
        serviceIds: [selectedServiceId],
      });

      alert("Chamado criado com sucesso!");
      navigate("/");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Erro ao criar chamado.";
      console.error("Erro ao criar chamado:", message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderiza estado de carregamento
  if (servicesLoading) {
    return (
      <LoadingState title="Novo chamado" message="Carregando serviços..." />
    );
  }

  // Renderiza estado de erro
  if (servicesError) {
    return (
      <ErrorState
        title="Novo chamado"
        error={servicesError}
        onRetry={() => execute(loadServices)}
      />
    );
  }

  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Cabeçalho da página */}
      <header className="mb-6">
        <h1 className="text-blue-dark text-xl font-bold">Novo chamado</h1>
      </header>

      <div className="flex gap-8">
        {/* Coluna da Esquerda - Informações (Card) */}
        <div className="flex-1 bg-gray-600 rounded-lg p-6 border border-gray-500 max-w-[480px]">
          <div className="mb-6">
            <h2 className="text-gray-200 text-lg font-bold mb-2">
              Informações
            </h2>
            <p className="text-gray-300 text-sm">
              Preencha as informações do seu chamado para que possamos atendê-lo
            </p>
          </div>

          {/* Formulário de criação */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                variant="minimal"
                legend="TÍTULO"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite um título para o chamado"
                required
              />
            </div>

            <TextArea
              legend="DESCRIÇÃO"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que está acontecendo"
              required
              minLength={10}
              rows={5}
            />

            <Select
              legend="CATEGORIA DE SERVIÇO"
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              placeholder="Selecione a categoria de atendimento"
              options={(services ?? []).map((s) => ({
                label: s.name,
                value: s.id,
              }))}
              required
            />
          </form>
        </div>

        {/* Coluna da Direita - Resumo */}
        <div className="w-80">
          <div className="bg-gray-600 rounded-lg p-6 border border-gray-500">
            <div className="mb-6">
              <h2 className="text-gray-200 text-lg font-bold mb-2">Resumo</h2>
              <p className="text-gray-300 text-sm">Valores e detalhes</p>
            </div>

            {/* Detalhes do resumo */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Categoria de serviço</p>
                <p className="text-gray-200 text-sm">
                  {selectedService
                    ? selectedService.name
                    : "Nenhuma selecionada"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Custo inicial</p>
                <p className="text-gray-200 text-xl font-bold">
                  {selectedService
                    ? selectedService.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "R$ 0,00"}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-500">
                <p className="text-gray-300 text-xs">
                  O chamado será automaticamente atribuído a um técnico
                  disponível
                </p>
              </div>

              {/* Botão de criação do chamado */}
              <Button
                variant="primary"
                fullWidth
                type="submit"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !selectedServiceId ||
                  description.trim().length < 10
                }
                size="md"
              >
                {isSubmitting ? "Criando..." : "Criar chamado"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
