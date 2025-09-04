import React from "react";

// Tipo para opções do select
export type SelectOption = {
  label: string;
  value: string;
};

// Interface para props do componente Select
type SelectProps = {
  legend?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  name?: string;
  error?: string | null;
  className?: string;
};

// Componente Select para campos de seleção com opções
export function Select({
  legend,
  placeholder,
  value,
  onChange,
  options,
  required,
  disabled,
  name,
  error,
  className,
}: SelectProps) {
  return (
    <div className={className ?? ""}>
      {/* Label do campo (opcional) */}
      {legend && (
        <label className="block text-sm font-bold text-gray-400 mb-2">
          {legend}
        </label>
      )}

      {/* Container do select com posicionamento relativo */}
      <div className="relative">
        {/* Elemento select nativo */}
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={[
            "w-full appearance-none p-3 pr-10",
            "border border-gray-500 rounded-lg",
            "bg-gray-600 text-gray-200",
            "focus:outline-none focus:border-gray-400",
            disabled ? "opacity-60 cursor-not-allowed" : "",
            error ? "border-red-500" : "",
          ].join(" ")}
        >
          {/* Opção placeholder (opcional) */}
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {/* Lista de opções disponíveis */}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Ícone de seta para baixo (decorativo) */}
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
          aria-hidden
        >
          ▾
        </span>
      </div>

      {/* Mensagem de erro (se houver) */}
      {error && (
        <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
