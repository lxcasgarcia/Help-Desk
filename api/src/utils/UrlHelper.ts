// Função para converter caminho relativo de imagem em URL absoluta
export function getAbsoluteImageUrl(
  relativePath: string | null
): string | null {
  // Retorna null se não houver caminho
  if (!relativePath) return null;

  // Define URL base do ambiente ou localhost como fallback
  const baseUrl = process.env.BASE_URL || "http://localhost:3333";

  // Se já for uma URL absoluta, retorna como está
  if (relativePath.startsWith("http")) {
    return relativePath;
  }

  // Remove barra inicial para evitar duplicação na concatenação
  const cleanPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  // Concatena URL base com caminho limpo
  return `${baseUrl}/${cleanPath}`;
}
