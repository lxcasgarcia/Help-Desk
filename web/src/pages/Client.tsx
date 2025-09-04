import { ButtonTrash, ButtonEdit } from "../components/ui/buttons";
import { Pagination } from "../components/ui/navigation/Pagination";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { EditClientModal } from "../components/modals/EditClientModal";

import { useApi } from "../hooks/useApi";
import { usePagination } from "../hooks/usePagination";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { ClientsService } from "../services/api/clients";
import type { ClientAPIResponse } from "../types/entities/clients";

// Página de listagem e gerenciamento de clientes
export function Clients() {
  const {
    data: clients,
    loading,
    error,
    execute,
  } = useApi<ClientAPIResponse[]>();

  const { page, totalPages, handlePagination } = usePagination();
  // Estados para controle de modais e operações
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Função para buscar clientes da API
  const fetchClients = async () => {
    const response = await ClientsService.getAll({ page, limit: 10 });
    return response.clients;
  };

  // Função para abrir modal de confirmação de exclusão
  const handleDeleteClient = (id: string, name: string) => {
    setClientToDelete({ id, name });
    setModalOpen(true);
  };

  // Função para confirmar exclusão do cliente
  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      setDeletingClientId(clientToDelete.id);
      await ClientsService.delete(clientToDelete.id);

      // Recarrega a lista de clientes
      execute(fetchClients);

      setModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Erro ao excluir cliente:",
          error.response?.data?.message
        );
      }
    } finally {
      setDeletingClientId(null);
    }
  };

  // Função para fechar modal de exclusão
  const closeModal = () => {
    setModalOpen(false);
    setClientToDelete(null);
  };

  // Função para abrir modal de edição
  const handleEditClient = (id: string, name: string) => {
    setClientToEdit({ id, name });
    setEditModalOpen(true);
  };

  // Função para fechar modal de edição
  const closeEditModal = () => {
    setEditModalOpen(false);
    setClientToEdit(null);
  };

  // Função para sucesso na edição
  const handleEditSuccess = () => {
    execute(fetchClients); // Recarrega lista
  };

  // Carrega clientes quando a página muda
  useEffect(() => {
    execute(fetchClients);
  }, [page]);

  // Renderiza o cabeçalho da página
  const renderHeader = () => (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-blue-dark text-xl font-bold">Clientes</h1>
      </div>
    </header>
  );

  // Renderiza estado de carregamento
  if (loading) {
    return (
      <div>
        {renderHeader()}
        <LoadingState title="Clientes" message="Carregando clientes..." />
      </div>
    );
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <div>
        {renderHeader()}
        <ErrorState
          title="Clientes"
          error={error}
          onRetry={() => execute(fetchClients)}
        />
      </div>
    );
  }

  return (
    <div className="flex px-12 py-13 flex-col">
      {/* Cabeçalho da página */}
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-blue-dark text-xl font-bold">Clientes</h1>
      </header>

      {/* Tabela de clientes */}
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-left border border-gray-500 rounded-lg">
          <thead className="border-b border-gray-500">
            <tr className="">
              <th className="p-3 text-sm font-bold text-gray-400 w-145">
                Nome
              </th>
              <th className="p-3 text-sm font-bold text-gray-400 w-100">
                Email
              </th>

              <th className="p-3 text-sm font-bold text-gray-400 w-22"></th>
            </tr>
          </thead>

          <tbody>
            {/* Mensagem quando não há clientes */}
            {!clients || clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Nenhum cliente encontrado
                </td>
              </tr>
            ) : (
              // Lista de clientes com ações
              clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-500">
                  <td className="p-3 text-sm text-gray-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={client.profileImage || ""}
                        alt="Cliente"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-bold">{client.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-200">{client.email}</td>
                  <td className="p-3 text-sm text-gray-200 gap-2 flex justify-end">
                    {/* Botões de ação para cada cliente */}
                    <ButtonTrash
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      disabled={deletingClientId === client.id}
                      loading={deletingClientId === client.id}
                    />
                    <ButtonEdit
                      onClick={() => handleEditClient(client.id, client.name)}
                    />
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

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        itemName={clientToDelete?.name || ""}
        itemType="cliente"
        loading={deletingClientId === clientToDelete?.id}
      />

      {/* Modal de edição de cliente */}
      <EditClientModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
        clientId={clientToEdit?.id || ""}
      />
    </div>
  );
}
