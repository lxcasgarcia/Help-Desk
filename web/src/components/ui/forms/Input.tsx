import { useState, useEffect } from "react";
import AlertSvg from "../../../assets/icons/status/circle-alert.svg?react";

// Interface para props do componente Input
type Props = React.ComponentProps<"input"> & {
  legend?: string;
  helperText?: string;
  error?: string;
  variant?: "default" | "minimal";
};

// Componente Input reutilizável com variantes e validação
export function Input({
  legend,
  helperText,
  error,
  type = "text",
  variant = "default",
  onFocus,
  onBlur,
  onChange,
  value,
  defaultValue,
  ...rest
}: Props) {
  // Estados para controle de foco e valor do input
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue || "");

  // Sincroniza valor interno com prop externa
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Função para lidar com evento de foco
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  // Função para lidar com evento de blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Função para lidar com mudanças no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  // Verifica se o input tem conteúdo
  const hasValue = String(inputValue).length > 0;

  // Renderiza variante minimal (estilo simplificado)
  if (variant === "minimal") {
    return (
      <div className="">
        {/* Label do campo (opcional) */}
        {legend && (
          <label className="block text-gray-300 text-xs font-bold mb-2 uppercase">
            {legend}
          </label>
        )}

        {/* Input com estilo minimal */}
        <input
          type={type}
          value={inputValue}
          className={`
            w-full py-2 bg-transparent border-b text-gray-200 placeholder-gray-400 
            focus:outline-none focus:border-gray-400 transition-colors duration-200
            ${error ? "border-red-500" : "border-gray-400"}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...rest}
        />

        {/* Container fixo para erro (evita layout shift) */}
        <div className="h-4 flex items-start mt-1">
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
      </div>
    );
  }

  // Classes baseadas no estado do input (foco, valor, erro)
  const borderClass = error
    ? "border-gray-500"
    : isFocused || hasValue
    ? "border-blue-500"
    : "border-gray-500";

  const borderStyle = hasValue ? "border-b-2" : "border-b";

  const labelColor = error
    ? "text-red-400"
    : isFocused || hasValue
    ? "text-blue-500"
    : "text-gray-300";

  return (
    <div className="mb-">
      {/* Label do campo com cor baseada no estado */}
      {legend && (
        <label className={`uppercase text-xxs font-bold block ${labelColor}`}>
          {legend}
        </label>
      )}

      {/* Input com estilo padrão e bordas dinâmicas */}
      <input
        type={type}
        value={inputValue}
        className={`w-full bg-transparent ${borderStyle} ${borderClass} text-gray-200 py-2 outline-none ${
          isFocused ? "placeholder-transparent" : "placeholder-gray-400"
        } transition-all duration-200`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...rest}
      />

      {/* Área para helper text ou mensagem de erro */}
      {(helperText || error) && (
        <div className="mt-1 text-xs">
          {error ? (
            <span className="text-red-400 flex items-center gap-1">
              <AlertSvg className="w-4 h-4" /> {error}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}
