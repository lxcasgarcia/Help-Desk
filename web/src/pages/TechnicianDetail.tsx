import ArrowLeftSvg from "../assets/icons/navigation/arrow-left.svg?react";
import XSvg from "../assets/icons/actions/x.svg?react";

import { Input } from "../components/ui/forms/Input";
import { LoadingState } from "../components/ui/feedback/LoadingState";
import { ErrorState } from "../components/ui/feedback/ErrorState";
import { Button } from "../components/ui/buttons";

import { useApi } from "../hooks/useApi";
import { useFormValidation } from "../hooks/useFormValidation";

import { api } from "../services/api/base";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AxiosError } from "axios";
import { z } from "zod";
import type { TechnicianDetailResponse } from "../types/dtos/responses/technician-detail";
import { DEFAULT_COMMERCIAL_HOURS } from "../utils/availability";

// Schema de validação para atualização de técnico
const technicianUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});

// Página de detalhes e edição de técnico
export function TechnicianDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: technician,
    loading,
    error,
    execute,
  } = useApi<TechnicianDetailResponse>();
  const { errors, validateField, validateAll } = useFormValidation(
    technicianUpdateSchema
  );

  // Estados para os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState<string>("");

  // Horários disponíveis organizados por período
  const availableHours = {
    morning: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
    afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
    night: ["19:00", "20:00", "21:00", "22:00", "23:00"],
  };

  // Função para buscar dados do técnico
  const fetchTechnician = async () => {
    if (!id) throw new Error("ID do técnico não encontrado");
    const response = await api.get<{ technician: TechnicianDetailResponse }>(
      `/technicians/${id}`
    );
    return response.data.technician;
  };

  // Carrega dados do técnico quando o ID muda
  useEffect(() => {
    if (id) execute(fetchTechnician);
  }, [id]);

  // Atualiza estados locais quando receber dados do técnico
  useEffect(() => {
    if (technician) {
      setName(technician.name);
      setEmail(technician.email);
      setSelectedHours(
        technician.availability && technician.availability.length > 0
          ? technician.availability
          : DEFAULT_COMMERCIAL_HOURS
      );
    }
  }, [technician]);

  // Função para validar nome em tempo real
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value) validateField("name", value);
  };

  // Função para validar email em tempo real
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValidationError(""); // Limpar erro de duplicata ao digitar
    if (value) validateField("email", value);
  };

  // Função para alternar seleção de horário
  const toggleHour = (hour: string) => {
    setSelectedHours((prev) =>
      prev.includes(hour)
        ? prev.filter((h) => h !== hour)
        : [...prev, hour].sort()
    );
  };

  // Função para submeter atualizações
  const handleSubmit = async () => {
    if (!validateAll({ name, email })) return;

    try {
      setIsUpdating(true);
      setEmailValidationError(""); // Limpar erro anterior

      await api.put(`/technicians/${id}`, {
        name,
        email,
        availability: selectedHours,
      });

      // Redirecionar para a lista de técnicos após sucesso
      navigate("/technicians");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          setEmailValidationError("Este e-mail já está cadastrado");
          return; // Não exibe alert, apenas mostra erro no input
        }
        alert(error.response?.data?.message || "Erro ao atualizar");
      } else {
        alert("Erro inesperado");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para gerar iniciais do nome
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Renderiza estado de carregamento
  if (loading)
    return <LoadingState title="Perfil de técnico" message="Carregando..." />;

  // Renderiza estado de erro
  if (error || !technician)
    return (
      <ErrorState
        title="Perfil de técnico"
        error={error || "Técnico não encontrado"}
        onRetry={() => execute(fetchTechnician)}
      />
    );

  return (
    <div className="flex px-[183px] py-[56px] flex-col">
      {/* Cabeçalho da página com botões de ação */}
      <header className="mb-6 flex items-center justify-between max-w-[800px]">
        <div>
          {/* Botão de voltar */}
          <button
            onClick={() => navigate(-1)}
            className="bg-transparent text-gray-300 p-[2px] flex gap-2 items-center"
          >
            <ArrowLeftSvg className="w-[14px] h-[14px]" />
            <span className="text-xs text-gray-300 font-bold">Voltar</span>
          </button>

          <h1 className="text-blue-dark text-xl font-bold">
            Perfil de técnico
          </h1>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/technicians")}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isUpdating}
            isLoading={isUpdating}
          >
            Salvar
          </Button>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Coluna esquerda - Dados pessoais */}
        <div className="p-6 border border-gray-500 rounded-lg max-w-[296px] min-h-[311px] h-full w-full flex flex-col gap-[24px]">
          <div>
            <header>
              <div className="flex flex-col gap-[4px]">
                <h2 className="text-gray-200 text-md font-bold">
                  Dados pessoais
                </h2>
                <p className="text-gray-300 text-xs">
                  Defina as informações do perfil de técnico
                </p>
              </div>
            </header>
          </div>

          {/* Imagem de perfil */}
          <div className="flex-shrink-0">
            {technician.profileImage ? (
              <img
                src={technician.profileImage}
                alt={technician.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {getInitials(technician.name)}
                </span>
              </div>
            )}
          </div>

          {/* Campos do formulário */}
          <div className="flex flex-col gap-[16px]">
            <div>
              <Input
                variant="minimal"
                legend="Nome"
                placeholder="Nome completo"
                type="text"
                value={name}
                onChange={handleNameChange}
                error={errors.name}
                required
              />
            </div>

            <div>
              <Input
                variant="minimal"
                legend="E-mail"
                placeholder="exemplo@mail.com"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={errors.email || emailValidationError}
                required
              />
            </div>
          </div>
        </div>

        {/* Coluna direita - Horários de atendimento */}
        <div className="p-6 border border-gray-500 rounded-lg max-w-[480px] min-h-[305px] w-full h-full flex flex-col gap-[24px]">
          <div>
            <header>
              <div className="flex flex-col gap-[4px]">
                <h2 className="text-gray-200 text-md font-bold">
                  Horários de atendimento
                </h2>
                <p className="text-gray-300 text-xs">
                  Selecione os horários de disponibilidade do técnico para
                  atendimento
                </p>
              </div>
            </header>
          </div>

          {/* Seleção de horários por período */}
          <div className="flex flex-col gap-[20px]">
            {/* Horários da manhã */}
            <div>
              <h3 className="text-xxs font-bold text-gray-300 mb-3 uppercase">
                Manhã
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableHours.morning.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHour(hour)}
                    className={`px-3 py-1.5 rounded-full border font-bold text-xs transition-all flex items-center gap-1.5 ${
                      selectedHours.includes(hour)
                        ? "bg-blue-base border-blue-base text-gray-600"
                        : "bg-transparent border-gray-400 text-gray-200 hover:border-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    <span>{hour}</span>
                    {selectedHours.includes(hour) && (
                      <XSvg className="w-[14px] h-[14px] text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Horários da tarde */}
            <div>
              <h3 className="text-xxs font-bold text-gray-300 mb-3 uppercase">
                Tarde
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableHours.afternoon.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHour(hour)}
                    className={`px-3 py-1.5 rounded-full border font-bold text-xs transition-all flex items-center gap-1.5 ${
                      selectedHours.includes(hour)
                        ? "bg-blue-base border-blue-base text-gray-600"
                        : "bg-transparent border-gray-400 text-gray-200 hover:border-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    <span>{hour}</span>
                    {selectedHours.includes(hour) && (
                      <XSvg className="w-[14px] h-[14px] text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Horários da noite */}
            <div>
              <h3 className="text-xxs font-bold text-gray-300 mb-3 uppercase">
                Noite
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableHours.night.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHour(hour)}
                    className={`px-3 py-1.5 rounded-full border font-bold text-xs transition-all flex items-center gap-1.5 ${
                      selectedHours.includes(hour)
                        ? "bg-blue-base border-blue-base text-gray-600"
                        : "bg-transparent border-gray-400 text-gray-200 hover:border-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    <span>{hour}</span>
                    {selectedHours.includes(hour) && (
                      <XSvg className="w-[14px] h-[14px] text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
