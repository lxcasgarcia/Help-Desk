import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "../../services/api/base";
import { Modal } from "../ui/feedback/Modal";
import { Input } from "../ui/forms/Input";
import { useFormValidation } from "../../hooks/useFormValidation";
import type { ServiceCreateData } from "../../types/dtos/requests/service-create";
import { z } from "zod";
import { Button } from "../ui/buttons";

// Schema de validação para criação de serviço
const serviceSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  value: z.number().min(0.01, "Valor deve ser maior que zero"),
});

// Interface para props do modal de criação de serviço
interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Modal para criação de novos serviços
export function CreateServiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateServiceModalProps) {
  // Hook para validação de formulário
  const { errors, validateAll } =
    useFormValidation<ServiceCreateData>(serviceSchema);
  // Estados do formulário e validação
  const [values, setValues] = useState<ServiceCreateData>({
    name: "",
    value: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [nameValidationError, setNameValidationError] = useState<string>("");

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

  // Função para submeter formulário e criar serviço
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll(values)) return;

    try {
      setIsCreating(true);
      setNameValidationError("");

      await api.post("/services", values);

      // Limpa formulário após sucesso
      setValues({ name: "", value: 0 });

      onSuccess(); // Recarrega lista de serviços
      onClose(); // Fecha modal
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message && message.includes("mesmo nome")) {
          setNameValidationError("Já existe um serviço com este nome");
        }
      } else {
        console.error("Erro ao criar serviço:", error);
      }
    } finally {
      setIsCreating(false);
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
          <h2 className="text-md font-bold text-gray-200">
            Cadastro de serviço
          </h2>
        </div>

        {/* Linha separadora */}
        <div className="-mx-[28px] border-t border-gray-500 mb-6"></div>

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
              disabled={isCreating}
            >
              Cancelar
            </Button>

            <Button
              variant="primary"
              fullWidth
              type="submit"
              isLoading={isCreating}
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
