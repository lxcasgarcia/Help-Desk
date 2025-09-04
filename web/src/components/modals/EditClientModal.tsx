import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { api } from "../../services/api/base";
import { Modal } from "../ui/feedback/Modal";
import { Input } from "../ui/forms/Input";
import { useFormValidation } from "../../hooks/useFormValidation";
import type {
  ClientDetailResponse,
  ClientUpdateData,
} from "../../types/dtos/responses/client-detail";
import { z } from "zod";
import { Button } from "../ui/buttons";

// Schema de validação para edição de cliente
const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

// Interface para props do modal de edição de cliente
interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
}

// Modal para edição de clientes existentes
export function EditClientModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}: EditClientModalProps) {
  // Hook para validação de formulário
  const { errors, validateAll } =
    useFormValidation<ClientUpdateData>(clientSchema);
  // Estados do formulário e controle de loading
  const [values, setValues] = useState<ClientUpdateData>({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState<string>("");
  const [client, setClient] = useState<ClientDetailResponse | null>(null);

  // Busca dados do cliente quando o modal abrir
  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientData();
    }
  }, [isOpen, clientId]);

  // Função para buscar dados do cliente da API
  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await api.get<ClientDetailResponse>(
        `/clients/${clientId}`
      );
      const clientData = response.data;

      setClient(clientData);
      setValues({
        name: clientData.name,
        email: clientData.email,
      });
    } catch (error) {
      console.error("Erro ao buscar dados do cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar valores dos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // Função para atualizar email e limpar erro de validação
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValidationError("");
    handleChange(e);
  };

  // Função para submeter formulário e atualizar cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll(values) || !client) return;

    try {
      setIsUpdating(true);
      setEmailValidationError("");

      await api.put(`/clients/${client.id}`, values);

      onSuccess(); // Recarrega lista de clientes
      onClose(); // Fecha modal
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        setEmailValidationError("Este email já está em uso por outro usuário");
      } else {
        console.error("Erro ao atualizar cliente:", error);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para gerar iniciais do nome do cliente
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full">
        {/* Título do modal */}
        <div className="mb-6">
          <h2 className="text-md font-bold text-gray-200">Cliente</h2>
        </div>

        {/* Linha separadora superior */}
        <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

        {/* Renderização condicional baseada no estado de loading */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : client ? (
          <form onSubmit={handleSubmit}>
            {/* Avatar do cliente (imagem ou iniciais) */}
            <div className="flex-shrink-0 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-lg">
                {client.profileImage ? (
                  <img
                    src={client.profileImage}
                    alt={client.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  getInitials(client.name)
                )}
              </div>
            </div>

            {/* Campos do formulário com validação */}
            <div className="space-y-4 mb-8">
              <Input
                variant="minimal"
                legend="NOME"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
              />

              <Input
                variant="minimal"
                legend="E-MAIL"
                name="email"
                type="email"
                value={values.email}
                onChange={handleEmailChange}
                error={errors.email || emailValidationError}
              />
            </div>

            {/* Linha separadora inferior */}
            <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

            {/* Botões de ação (cancelar e salvar) */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={isUpdating}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                fullWidth
                type="submit"
                isLoading={isUpdating}
              >
                Salvar
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Erro ao carregar dados do cliente</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
