import { useState } from "react";
import { z } from "zod";

// Hook para validação de formulários com Zod
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodObject<any>
) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Valida campo individual e atualiza erros
  const validateField = (field: keyof T, value: any) => {
    try {
      const fieldSchema = schema.shape[field as string];
      if (fieldSchema) {
        fieldSchema.parse(value);
        // Remove erro se validação passou
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field as string]: error.issues[0].message,
        }));
      }
    }
  };

  // Valida todo o objeto e preenche erros por campo
  const validateAll = (data: T) => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  return { errors, setErrors, validateField, validateAll };
}
