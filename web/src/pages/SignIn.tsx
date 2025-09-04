import { Input } from "../components/ui/forms/Input";
import { Button } from "../components/ui/buttons";

import { useAuth } from "../hooks/useAuth";
import { useFormValidation } from "../hooks/useFormValidation";

import { useState } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { AuthService } from "../services/api/auth";
import { AxiosError } from "axios";

// Schema de validação para login
const signInSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

// Página de login com validação de formulário
export function SignIn() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { errors, validateField, validateAll } =
    useFormValidation(signInSchema);

  // Estados para os campos do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Função para navegar para página de cadastro
  function handleGoToSignUp() {
    navigate("/signup");
  }

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

  // Função para submeter formulário de login
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateAll({ email, password })) {
      return; // Para se validação falhar
    }

    try {
      setIsLoading(true);

      console.log("🚀 Tentando fazer login com:", {
        email,
        password: "***",
      });

      const response = await AuthService.login({ email, password });
      auth.save(response);
    } catch (error) {
      if (error instanceof AxiosError) {
        // Erro de credenciais inválidas
        if (error.response?.status === 401) {
          alert("E-mail ou senha incorretos");
        } else {
          alert(error.response?.data?.message || "Erro de autenticação");
        }
      } else {
        alert("Não foi possível entrar!");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Formulário principal de login */}
      <div className="w-full flex flex-col border-1 border-gray-500 rounded-lg p-7">
        <div className="gap-2 mb-10">
          <h1 className="text-lg font-bold text-gray-200">Acesse o portal</h1>
          <p className="text-xs text-gray-300">
            Entre usando seu e-mail e senha cadastrados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input
            legend="E-mail"
            type="email"
            placeholder="exemplo@mail.com"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            required
          />

          <Input
            legend="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            required
          />

          <div className="flex flex-col gap-4 mt-8">
            <Button type="submit" isLoading={isLoading}>
              Entrar
            </Button>
          </div>
        </form>
      </div>

      {/* Seção para cadastro de nova conta */}
      <div className="w-full flex flex-col border-1 border-gray-500 rounded-lg p-7">
        <div className="gap-2 mb-6">
          <h1 className="text-md font-bold text-gray-200">
            Ainda não tem uma conta?
          </h1>
          <p className="text-xs text-gray-300">Cadastre agora mesmo</p>
        </div>
        <Button variant="secondary" onClick={handleGoToSignUp}>
          Cadastrar
        </Button>
      </div>
    </div>
  );
}
