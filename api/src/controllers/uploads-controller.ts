import { Request, Response } from "express";
import z, { ZodError } from "zod";
import { prisma } from "../database/prisma";
import uploadConfig from "../configs/upload";
import { DiskStorage } from "../providers/disk-storage";
import { AppError } from "../utils/AppError";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

class UploadsController {
  // Faz upload de arquivo com validação e processamento
  async create(request: Request, response: Response) {
    const diskStorage = new DiskStorage();

    try {
      // Valida arquivo recebido (tipo, tamanho, nome)
      const fileSchema = z
        .object({
          filename: z
            .string()
            .min(1, { message: "Nome do arquivo é obrigatório." }),
          mimetype: z
            .string()
            .refine(
              (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
              {
                message:
                  "Tipo de arquivo não suportado. Apenas, JPEG, JPG e PNG são permitidos",
              }
            ),
          size: z
            .number()
            .positive()
            .refine((size) => size <= uploadConfig.MAX_FILE_SIZE, {
              message:
                "Tamanho do arquivo excedido. O tamanho máximo permitido é de 1MB",
            }),
        })
        .passthrough(); // Permite propriedades adicionais do multer

      const file = fileSchema.parse(request.file);
      const filename = await diskStorage.saveFile(file.filename);

      response.status(201).json({ filename });
    } catch (error) {
      if (error instanceof ZodError) {
        // Remove arquivo temporário em caso de erro de validação
        if (request.file) {
          await diskStorage.deleteFile(request.file.filename, "tmp");
        }

        throw new AppError(error.issues[0].message);
      }

      throw error;
    }
  }

  // Atualiza imagem de perfil com processamento e otimização
  async updateProfileImage(request: Request, response: Response) {
    const diskStorage = new DiskStorage();
    let originalFilePath: string = "";

    try {
      // Valida arquivo de imagem recebido
      const fileSchema = z
        .object({
          filename: z
            .string()
            .min(1, { message: "Nome do arquivo é obrigatório." }),
          mimetype: z
            .string()
            .refine(
              (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
              {
                message:
                  "Tipo de arquivo não suportado. Apenas, JPEG, JPG e PNG são permitidos",
              }
            ),
          size: z
            .number()
            .positive()
            .refine((size) => size <= uploadConfig.MAX_FILE_SIZE, {
              message:
                "Tamanho do arquivo excedido. O tamanho máximo permitido é de 1MB",
            }),
        })
        .passthrough();

      const file = fileSchema.parse(request.file);
      originalFilePath = path.resolve(uploadConfig.TMP_FOLDER, file.filename);

      // Processa imagem com sharp: redimensiona e comprime
      const processedFileName = `${file.filename.split(".")[0]}.webp`;
      const processedFilePath = path.resolve(
        uploadConfig.UPLOADS_FOLDER,
        processedFileName
      );

      await sharp(originalFilePath)
        .resize(200, 200, {
          // Redimensiona para 200x200 pixels
          fit: sharp.fit.cover, // Corta para cobrir área mantendo proporção
          position: sharp.strategy.entropy, // Foca na parte mais interessante
        })
        .webp({ quality: 80 }) // Converte para WebP com qualidade de 80%
        .toFile(processedFilePath); // Salva o arquivo processado

      // Deletar o arquivo original temporário
      await fs.unlink(originalFilePath);

      const userId = request.user?.id;
      const userRole = request.user?.role;

      if (!userId || !userRole) {
        throw new AppError("Usuário não autenticado.", 401);
      }

      let updatedProfile;

      if (userRole === "client") {
        const clientProfile = await prisma.clientProfile.findUnique({
          where: {
            userId,
          },
        });

        if (!clientProfile) {
          throw new AppError("Perfil do cliente não encontrado.", 404);
        }

        if (clientProfile.profileImage) {
          const oldImageName = clientProfile.profileImage.split("/").pop(); // O pop() pega o último elemento do array
          if (oldImageName) {
            await diskStorage.deleteFile(oldImageName, "upload");
          }
        }

        updatedProfile = await prisma.clientProfile.update({
          where: {
            id: clientProfile.id,
          },
          data: {
            profileImage: `/uploads/${processedFileName}`,
          },
        });
      } else if (userRole === "technician") {
        const technicianProfile = await prisma.technicianProfile.findUnique({
          where: {
            userId,
          },
        });

        if (!technicianProfile) {
          throw new AppError("Perfil do técnico não encontrado.", 404);
        }

        if (technicianProfile.profileImage) {
          const oldImageName = technicianProfile.profileImage.split("/").pop();
          if (oldImageName) {
            await diskStorage.deleteFile(oldImageName, "upload");
          }
        }

        updatedProfile = await prisma.technicianProfile.update({
          where: {
            id: technicianProfile.id,
          },
          data: {
            profileImage: `/uploads/${processedFileName}`,
          },
        });
      } else if (userRole === "admin") {
        const adminProfile = await prisma.adminProfile.findUnique({
          where: {
            userId,
          },
        });

        if (!adminProfile) {
          throw new AppError("Perfil do administrador não encontrado.", 404);
        }

        if (adminProfile.profileImage) {
          const oldImageName = adminProfile.profileImage.split("/").pop();
          if (oldImageName) {
            await diskStorage.deleteFile(oldImageName, "upload");
          }
        }

        updatedProfile = await prisma.adminProfile.update({
          where: {
            id: adminProfile.id,
          },
          data: {
            profileImage: `/uploads/${processedFileName}`,
          },
        });
      } else {
        throw new AppError(
          "Usuário não autorizado para atualizar o perfil.",
          403
        );
      }

      response.status(200).json({
        message: "Imagem do perfil atualizada com sucesso.",
        profileImage: updatedProfile.profileImage,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        if (request.file && originalFilePath) {
          try {
            await fs.access(originalFilePath);
            await fs.unlink(originalFilePath);
          } catch (unlinkError) {
            // Ignora erro se o arquivo não existir
          }
        }

        throw new AppError(error.issues[0].message);
      }

      // Se houver erro no sharp ou outro, tentar deletar o arquivo temporário
      if (request.file && originalFilePath) {
        try {
          await fs.access(originalFilePath);
          await fs.unlink(originalFilePath);
        } catch (unlinkError) {
          // Ignora erro se o arquivo não existir
        }
      }

      throw error;
    }
  }
}

export { UploadsController };
