import FrameSvg from "../assets/icons/entities/+.svg?react";

import {
  Button,
  ButtonToggleStatus,
  ButtonTrash,
  ButtonEdit,
} from "../components/ui/buttons";
import { Pagination } from "../components/ui/navigation/Pagination";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { TagServices } from "../components/business/badges/TagServices";
import { CreateServiceModal } from "../components/modals/CreateServiceModal";
import { EditServiceModal } from "../components/modals/EditServiceModal";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";

import { useApi } from "../hooks/useApi";
import { usePagination } from "../hooks/usePagination";

import { formatCurrency } from "../utils/formatters";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { ServicesService } from "../services/api/services";
import type { ServiceAPIResponse } from "../types/entities/services";

// Página de listagem e gerenciamento de serviços
export function Services() {
  const { page, totalPages, setTotalPages, handlePagination } = usePagination();
  const {
    data: services,
    loading,
    error,
    execute,
    setData: setServices,
  } = useApi<ServiceAPIResponse[]>();

  // Estados para controle de modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Estados para modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(
    null
  );

  // Estado para toggle de status
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Número de serviços por página
  const perPage = 5;

  // Função para buscar serviços da API
  const fetchServices = async (currentPage: number) => {
    const response = await ServicesService.getAll({
      page: currentPage,
      limit: perPage,
    });
    setTotalPages(response.pagination.totalPages);
    return response.services;
  };

  // Função para abrir modal de criação
  const handleCreateService = () => {
    setCreateModalOpen(true);
  };

  // Função para fechar modal de criação
  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  // Função para sucesso na criação
  const handleCreateSuccess = () => {
    execute(() => fetchServices(page)); // Recarrega lista
  };

  // Função para abrir modal de edição
  const handleEditService = (id: string, name: string) => {
    setServiceToEdit({ id, name });
    setEditModalOpen(true);
  };

  // Função para fechar modal de edição
  const closeEditModal = () => {
    setEditModalOpen(false);
    setServiceToEdit(null);
  };

  // Função para sucesso na edição
  const handleEditSuccess = () => {
    execute(() => fetchServices(page)); // Recarrega lista
  };

  // Funções para exclusão
  const handleDeleteService = (id: string, name: string) => {
    setServiceToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  // Função para fechar modal de exclusão
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  // Função para confirmar exclusão do serviço
  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setDeletingServiceId(serviceToDelete.id);
      await ServicesService.delete(serviceToDelete.id);

      execute(() => fetchServices(page)); // Recarrega lista
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Erro ao excluir serviço:",
          error.response?.data?.message
        );
      }
    } finally {
      setDeletingServiceId(null);
    }
  };

  // Função para toggle de status do serviço
  const handleToggleStatus = async (id: string) => {
    try {
      setTogglingStatusId(id);

      // Atualização otimista - alterar o estado local imediatamente
      if (services) {
        const updatedServices = services.map((service) =>
          service.id === id ? { ...service, active: !service.active } : service
        );

        // Atualizar o estado local imediatamente para feedback visual
        setServices(updatedServices);
      }

      // Fazer a requisição para a API
      await ServicesService.toggleStatus(id);

      // Se chegou até aqui, a requisição foi bem-sucedida
      // Não precisa recarregar a lista, pois já atualizamos o estado local
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Erro ao alterar status:", error.response?.data?.message);

        // Em caso de erro, reverter a mudança otimista
        if (services) {
          const revertedServices = services.map((service) =>
            service.id === id
              ? { ...service, active: !service.active } // Reverter para o estado anterior
              : service
          );
          setServices(revertedServices);
        }
      }
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Carrega serviços quando a página muda
  useEffect(() => {
    execute(() => fetchServices(page));
  }, [page]);

  // Renderiza estado de carregamento
  if (loading) {
    return <LoadingState title="Serviços" message="Carregando serviços..." />;
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <ErrorState
        title="Serviços"
        error={error}
        onRetry={() => execute(() => fetchServices(page))}
      />
    );
  }

  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Cabeçalho da página com botão de criação */}
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-blue-dark text-xl font-bold">Serviços</h1>
        <Button
          variant="primary"
          size="md"
          onClick={handleCreateService}
          className="py-[10px] px-[16px] flex gap-2 items-center"
        >
          <FrameSvg className="w-[18px] h-[18px]" />
          <span className="text-sm">Novo</span>
        </Button>
      </header>

      {/* Tabela de serviços */}
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-left border border-gray-500 rounded-lg">
          <thead className="border-b border-gray-500">
            <tr className="">
              <th className="p-3 text-sm font-bold text-gray-400 w-125">
                Título
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-80">
                Valor
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-24">
                Status
              </th>

              <th className="p-3 text-sm font-bold text-gray-400 w-60"></th>
            </tr>
          </thead>

          <tbody>
            {/* Mensagem quando não há serviços */}
            {!services || services.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Nenhum serviço encontrado
                </td>
              </tr>
            ) : (
              // Lista de serviços com ações
              services.map((service) => (
                <tr key={service.id} className="border-b border-gray-500">
                  <td className="p-3 text-sm font-bold text-gray-200">
                    {service.name}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {formatCurrency(service.value)}
                  </td>
                  <td className="p-3 text-gray-200">
                    {/* Tag de status do serviço */}
                    <div className="flex justify-start">
                      <TagServices
                        variant={service.active ? "active" : "inactive"}
                        label={service.active ? "Ativo" : "Inativo"}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {/* Botões de ação para cada serviço */}
                    <div className="flex gap-2 justify-end">
                      <ButtonToggleStatus
                        isActive={service.active}
                        onToggle={() => handleToggleStatus(service.id)}
                        disabled={togglingStatusId === service.id}
                        loading={togglingStatusId === service.id}
                        title={
                          service.active
                            ? "Desativar serviço"
                            : "Ativar serviço"
                        }
                      />
                      <ButtonTrash
                        onClick={() =>
                          handleDeleteService(service.id, service.name)
                        }
                        disabled={deletingServiceId === service.id}
                        loading={deletingServiceId === service.id}
                      />
                      <ButtonEdit
                        onClick={() =>
                          handleEditService(service.id, service.name)
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação da lista */}
      <Pagination
        current={page}
        total={totalPages}
        onNext={() => handlePagination("next")}
        onPrevious={() => handlePagination("previous")}
      />

      {/* Modal de criação de serviço */}
      <CreateServiceModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de edição de serviço */}
      <EditServiceModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
        serviceId={serviceToEdit?.id || ""}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={serviceToDelete?.name || ""}
        itemType="serviço"
        loading={deletingServiceId === serviceToDelete?.id}
      />
    </div>
  );
}
