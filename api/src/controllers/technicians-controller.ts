import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";
import { compare, hash } from "bcrypt";
import { ProfileImageGenerator } from "../utils/ProfileImageGenerator";
import { CallStatus, UserRole } from "@prisma/client";

class TechniciansController {
  // Horários padrão de disponibilidade comercial
  private defaultCommercialAvailability = [
    "08:00",
    "09:00",
    "10:00",
    "11:00", // Manhã: 08:00 às 12:00
    "14:00",
    "15:00",
    "16:00",
    "17:00", // Tarde: 14:00 às 18:00
  ];

  // Cria um novo técnico com perfil e disponibilidade
  async create(request: Request, response: Response) {
    // Valida dados de entrada do técnico
    const bodySchema = z.object({
      name: z.string().trim().min(2, { message: "Nome é obrigatório." }),
      email: z
        .string()
        .trim()
        .email({ message: "Email inválido." })
        .toLowerCase(),
      password: z
        .string()
        .min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
      availability: z
        .array(
          z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
            message: "Formato de horário inválido (HH:MM).",
          })
        )
        .optional(),
    });

    const { name, email, password, availability } = bodySchema.parse(
      request.body
    );

    // Verifica se já existe usuário com o mesmo email
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError(
        "Já existe um usuário cadastrado com esse e-mail.",
        400
      );
    }

    // Define horário de disponibilidade: usa o fornecido ou o padrão
    const finalAvailability =
      availability && availability.length > 0
        ? availability
        : this.defaultCommercialAvailability;

    // Gera imagem de perfil padrão para o novo técnico
    const defaultProfileImageUrl =
      await ProfileImageGenerator.generateDefaultProfileImage({
        name,
        size: 200,
        format: "png",
        saveLocally: true,
      });

    // Cria usuário e perfil em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria o usuário com role de técnico
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: await hash(password, 8),
          role: UserRole.technician,
        },
      });

      // Cria o perfil do técnico com disponibilidade
      const technicianProfile = await tx.technicianProfile.create({
        data: {
          userId: user.id,
          availability: finalAvailability,
          profileImage: defaultProfileImageUrl,
        },
      });

      return { user, technicianProfile };
    });

    return response.status(201).json({
      message: "Técnico cadastrado com sucesso.",
      technician: {
        id: result.technicianProfile.id,
        name: result.user.name,
        email: result.user.email,
        availability: result.technicianProfile.availability,
        profileImage: result.technicianProfile.profileImage,
        isGeneratedImage: ProfileImageGenerator.isGeneratedProfileImage(
          defaultProfileImageUrl
        ), // Verificar se é imagem gerada
      },
    });
  }

  // Lista técnicos com paginação e busca
  index = async (request: Request, response: Response) => {
    // Valida parâmetros de query
    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      perPage: z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(parseInt(val), 50) : 10)),
      search: z.string().optional(),
    });

    const { page, perPage, search } = querySchema.parse(request.query);

    // Aplica filtro de busca se fornecido
    let whereClause: any = {
      user: {
        role: UserRole.technician,
      },
    };

    if (search) {
      // Busca por nome ou email do técnico
      whereClause = {
        user: {
          role: UserRole.technician,
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      };
    }

    const skip = (page - 1) * perPage;

    // Busca técnicos e total em paralelo para otimização
    const [technicians, totalCount] = await Promise.all([
      prisma.technicianProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              assignedCalls: true,
            },
          },
        },
        skip,
        take: perPage,
        orderBy: {
          user: {
            createdAt: "desc",
          },
        },
      }),
      prisma.technicianProfile.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    response.json({
      technicians: technicians.map((technician) => {
        const baseUrl = process.env.BASE_URL || "http://localhost:3333";

        return {
          id: technician.id,
          userId: technician.userId,
          name: technician.user.name,
          email: technician.user.email,
          profileImage: technician.profileImage
            ? `${baseUrl}${technician.profileImage}`
            : null,
          availability: technician.availability,
          assignedCallsCount: technician._count.assignedCalls,
          createdAt: technician.user.createdAt,
          updatedAt: technician.user.updatedAt,
        };
      }),
      pagination: {
        page,
        perPage,
        totalRecords: totalCount,
        totalPages,
      },
    });
  };

  // Obtém detalhes de um técnico específico
  show = async (request: Request, response: Response) => {
    // Valida parâmetros da requisição
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do técnico inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    // Busca técnico com informações completas
    const technician = await prisma.technicianProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedCalls: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!technician) {
      throw new AppError("Técnico não encontrado.", 404);
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3333";

    response.json({
      id: technician.id,
      userId: technician.userId,
      name: technician.user.name,
      email: technician.user.email,
      profileImage: technician.profileImage
        ? `${baseUrl}${technician.profileImage}`
        : null,
      availability: technician.availability,
      assignedCalls: technician.assignedCalls.map((call) => ({
        id: call.id,
        name: call.name,
        status: call.status,
        clientName: call.client.user.name,
        createdAt: call.createdAt,
      })),
      createdAt: technician.user.createdAt,
      updatedAt: technician.user.updatedAt,
    });
  };

  // Atualiza informações de um técnico específico
  update = async (request: Request, response: Response) => {
    // Valida parâmetros e dados de entrada
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do técnico inválido." }),
    });

    const bodySchema = z.object({
      name: z
        .string()
        .trim()
        .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
        .optional(),
      email: z.string().email({ message: "Email inválido." }).optional(),
      availability: z
        .array(
          z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
            message: "Formato de horário inválido (HH:MM).",
          })
        )
        .optional(),
    });

    const { id } = paramSchema.parse(request.params);
    const updateData = bodySchema.parse(request.body);

    // Verifica se o técnico existe
    const existingTechnician = await prisma.technicianProfile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingTechnician) {
      throw new AppError("Técnico não encontrado.", 404);
    }

    // Verifica se o novo email já está em uso por outro usuário
    if (
      updateData.email &&
      updateData.email !== existingTechnician.user.email
    ) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (userWithSameEmail) {
        throw new AppError("Este email já está em uso por outro usuário.", 400);
      }
    }

    // Atualiza dados em transação
    const updatedTechnician = await prisma.$transaction(async (tx) => {
      const userUpdateData: any = {};
      if (updateData.name) userUpdateData.name = updateData.name;
      if (updateData.email) userUpdateData.email = updateData.email;

      // Atualiza dados do usuário
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingTechnician.userId },
          data: userUpdateData,
        });
      }

      // Atualiza dados do perfil do técnico
      const technicianUpdateData: any = {};
      if (updateData.availability) {
        technicianUpdateData.availability = updateData.availability;
      }

      if (Object.keys(technicianUpdateData).length > 0) {
        await tx.technicianProfile.update({
          where: { id },
          data: technicianUpdateData,
        });
      }

      // Busca técnico atualizado
      return await tx.technicianProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:3333";

    response.json({
      message: "Técnico atualizado com sucesso.",
      technician: {
        id: updatedTechnician!.id,
        userId: updatedTechnician!.userId,
        name: updatedTechnician!.user.name,
        email: updatedTechnician!.user.email,
        profileImage: updatedTechnician!.profileImage
          ? `${baseUrl}${updatedTechnician!.profileImage}`
          : null,
        availability: updatedTechnician!.availability,
        createdAt: updatedTechnician!.user.createdAt,
        updatedAt: updatedTechnician!.user.updatedAt,
      },
    });
  };

  // Exclui um técnico e seus chamados
  delete = async (request: Request, response: Response) => {
    // Valida parâmetros da requisição
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do técnico inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    // Verifica se o técnico existe
    const technician = await prisma.technicianProfile.findUnique({
      where: { id },
      include: {
        user: true,
        assignedCalls: {
          where: {
            status: {
              in: [CallStatus.open, CallStatus.in_progress],
            },
          },
        },
      },
    });

    if (!technician) {
      throw new AppError("Técnico não encontrado.", 404);
    }

    // Verifica se o técnico tem chamados em andamento
    if (technician.assignedCalls.length > 0) {
      throw new AppError(
        "Não é possível excluir um técnico com chamados em andamento.",
        400
      );
    }

    // Exclui técnico e usuário em transação
    await prisma.$transaction(async (tx) => {
      // Exclui o perfil do técnico
      await tx.technicianProfile.delete({
        where: { id },
      });

      // Exclui o usuário
      await tx.user.delete({
        where: { id: technician.userId },
      });
    });

    response.json({
      message: "Técnico excluído com sucesso.",
    });
  };
}

export { TechniciansController };
