import ArrowLeftSvg from "../assets/icons/navigation/arrow-left.svg?react";
import XSvg from "../assets/icons/actions/x.svg?react";

import { Input } from "../components/ui/forms/Input";
import { Button } from "../components/ui/buttons";

import { useFormValidation } from "../hooks/useFormValidation";

import { DEFAULT_COMMERCIAL_HOURS } from "../utils/availability";
import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api/base";
import type {
  TechnicianCreateData,
  TechnicianCreateAPIResponse,
} from "../types/dtos/requests/technician-create";
import { AxiosError } from "axios";
import { z } from "zod";

// Schema de validação para criação de técnico
const technicianCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Página de criação de novo técnico
export function TechnicianCreate() {
  const navigate = useNavigate();
  const { errors, validateField, validateAll } = useFormValidation(
    technicianCreateSchema
  );

  // Estados para os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>(
    DEFAULT_COMMERCIAL_HOURS
  );
  const [isLoading, setIsLoading] = useState(false);

  // Horários disponíveis organizados por período
  const availableHours = {
    morning: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
    afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
    night: ["19:00", "20:00", "21:00", "22:00", "23:00"],
  };

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
    if (value) validateField("email", value);
  };

  // Função para validar senha em tempo real
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) validateField("password", value);
  };

  // Função para alternar seleção de horário
  const toggleHour = (hour: string) => {
    setSelectedHours((prev) =>
      prev.includes(hour)
        ? prev.filter((h) => h !== hour)
        : [...prev, hour].sort()
    );
  };

  // Função para submeter formulário de criação
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateAll({ name, email, password })) {
      return; // Para se validação falhar
    }

    try {
      setIsLoading(true);

      // Preparar dados para envio
      const technicianData: TechnicianCreateData = {
        name,
        email,
        password,
        availability: selectedHours.length > 0 ? selectedHours : [],
      };

      const response = await api.post<TechnicianCreateAPIResponse>(
        "/technicians",
        technicianData
      );

      // Redirecionar para a lista de técnicos
      navigate("/technicians");
    } catch (error) {
      if (error instanceof AxiosError) {
        // Tratar erros específicos da API
        if (error.response?.status === 409) {
          // Email já existe - mostrar erro no campo específico
          // Como não temos setErrors do hook, vamos mostrar um alert por enquanto
          alert("Este e-mail já está cadastrado");
        } else {
          alert(error.response?.data?.message || "Erro ao criar técnico");
        }
      } else {
        alert("Erro inesperado ao criar técnico");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Função para cancelar criação
  const handleCancel = () => {
    navigate("/technicians");
  };

  return (
    <div className="flex px-[183px] py-[56px] flex-col ">
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
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Salvar
          </Button>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Card de dados pessoais */}
        <div className="p-6 border border-gray-500 rounded-lg max-w-[296px] w-full max-h-[332px] h-full flex flex-col gap-[24px]">
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

          {/* Campos do formulário */}
          <div className="flex flex-col gap-[16px]">
            <div>
              <Input
                legend="Nome"
                placeholder="Nome completo"
                type="text"
                onChange={handleNameChange}
                error={errors.name}
                required
              />
            </div>

            <div>
              <Input
                legend="E-mail"
                placeholder="exemplo@mail.com"
                type="email"
                onChange={handleEmailChange}
                error={errors.email}
                required
              />
            </div>

            <div>
              <Input
                legend="Senha"
                placeholder="Defina a senha de acesso"
                type="password"
                onChange={handlePasswordChange}
                error={errors.password}
                required
                minLength={6}
                helperText="Mínimo de 6 dígitos"
              />
            </div>
          </div>
        </div>

        {/* Card de horários de atendimento */}
        <div className="p-6 border border-gray-500 rounded-lg max-w-[480px] min-h-[305px] w-full h-full flex flex-col gap-[24px]">
          <div className="">
            <header className="">
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
