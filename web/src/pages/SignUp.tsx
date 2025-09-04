import { Button } from "../components/ui/buttons";
import { Input } from "../components/ui/forms/Input";

import { useState } from "react";
import { useNavigate } from "react-router";
import { z, ZodError } from "zod";
import { AuthService } from "../services/api/auth";
import { AxiosError } from "axios";

// Schema de validação para cadastro
const signUpSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 dígitos"),
});

// Página de cadastro com validação de formulário
export function SignUp() {
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Função para validar campos individuais
  const validateField = (field: string, value: string) => {
    try {
      if (field === "name") {
        signUpSchema.shape.name.parse(value);
      } else if (field === "email") {
        signUpSchema.shape.email.parse(value);
      } else if (field === "password") {
        signUpSchema.shape.password.parse(value);
      }

      // Se chegou aqui, não há erro
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0].message }));
      }
    }
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

  // Função para submeter formulário de cadastro
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsLoading(true);
      setErrors({});

      // Validar todos os campos
      const data = signUpSchema.parse({ name, email, password });

      await AuthService.register(data);

      // Sucesso - navegar para login
      alert("Usuário cadastrado com sucesso!");
      navigate("/");
    } catch (error) {
      console.log("❌ Erro durante cadastro:", error);

      if (error instanceof ZodError) {
        // Mapear erros do Zod para os campos
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      if (error instanceof AxiosError) {
        // Erro específico do servidor
        if (error.response?.status === 409) {
          setErrors({
            email: "Este e-mail já está cadastrado",
          });
        } else {
          setErrors({
            general:
              error.response?.data?.message || "Erro ao cadastrar usuário",
          });
        }
        return;
      }

      setErrors({ general: "Erro inesperado ao cadastrar usuário" });
    } finally {
      setIsLoading(false);
    }
  }

  // Função para navegar para página de login
  function handleGoToSignIn() {
    navigate("/");
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Formulário principal de cadastro */}
      <div className="w-full flex flex-col border-1 border-gray-500 rounded-lg p-7">
        <div className="gap-2 mb-10">
          <h1 className="text-lg font-bold text-gray-200">Crie sua conta</h1>
          <p className="text-xs text-gray-300">
            Informe seu nome, e-mail e senha
          </p>
        </div>

        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <Input
            legend="Nome"
            type="text"
            placeholder="Digite o nome completo"
            value={name}
            onChange={handleNameChange}
            error={errors.name}
            required
          />

          <Input
            legend="E-mail"
            type="email"
            placeholder="exemplo@mail.com"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            required
          />

          <div>
            <Input
              legend="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={errors.password}
              required
            />

            {passwordFocused && !errors.password && (
              <span className="text-xs italic text-gray-400">
                Mínimo de 6 dígitos
              </span>
            )}
          </div>

          {/* Erro geral */}
          {errors.general && (
            <div className="text-red-400 text-sm text-center">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col gap-4 mt-8">
            <Button type="submit" isLoading={isLoading}>
              Cadastrar
            </Button>
          </div>
        </form>
      </div>

      {/* Seção para acesso à conta existente */}
      <div className="w-full flex flex-col border-1 border-gray-500 rounded-lg p-7">
        <div className="gap-2 mb-6">
          <h1 className="text-md font-bold text-gray-200">Já tem uma conta?</h1>
          <p className="text-xs text-gray-300">Entre agora mesmo</p>
        </div>
        <Button variant="secondary" onClick={handleGoToSignIn}>
          Acessar conta
        </Button>
      </div>
    </div>
  );
}
