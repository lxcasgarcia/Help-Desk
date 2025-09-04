import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { hash } from "bcrypt";
import { CallStatus, UserRole } from "@prisma/client";
import { ProfileImageGenerator } from "../utils/ProfileImageGenerator";

class ClientController {
  // Lista todos os clientes com paginação e busca
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

    // Filtra apenas usuários com role de cliente
    let whereClause: any = {
      user: {
        role: UserRole.client,
      },
    };

    if (search) {
      // Aplica busca por nome ou email do cliente
      whereClause = {
        user: {
          role: UserRole.client,
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

    // Busca clientes e total em paralelo para otimização
    const [clients, totalCount] = await Promise.all([
      prisma.clientProfile.findMany({
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
              createdCalls: true,
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
      prisma.clientProfile.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    response.json({
      clients: clients.map((client) => {
        const baseUrl = process.env.BASE_URL || "http://localhost:3333";

        return {
          id: client.id,
          userId: client.userId,
          name: client.user.name,
          email: client.user.email,
          profileImage: client.profileImage
            ? `${baseUrl}${client.profileImage}`
            : null,
          totalCalls: client._count.createdCalls,
          createdAt: client.user.createdAt,
          updatedAt: client.user.updatedAt,
        };
      }),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  };

  show = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do cliente inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!clientProfile) {
      throw new AppError("Cliente não encontrado.", 404);
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3333";

    response.json({
      id: clientProfile.id,
      name: clientProfile.user.name,
      email: clientProfile.user.email,
      profileImage: clientProfile.profileImage
        ? `${baseUrl}${clientProfile.profileImage}`
        : null,
    });
  };

  // Atualiza informações de um cliente específico
  update = async (request: Request, response: Response) => {
    // Valida parâmetros e dados de entrada
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do cliente inválido." }),
    });

    const bodySchema = z.object({
      name: z
        .string()
        .trim()
        .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
        .optional(),
      email: z.string().email({ message: "Email inválido." }).optional(),
    });

    const { id } = paramSchema.parse(request.params);
    const updateData = bodySchema.parse(request.body);

    // Verifica se o cliente existe
    const existingClient = await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingClient) {
      throw new AppError("Cliente não encontrado.", 404);
    }

    // Verifica se o novo email já está em uso por outro usuário
    if (updateData.email && updateData.email !== existingClient.user.email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (userWithSameEmail) {
        throw new AppError("Este email já está em uso por outro usuário.", 400);
      }
    }

    // Atualiza dados em transação
    const updatedClient = await prisma.$transaction(async (tx) => {
      const userUpdateData: any = {};
      if (updateData.name) userUpdateData.name = updateData.name;
      if (updateData.email) userUpdateData.email = updateData.email;

      // Atualiza dados do usuário
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingClient.userId },
          data: userUpdateData,
        });
      }

      // Busca cliente atualizado
      return await tx.clientProfile.findUnique({
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
      message: "Cliente atualizado com sucesso.",
      client: {
        id: updatedClient!.id,
        userId: updatedClient!.userId,
        name: updatedClient!.user.name,
        email: updatedClient!.user.email,
        profileImage: updatedClient!.profileImage
          ? `${baseUrl}${updatedClient!.profileImage}`
          : null,
        createdAt: updatedClient!.user.createdAt,
        updatedAt: updatedClient!.user.updatedAt,
      },
    });
  };

  // Exclui um cliente e seus chamados relacionados
  delete = async (request: Request, response: Response) => {
    // Valida parâmetros da requisição
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do cliente inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    // Verifica se o cliente existe
    const client = await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: true,
        createdCalls: {
          where: {
            status: {
              in: [CallStatus.open, CallStatus.in_progress],
            },
          },
        },
      },
    });

    if (!client) {
      throw new AppError("Cliente não encontrado.", 404);
    }

    // Verifica se o cliente tem chamados em andamento
    if (client.createdCalls.length > 0) {
      throw new AppError(
        "Não é possível excluir um cliente com chamados em andamento.",
        400
      );
    }

    // Exclui cliente e usuário em transação
    await prisma.$transaction(async (tx) => {
      // Exclui o perfil do cliente
      await tx.clientProfile.delete({
        where: { id },
      });

      // Exclui o usuário
      await tx.user.delete({
        where: { id: client.userId },
      });
    });

    response.json({
      message: "Cliente excluído com sucesso.",
    });
  };
}

export { ClientController };
