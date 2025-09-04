import { Router } from "express";
import { ProfileImageGenerator } from "../utils/ProfileImageGenerator";

const avatarRoutes = Router();

// Endpoint para servir avatares gerados dinamicamente
avatarRoutes.get("/avatar/:name", async (request, response) => {
  try {
    const { name } = request.params;
    const size = parseInt(request.query.size as string) || 100;
    const format = (request.query.format as string) || "png";

    if (!name) {
      return response.status(400).json({ error: "Nome é obrigatório" });
    }

    // Gera a imagem em memória
    const pngBuffer = await ProfileImageGenerator.generatePNGLocally(
      name,
      size
    );

    // Define headers para cache
    response.set({
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000", // Cache por 1 ano
      ETag: `"${name}-${size}"`,
    });

    // Retorna a imagem
    response.send(pngBuffer);
  } catch (error) {
    console.error("Erro ao gerar avatar:", error);
    response.status(500).json({ error: "Erro interno do servidor" });
  }
});

export { avatarRoutes };
