import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { api } from "../../services/api/base";
import { Modal } from "../ui/feedback/Modal";
import { Input } from "../ui/forms/Input";
import { useFormValidation } from "../../hooks/useFormValidation";
import type {
  ServiceDetailResponse,
  ServiceUpdateData,
} from "../../types/dtos/responses/service-detail";
import { z } from "zod";
import { Button } from "../ui/buttons";

// Schema de validação para edição de serviço
const serviceSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  value: z.number().min(0.01, "Valor deve ser maior que zero"),
});

// Interface para props do modal de edição de serviço
interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceId: string;
}

// Modal para edição de serviços existentes
export function EditServiceModal({
  isOpen,
  onClose,
  onSuccess,
  serviceId,
}: EditServiceModalProps) {
  // Hook para validação de formulário
  const { errors, validateAll } =
    useFormValidation<ServiceUpdateData>(serviceSchema);
  // Estados do formulário e controle de loading
  const [values, setValues] = useState<ServiceUpdateData>({
    name: "",
    value: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameValidationError, setNameValidationError] = useState<string>("");
  const [service, setService] = useState<ServiceDetailResponse | null>(null);

  // Busca dados do serviço quando o modal abrir
  useEffect(() => {
    if (isOpen && serviceId) {
      fetchServiceData();
    }
  }, [isOpen, serviceId]);

  // Função para buscar dados do serviço da API
  const fetchServiceData = async () => {
    try {
      setLoading(true);
      const response = await api.get<ServiceDetailResponse>(
        `/services/${serviceId}`
      );
      const serviceData = response.data;

      setService(serviceData);
      setValues({
        name: serviceData.name,
        value: serviceData.value,
      });
    } catch (error) {
      console.error("Erro ao buscar dados do serviço:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar valores dos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Limpa erro de nome duplicado quando o usuário digitar
    if (name === "name") {
      setNameValidationError("");
    }

    setValues((prev) => ({
      ...prev,
      [name]: name === "value" ? parseFloat(value) || 0 : value,
    }));
  };

  // Função para submeter formulário e atualizar serviço
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll(values) || !service) return;

    try {
      setIsUpdating(true);
      setNameValidationError("");

      await api.put(`/services/${service.id}`, values);

      onSuccess(); // Recarrega lista de serviços
      onClose(); // Fecha modal
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message && message.includes("mesmo nome")) {
          setNameValidationError("Já existe um serviço com este nome");
        }
      } else {
        console.error("Erro ao atualizar serviço:", error);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para fechar modal e limpar estados
  const handleClose = () => {
    setValues({ name: "", value: 0 });
    setNameValidationError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full">
        {/* Título do modal */}
        <div className="mb-6">
          <h2 className="text-md font-bold text-gray-200">Serviço</h2>
        </div>

        {/* Linha separadora superior */}
        <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

        {/* Renderização condicional baseada no estado de loading */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : service ? (
          <form onSubmit={handleSubmit}>
            {/* Campos do formulário com validação */}
            <div className="space-y-6 mb-8">
              <Input
                variant="minimal"
                legend="TÍTULO"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={errors.name || nameValidationError}
                placeholder="Nome do serviço"
              />

              <Input
                variant="minimal"
                legend="VALOR"
                name="value"
                type="number"
                step="0.01"
                min="0"
                value={values.value}
                onChange={handleChange}
                error={errors.value}
                placeholder="0,00"
              />
            </div>

            {/* Linha separadora inferior */}
            <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

            {/* Botões de ação (cancelar e salvar) */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleClose}
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
            <p className="text-gray-400">Erro ao carregar dados do serviço</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
