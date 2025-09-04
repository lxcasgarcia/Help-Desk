import React from "react";

// Interface para props do componente TextArea
type TextAreaProps = {
  legend?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  className?: string;
  error?: string | null;
};

// Componente TextArea para campos de texto multilinha
export function TextArea({
  legend,
  name,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  maxLength,
  rows = 4,
  className,
  error,
}: TextAreaProps) {
  return (
    <div className={className ?? ""}>
      {/* Label do campo (opcional) */}
      {legend && (
        <label className="block text-sm font-bold text-gray-400 mb-2">
          {legend}
        </label>
      )}
      {/* Área de texto com validação e estilos */}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        className={[
          "w-full leading-relaxed",
          "border-b border-gray-500",
          "resize-none",
          "bg-gray-600 text-gray-200 placeholder-gray-400",
          "focus:outline-none focus:border-gray-400",
          error ? "border-red-500" : "",
        ].join(" ")}
      />
      {/* Mensagem de erro (se houver) */}
      {error && (
        <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
