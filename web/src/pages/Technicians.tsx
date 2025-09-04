import userSvg from "../assets/icons/entities/user.svg";
import FrameSvg from "../assets/icons/entities/+.svg?react";

import { Button, ButtonTrash, ButtonEdit } from "../components/ui/buttons";
import { AvailabilityBadges } from "../components/business/badges/AvailabilityBadges";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { Pagination } from "../components/ui/navigation/Pagination";

import { useApi } from "../hooks/useApi";
import { usePagination } from "../hooks/usePagination";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { TechniciansService } from "../services/api/technicians";
import type { TechniciansPaginationAPIResponse } from "../types/entities/technicians";

// Página de listagem e gerenciamento de técnicos
export function Technicians() {
  const navigate = useNavigate();
  const {
    data: techniciansData,
    loading,
    error,
    execute,
  } = useApi<TechniciansPaginationAPIResponse>();

  // Hook de paginação
  const {
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    setTotalPages,
  } = usePagination();
  const itemsPerPage = 10; // Definir itens por página

  // Estados para modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingTechnicianId, setDeletingTechnicianId] = useState<
    string | null
  >(null);

  // Função para buscar os técnicos da API com paginação
  const fetchTechnicians = async () => {
    const response = await TechniciansService.getAll({
      page: currentPage,
      limit: itemsPerPage,
    });
    return response;
  };

  // Funções para exclusão
  const handleDeleteTechnician = (id: string, name: string) => {
    setTechnicianToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  // Função para fechar modal de exclusão
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTechnicianToDelete(null);
  };

  // Função para confirmar exclusão do técnico
  const confirmDelete = async () => {
    if (!technicianToDelete) return;

    try {
      setDeletingTechnicianId(technicianToDelete.id);
      await TechniciansService.delete(technicianToDelete.id);

      execute(fetchTechnicians); // Recarrega lista
      setDeleteModalOpen(false);
      setTechnicianToDelete(null);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Erro ao excluir técnico:",
          error.response?.data?.message
        );
      }
    } finally {
      setDeletingTechnicianId(null);
    }
  };

  // Funções de paginação
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Carrega técnicos quando a página muda
  useEffect(() => {
    execute(fetchTechnicians);
  }, [currentPage]); // Recarrega quando mudar a página

  // Atualiza total de páginas quando receber dados
  useEffect(() => {
    if (techniciansData?.pagination) {
      setTotalPages(techniciansData.pagination.totalPages);
    }
  }, [techniciansData?.pagination, setTotalPages]);

  // Renderiza estado de carregamento
  if (loading) {
    return <LoadingState title="Técnicos" message="Carregando técnicos..." />;
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <ErrorState
        title="Técnicos"
        error={error}
        onRetry={() => execute(fetchTechnicians)}
      />
    );
  }

  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Cabeçalho da página com botão de criação */}
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-blue-dark text-xl font-bold">Técnicos</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/technicians/create")}
          className="py-[10px] px-[16px] flex gap-2 items-center"
        >
          <FrameSvg className="w-[18px] h-[18px]" />
          <span className="text-sm">Novo</span>
        </Button>
      </header>

      {/* Tabela de técnicos */}
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-left border border-gray-500 rounded-lg">
          <thead className="border-b border-gray-500">
            <tr>
              <th className="p-3 text-sm font-bold text-gray-400 w-100">
                Nome
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-70">
                Email
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-80">
                Disponibilidade
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-12"></th>
            </tr>
          </thead>

          <tbody>
            {/* Mensagem quando não há técnicos */}
            {!techniciansData?.technicians ||
            techniciansData.technicians.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Nenhum técnico encontrado
                </td>
              </tr>
            ) : (
              // Lista de técnicos com ações
              techniciansData.technicians.map((technician) => (
                <tr key={technician.id} className="border-b border-gray-500">
                  <td className="p-3 text-sm text-gray-200">
                    {/* Avatar e nome do técnico */}
                    <div className="flex items-center gap-2">
                      <img
                        src={technician.profileImage || userSvg}
                        alt="Técnico"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-bold">{technician.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {technician.email}
                  </td>
                  <td className="p-3 text-gray-200">
                    {/* Badges de disponibilidade */}
                    <AvailabilityBadges
                      availability={technician.availability}
                      maxVisible={4}
                    />
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {/* Botões de ação para cada técnico */}
                    <div className="flex gap-2 justify-end">
                      <ButtonTrash
                        onClick={() =>
                          handleDeleteTechnician(technician.id, technician.name)
                        }
                        disabled={deletingTechnicianId === technician.id}
                        loading={deletingTechnicianId === technician.id}
                      />
                      <ButtonEdit to={`/technicians/${technician.id}`} />
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
        current={currentPage}
        total={totalPages}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={technicianToDelete?.name || ""}
        itemType="técnico"
        loading={deletingTechnicianId === technicianToDelete?.id}
      />
    </div>
  );
}
