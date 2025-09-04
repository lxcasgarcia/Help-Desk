import crypto from "crypto";
import fs from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import sharp from "sharp";
import { AppError } from "./AppError";
import { prisma } from "../database/prisma";
import { z } from "zod";
import uploadConfig from "../configs/upload";

interface ProfileImageOptions {
  name: string;
  size?: number;
  format?: "svg" | "png"; // Alterado de 'url' para 'png' para indicar salvamento local
  saveLocally?: boolean; // Nova opção para controlar o salvamento local
}

class ProfileImageGenerator {
  private static readonly COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D7BDE2",
    "#A3E4D7",
    "#F9E79F",
    "#D5A6BD",
    "#AED6F1",
    "#A9DFBF",
  ];

  /**
   * Gera as iniciais do nome (máximo 2 caracteres)
   */
  private static getInitials(name: string): string {
    const words = name
      .trim()
      .split(" ")
      .filter((word) => word.length > 0);

    if (words.length === 0) return "U";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  /**
   * Gera uma cor baseada no nome (sempre a mesma cor para o mesmo nome)
   */
  private static getColorFromName(name: string): string {
    const hash = crypto
      .createHash("md5")
      .update(name.toLowerCase())
      .digest("hex");
    const index = parseInt(hash.substring(0, 2), 16) % this.COLORS.length;
    return this.COLORS[index];
  }

  /**
   * Gera uma cor de texto contrastante baseada na cor de fundo
   */
  private static getContrastColor(backgroundColor: string): string {
    const color = backgroundColor.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  /**
   * Gera um SVG de imagem de perfil
   */
  private static generateSVGContent(name: string, size: number = 100): string {
    const initials = this.getInitials(name);
    const backgroundColor = this.getColorFromName(name);
    const textColor = this.getContrastColor(backgroundColor);
    const fontSize = Math.round(size * 0.4);

    return `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
                <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
                      font-family="Arial, sans-serif" font-size="${fontSize}" 
                      font-weight="bold" fill="${textColor}">
                    ${initials}
                </text>
            </svg>
        `.trim();
  }

  /**
   * Gera uma URL para um serviço de avatar (para uso interno, não para salvar)
   */
  private static getAvatarServiceURL(name: string, size: number = 100): string {
    const initials = this.getInitials(name);
    const backgroundColor = this.getColorFromName(name).replace("#", "");
    const textColor = this.getContrastColor("#" + backgroundColor).replace(
      "#",
      ""
    );

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&size=${size}&background=${backgroundColor}&color=${textColor}&bold=true&format=png`;
  }

  /**
   * Salva o conteúdo de uma imagem (SVG ou PNG) localmente
   * Retorna o caminho relativo do arquivo salvo
   */
  private static async saveImageLocally(
    name: string,
    content: string | Buffer,
    format: "svg" | "png"
  ): Promise<string> {
    const fileName = `${crypto.randomBytes(10).toString("hex")}-${name
      .replace(/\s/g, "_")
      .toLowerCase()}.${format}`;
    const filePath = path.resolve(uploadConfig.UPLOADS_FOLDER, fileName);

    if (format === "svg") {
      await fs.writeFile(filePath, content as string);
    } else if (format === "png") {
      await fs.writeFile(filePath, content as Buffer);
    }
    // Retorna caminho servível pelo Express: /uploads/<file>
    return `/uploads/${fileName}`;
  }

  // Gera imagem de perfil padrão e opcionalmente salva localmente
  static async generateDefaultProfileImage(
    options: ProfileImageOptions
  ): Promise<string> {
    const { name, size = 100, format = "png", saveLocally = true } = options;

    // Estratégia controlada por env: 'external' não salva em disco
    const strategy = (process.env.UPLOADS_STRATEGY || "local").toLowerCase();
    const shouldSaveLocally = saveLocally && strategy !== "external";

    if (shouldSaveLocally) {
      if (format === "svg") {
        // Gera e salva SVG localmente
        const svgContent = this.generateSVGContent(name, size);
        return await this.saveImageLocally(name, svgContent, "svg");
      } else if (format === "png") {
        // Baixa PNG de serviço externo e salva localmente
        const imageUrl = this.getAvatarServiceURL(name, size);
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const pngBuffer = Buffer.from(response.data);
        return await this.saveImageLocally(name, pngBuffer, "png");
      }
    }

    // Estratégia externa ou quando explicitamente não salvar local
    return this.getAvatarServiceURL(name, size);
    throw new Error("Formato de imagem não suportado para geração.");
  }

  // Gera múltiplos tamanhos de imagem de perfil salvando localmente
  static async generateProfileImageSizes(name: string): Promise<{
    small: string;
    medium: string;
    large: string;
  }> {
    return {
      small: await this.generateDefaultProfileImage({
        name,
        size: 50,
        // respeita estratégia via env
        saveLocally: true,
      }),
      medium: await this.generateDefaultProfileImage({
        name,
        size: 100,
        saveLocally: true,
      }),
      large: await this.generateDefaultProfileImage({
        name,
        size: 200,
        saveLocally: true,
      }),
    };
  }

  // Verifica se uma URL é imagem de perfil gerada automaticamente
  static isGeneratedProfileImage(imageUrl: string): boolean {
    // Verifica se o caminho corresponde ao padrão de uploads gerados
    return (
      imageUrl.startsWith("/uploads/") &&
      (imageUrl.endsWith(".svg") || imageUrl.endsWith(".png")) &&
      imageUrl.includes("-")
    ); // Para diferenciar de uploads de usuário
  }

  // Atualiza imagem de perfil gerada quando o nome muda
  static async updateGeneratedProfileImage(
    currentImageUrl: string,
    newName: string
  ): Promise<string> {
    if (this.isGeneratedProfileImage(currentImageUrl)) {
      // Deleta imagem antiga e cria uma nova se for gerada localmente
      const oldFileName = currentImageUrl.split("/").pop();
      if (oldFileName) {
        try {
          await fs.unlink(
            path.resolve(uploadConfig.UPLOADS_FOLDER, oldFileName)
          );
        } catch (error) {
          // Ignora erro se arquivo não existir
          console.warn(
            `Could not delete old generated image: ${oldFileName}`,
            error
          );
        }
      }
      return await this.generateDefaultProfileImage({
        name: newName,
        saveLocally: true,
      });
    }

    // Mantém imagem atual se for personalizada
    return currentImageUrl;
  }

  // Gera dados da imagem para uso no frontend
  static async getImageData(name: string): Promise<{
    initials: string;
    backgroundColor: string;
    textColor: string;
    imageUrl: string;
  }> {
    const initials = this.getInitials(name);
    const backgroundColor = this.getColorFromName(name);
    const textColor = this.getContrastColor(backgroundColor);
    const imageUrl = await this.generateDefaultProfileImage({
      name,
      saveLocally: true,
    });

    return {
      initials,
      backgroundColor,
      textColor,
      imageUrl,
    };
  }
}

export { ProfileImageGenerator };
