import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";
import { callsRoutes } from "../routes/calls-routes";
import { CallStatus } from "@prisma/client";

class CallsController {
  // Atribui técnico automaticamente baseado em disponibilidade e carga de trabalho
  private assignTechnician = async (): Promise<string> => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    console.log(`Horário atual: ${currentTimeString}`);

    // Busca técnicos com disponibilidades e chamados ativos
    const technicians = await prisma.technicianProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        assignedCalls: {
          where: {
            status: {
              in: [CallStatus.open, CallStatus.in_progress],
            },
          },
        },
      },
    });

    if (technicians.length === 0) {
      throw new AppError("Nenhum técnico cadastrado no sistema.", 400);
    }

    // Filtra técnicos disponíveis no horário atual
    const availableTechnicians = technicians.filter((tech) => {
      // Verifica se o horário atual está na lista de disponibilidade
      const isAvailable = tech.availability.some((timeSlot) => {
        const [hour, minute] = timeSlot.split(":").map(Number);
        const slotTime = hour * 60 + minute;
        const currentSlotTime = currentHour * 60 + currentMinute;

        // Considera disponível se estiver dentro de 30 minutos de tolerância
        return Math.abs(slotTime - currentSlotTime) <= 30;
      });

      console.log(
        `Técnico ${tech.user.name}: disponibilidade ${tech.availability.join(
          ", "
        )}, disponível agora: ${isAvailable}`
      );
      return isAvailable;
    });

    if (availableTechnicians.length === 0) {
      throw new AppError(
        "Nenhum técnico disponível no horário atual. Por favor, tente novamente em outro horário.",
        400
      );
    }

    console.log(`Técnicos disponíveis: ${availableTechnicians.length}`);

    // Prioridade 1: Técnicos sem chamados em andamento
    const techniciansWithoutInProgress = availableTechnicians.filter(
      (tech) =>
        !tech.assignedCalls.some(
          (call) => call.status === CallStatus.in_progress
        )
    );

    if (techniciansWithoutInProgress.length > 0) {
      // Escolhe o técnico com menor carga total entre os disponíveis
      const technicianWithLeastCalls = techniciansWithoutInProgress.reduce(
        (prev, current) => {
          return prev.assignedCalls.length <= current.assignedCalls.length
            ? prev
            : current;
        }
      );

      console.log(
        `Técnico selecionado (sem chamados em andamento): ${technicianWithLeastCalls.user.name} com ${technicianWithLeastCalls.assignedCalls.length} chamados`
      );
      return technicianWithLeastCalls.id;
    }

    // Prioridade 2: Escolhe o técnico com menor carga total
    const technicianWithLeastCalls = availableTechnicians.reduce(
      (prev, current) => {
        return prev.assignedCalls.length <= current.assignedCalls.length
          ? prev
          : current;
      }
    );

    console.log(
      `Técnico selecionado (menor carga): ${technicianWithLeastCalls.user.name} com ${technicianWithLeastCalls.assignedCalls.length} chamados`
    );
    return technicianWithLeastCalls.id;
  };

  // Cria um novo chamado com validação e atribuição automática de técnico
  create = async (request: Request, response: Response) => {
    // Schema flexível para aceitar diferentes formatos de entrada
    const bodySchema = z.object({
      name: z.string().trim().min(3, {
        message: "Nome do chamado deve ter pelo menos 3 caracteres.",
      }),
      description: z
        .string()
        .trim()
        .min(10, { message: "Descrição deve ter pelo menos 10 caracteres." }),
      serviceIds: z.union([
        // Aceita array de strings
        z
          .array(z.string().uuid({ message: "ID de serviço inválido." }))
          .min(1, { message: "Pelo menos um serviço deve ser selecionado." }),
        // Aceita string única e converte para array
        z
          .string()
          .uuid({ message: "ID de serviço inválido." })
          .transform((val) => [val]),
        // Aceita string separada por vírgulas e converte para array
        z
          .string()
          .transform((val) => {
            const ids = val
              .split(",")
              .map((id) => id.trim())
              .filter((id) => id.length > 0);
            if (ids.length === 0) {
              throw new Error("Pelo menos um serviço deve ser selecionado.");
            }
            return ids;
          })
          .pipe(
            z.array(z.string().uuid({ message: "ID de serviço inválido." }))
          ),
      ]),
    });

    const { name, description, serviceIds } = bodySchema.parse(request.body);

    // Verifica se o usuário é um cliente
    if (request.user?.role !== "client") {
      throw new AppError("Apenas clientes podem criar chamados.", 403);
    }

    // Busca o perfil do cliente
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: request.user.id },
    });

    // Verifica se o perfil do cliente existe
    if (!clientProfile) {
      throw new AppError("Perfil de cliente não encontrado.", 404);
    }

    // Verifica se todos os serviços existem e estão ativos
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        active: true,
      },
    });

    // Valida se todos os serviços foram encontrados
    if (services.length !== serviceIds.length) {
      throw new AppError(
        "Um ou mais serviços não foram encontrados ou estão inativos.",
        400
      );
    }

    // Atribui um técnico automaticamente
    const assignedTechnicianId = await this.assignTechnician();

    // Busca informações completas do técnico atribuído
    const assignedTechnician = await prisma.technicianProfile.findUnique({
      where: { id: assignedTechnicianId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Verifica se o técnico atribuído existe
    if (!assignedTechnician) {
      throw new AppError("Técnico atribuído não encontrado.", 500);
    }

    // Cria o chamado com os serviços associados em uma transação
    const call = await prisma.$transaction(async (tx) => {
      // Cria o chamado principal
      const newCall = await tx.call.create({
        data: {
          name,
          description,
          status: CallStatus.open,
          clientId: clientProfile.id,
          technicianId: assignedTechnicianId,
        },
      });

      // Cria as associações com os serviços
      const callServices = await Promise.all(
        services.map((service) =>
          tx.callService.create({
            data: {
              callId: newCall.id,
              serviceId: service.id,
              assignedValue: service.value,
            },
          })
        )
      );
      return { call: newCall, services: callServices };
    });

    // Calcula o valor total do chamado
    const totalValue = services.reduce(
      (sum, service) => sum + service.value,
      0
    );

    // Retorna o chamado criado com todas as informações
    response.status(201).json({
      message: "Chamado criado com sucesso.",
      call: {
        id: call.call.id,
        name: call.call.name,
        description: call.call.description,
        status: call.call.status,
        createdAt: call.call.createdAt,
        services: services.map((service) => ({
          id: service.id,
          name: service.name,
          value: service.value,
        })),
        totalValue,
        technician: {
          id: assignedTechnician.id,
          name: assignedTechnician.user.name,
          email: assignedTechnician.user.email,
        },
      },
    });
  };

  // Lista chamados com paginação e filtros por role e status
  index = async (request: Request, response: Response) => {
    // Valida parâmetros de query
    const querySchema = z.object({
      status: z.enum(["open", "in_progress", "closed"]).optional(),
      page: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1))
        .optional()
        .default("1"),
      perPage: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1).max(50))
        .optional()
        .default("10"),
    });

    const { status, page, perPage } = querySchema.parse(request.query);
    const skip = (page - 1) * perPage;

    let whereClause: any = {};

    // Filtra por role do usuário para isolamento de dados
    if (request.user?.role === "client") {
      // Cliente só vê seus próprios chamados
      const clientProfile = await prisma.clientProfile.findUnique({
        where: {
          userId: request.user.id,
        },
      });

      if (!clientProfile) {
        throw new AppError("Perfil de cliente não encontrado", 404);
      }

      whereClause.clientId = clientProfile.id;
    } else if (request.user?.role === "technician") {
      // Técnico só vê chamados atribuídos a ele
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: {
          userId: request.user.id,
        },
      });

      if (!technicianProfile) {
        throw new AppError("Perfil de técnico não encontrado");
      }

      whereClause.technicianId = technicianProfile.id;
    }

    // Admin vê todos os chamados (sem filtro adicional)

    // Aplica filtro por status se fornecido
    if (status) {
      whereClause.status = status;
    }

    // Busca chamados e total em paralelo para otimização
    const [calls, totalCount] = await Promise.all([
      prisma.call.findMany({
        where: whereClause,
        include: {
          // Inclui dados do cliente
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          // Inclui dados do técnico
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          // Inclui serviços associados
          services: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.call.count({ where: whereClause }),
    ]);

    // Formata os chamados para resposta
    const formattedCalls = calls.map((call) => {
      // Calcula valor total somando todos os serviços
      const totalValue = call.services.reduce(
        (sum, cs) => sum + cs.assignedValue,
        0
      );

      return {
        id: call.id,
        name: call.name,
        description: call.description,
        status: call.status,
        createdAt: call.createdAt,
        updatedAt: call.updatedAt,
        client: {
          id: call.client.id,
          name: call.client.user.name,
          email: call.client.user.email,
          profileImage: call.client.profileImage
            ? `${process.env.BASE_URL || "http://localhost:3333"}${
                call.client.profileImage
              }`
            : null,
        },
        technician: {
          id: call.technician.id,
          name: call.technician.user.name,
          email: call.technician.user.email,
          profileImage: call.technician.profileImage
            ? `${process.env.BASE_URL || "http://localhost:3333"}${
                call.technician.profileImage
              }`
            : null,
        },
        services: call.services.map((cs) => ({
          id: cs.service.id,
          name: cs.service.name,
          assignedValue: cs.assignedValue,
        })),
        totalValue,
      };
    });

    // Retorna os chamados formatados
    response.json({
      calls: formattedCalls,
      pagination: {
        page,
        perPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      },
    });
  };

  // Obtém detalhes de um chamado específico
  show = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Verifica se o chamado existe
    if (!call) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    // Verifica permissões
    if (request.user?.role === "client") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: request.user.id },
      });

      // Verifica se o cliente é o dono do chamado
      if (!clientProfile || call.clientId !== clientProfile.id) {
        throw new AppError(
          "Você não tem permissão para visualizar este chamado.",
          403
        );
      }
    } else if (request.user?.role === "technician") {
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: { userId: request.user.id },
      });

      // Verifica se o técnico é o responsável pelo chamado
      if (!technicianProfile || call.technicianId !== technicianProfile.id) {
        throw new AppError(
          "Você não tem permissão para visualizar este chamado.",
          403
        );
      }
    }
    // Admin pode ver qualquer chamado

    // Calcula o valor total
    const totalValue = call.services.reduce(
      (sum, cs) => sum + cs.assignedValue,
      0
    );

    response.json({
      call: {
        id: call.id,
        name: call.name,
        description: call.description,
        status: call.status,
        createdAt: call.createdAt,
        updatedAt: call.updatedAt,
        client: {
          name: call.client.user.name,
          email: call.client.user.email,
          profileImage: call.client.profileImage
            ? `${process.env.BASE_URL || "http://localhost:3333"}${
                call.client.profileImage
              }`
            : null,
        },
        technician: {
          name: call.technician.user.name,
          email: call.technician.user.email,
          profileImage: call.technician.profileImage
            ? `${process.env.BASE_URL || "http://localhost:3333"}${
                call.technician.profileImage
              }`
            : null,
        },
        services: call.services.map((cs) => ({
          id: cs.service.id,
          name: cs.service.name,
          assignedValue: cs.assignedValue,
        })),
        totalValue,
      },
    });
  };

  // Atualiza o status de um chamado
  updateStatus = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID inválido" }),
    });

    const bodySchema = z.object({
      status: z.enum(["open", "in_progress", "closed"], {
        message: "Status inválido.",
      }),
    });

    const { id } = paramSchema.parse(request.params);
    const { status } = bodySchema.parse(request.body);

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        technician: true,
      },
    });

    // Verifica se o chamado existe
    if (!call) {
      throw new AppError("Chamado não encontrado", 404);
    }

    // Verifica permissões
    if (request.user?.role === "technician") {
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: { userId: request.user.id },
      });

      // Verifica se o técnico é o responsável pelo chamado
      if (!technicianProfile || call.technicianId !== technicianProfile.id) {
        throw new AppError(
          "Você não tem permissão para alterar este chamado.",
          403
        );
      }
    } else if (request.user?.role !== "admin") {
      throw new AppError(
        "Apenas técnicos e administradores podem alterar o status de chamados.",
        403
      );
    }

    // Verifica se o técnico já tem um chamado em andamento
    if (status === CallStatus.in_progress) {
      const existingInProgressCall = await prisma.call.findFirst({
        where: {
          technicianId: call.technicianId,
          status: CallStatus.in_progress,
          id: { not: id }, // Exclui o chamado atual da verificação
        },
      });

      // Verifica se o técnico já tem um chamado em andamento
      if (existingInProgressCall) {
        throw new AppError(
          "Este técnico já possui um chamado em andamento. Finalize o chamado atual antes de iniciar outro.",
          404
        );
      }
    }

    // Atualiza o status do chamado
    const updatedCall = await prisma.call.update({
      where: { id },
      data: { status },
    });

    response.json({
      message: "Status do chamado atualizado com sucesso.",
      call: {
        id: updatedCall.id,
        name: updatedCall.name,
        status: updatedCall.status,
        updatedAt: updatedCall.updatedAt,
      },
    });
  };

  // Adiciona um serviço a um chamado
  addService = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID inválido." }),
    });

    const bodySchema = z.object({
      serviceId: z.string().uuid({ message: "ID do serviço inválido" }),
    });

    const { id } = paramSchema.parse(request.params);
    const { serviceId } = bodySchema.parse(request.body);

    const call = await prisma.call.findUnique({
      where: {
        id,
      },
      include: {
        services: true,
      },
    });

    // Verifica se o chamado existe
    if (!call) {
      throw new AppError("Chamado não encontrado", 404);
    }

    // Verifica permissões - apenas técnicos responsáveis podem adicionar serviços
    if (request.user?.role === "technician") {
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: {
          userId: request.user.id,
        },
      });

      // Verifica se o técnico é o responsável pelo chamado
      if (!technicianProfile || call.technicianId !== technicianProfile.id) {
        throw new AppError(
          "Você não tem permissão para alterar esse chamado.",
          403
        );
      }
    } else if (request.user?.role !== "admin") {
      throw new AppError(
        "Apenas técnicos responsáveis e administradores podem adicionar serviços.",
        403
      );
    }

    // Busca o serviço
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    // Verifica se o serviço existe e está ativo
    if (!service || !service.active) {
      throw new AppError("Serviço não encontrado ou inativo.", 404);
    }

    // Busca o serviço associado ao chamado
    const existingCallService = call.services.find(
      (cs) => cs.serviceId === serviceId
    );

    // Verifica se o serviço já está associado ao chamado
    if (existingCallService) {
      throw new AppError("Este serviço já está associado ao chamado.", 400);
    }

    // Adiciona o serviço ao chamado
    await prisma.callService.create({
      data: {
        callId: id,
        serviceId,
        assignedValue: service.value,
      },
    });

    // Atualiza o updatedAt do chamado
    await prisma.call.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    response.json({
      message: "Serviço adicionado ao chamado com sucesso.",
      service: {
        id: service.id,
        name: service.name,
        assignedValue: service.value,
      },
    });
  };

  // Remove um serviço de um chamado
  removeService = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do chamado inválido." }),
    });

    const bodySchema = z.object({
      serviceId: z.string().uuid({ message: "ID do serviço inválido." }),
    });

    const { id } = paramSchema.parse(request.params);
    const { serviceId } = bodySchema.parse(request.body);

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!call) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    // Verifica permissão: técnico responsável pelo chamado ou admin
    if (request.user?.role === "technician") {
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: { userId: request.user.id },
      });

      if (!technicianProfile || call.technicianId !== technicianProfile.id) {
        throw new AppError(
          "Você não tem permissão para remover serviços deste chamado.",
          403
        );
      }
    } else if (request.user?.role !== "admin") {
      throw new AppError(
        "Apenas técnicos responsáveis e administradores podem remover serviços.",
        403
      );
    }

    // Verifica se o serviço está realmente associado a este chamado
    const existingCallService = call.services.find(
      (cs) => cs.serviceId === serviceId
    );
    if (!existingCallService) {
      throw new AppError("Este serviço não está associado ao chamado.", 400);
    }

    await prisma.callService.delete({
      where: {
        callId_serviceId: {
          callId: id,
          serviceId: serviceId,
        },
      },
    });

    // Atualiza o updatedAt do chamado
    await prisma.call.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    response.json({
      message: "Serviço removido do chamado com sucesso.",
    });
  };

  // Atualiza serviços adicionais personalizados
  updateAdditionalServices = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do chamado inválido." }),
    });

    const bodySchema = z.object({
      additionalServices: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          assignedValue: z.number(),
        })
      ),
    });

    const { id } = paramSchema.parse(request.params);
    const { additionalServices } = bodySchema.parse(request.body);

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!call) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    // Verifica permissão: técnico responsável pelo chamado ou admin
    if (request.user?.role === "technician") {
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: { userId: request.user.id },
      });

      if (!technicianProfile || call.technicianId !== technicianProfile.id) {
        throw new AppError(
          "Você não tem permissão para alterar serviços deste chamado.",
          403
        );
      }
    } else if (request.user?.role !== "admin") {
      throw new AppError(
        "Apenas técnicos responsáveis e administradores podem alterar serviços.",
        403
      );
    }

    // Usa transação para atualizar os serviços
    await prisma.$transaction(async (tx) => {
      // Remove todos os serviços adicionais existentes (exceto o primeiro serviço principal)
      if (call.services.length > 1) {
        await tx.callService.deleteMany({
          where: {
            callId: id,
            serviceId: {
              not: call.services[0].serviceId, // Mantém o primeiro serviço
            },
          },
        });
      }

      // Adiciona os novos serviços adicionais
      for (const service of additionalServices) {
        // Cria um serviço temporário se não existir
        let tempService = await tx.service.findUnique({
          where: { name: service.name },
        });

        if (!tempService) {
          tempService = await tx.service.create({
            data: {
              name: service.name,
              value: service.assignedValue,
              active: true,
            },
          });
        }

        // Associa o serviço ao chamado
        await tx.callService.create({
          data: {
            callId: id,
            serviceId: tempService.id,
            assignedValue: service.assignedValue,
          },
        });
      }
    });

    // Atualiza o updatedAt do chamado
    await prisma.call.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Busca o chamado atualizado
    const updatedCall = await prisma.call.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!updatedCall) {
      throw new AppError("Erro ao buscar chamado atualizado.", 500);
    }

    // Calcula o valor total atualizado
    const totalValue = updatedCall.services.reduce(
      (sum, cs) => sum + cs.assignedValue,
      0
    );

    response.json({
      message: "Serviços adicionais atualizados com sucesso.",
      call: {
        id: updatedCall.id,
        name: updatedCall.name,
        description: updatedCall.description,
        status: updatedCall.status,
        createdAt: updatedCall.createdAt,
        updatedAt: updatedCall.updatedAt,
        client: {
          name: updatedCall.client.user.name,
          email: updatedCall.client.user.email,
          profileImage: updatedCall.client.profileImage
            ? `${process.env.BASE_URL || "http://localhost:3333"}${
                updatedCall.client.profileImage
              }`
            : null,
        },
        technician: {
          name: updatedCall.technician.user.name,
          email: updatedCall.technician.user.email,
          profileImage: updatedCall.technician.profileImage
            ? `${process.env.BASE_URL || "http://localhost:3333"}${
                updatedCall.technician.profileImage
              }`
            : null,
        },
        services: updatedCall.services.map((cs) => ({
          id: cs.service.id,
          name: cs.service.name,
          assignedValue: cs.assignedValue,
        })),
        totalValue,
      },
    });
  };

  // Deleta um chamado
  delete = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    const call = await prisma.call.findUnique({
      where: { id },
    });

    if (!call) {
      throw new AppError("Chamado não encontrado", 404);
    }

    // Verifica permissões - apenas clientes donos do chamado ou admin podem excluir
    if (request.user?.role === "client") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: request.user.id },
      });

      if (!clientProfile || call.clientId !== clientProfile.id) {
        throw new AppError(
          "Você não tem permissão para excluir este chamado",
          403
        );
      }
    } else if (request.user?.role !== "admin") {
      throw new AppError(
        "Apenas o cliente dono do chamado ou administradores podem excluir cjamado.",
        403
      );
    }

    // Usa transação para excluir registros relacionados
    await prisma.$transaction(async (tx) => {
      // Exclui os serviços relacionados
      await tx.callService.deleteMany({
        where: {
          callId: id,
        },
      });

      // Exclui o chamado
      await tx.call.delete({
        where: {
          id,
        },
      });
    });

    response.json({
      message: "Chamado excluído com sucesso.",
    });
  };

  // Verifica disponibilidade de técnicos
  checkAvailability = async (request: Request, response: Response) => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    // Busca técnicos com disponibilidades
    const technicians = await prisma.technicianProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedCalls: {
          where: {
            status: {
              in: [CallStatus.open, CallStatus.in_progress],
            },
          },
        },
      },
    });

    const availabilityInfo = technicians.map((tech) => {
      const isAvailable = tech.availability.some((timeSlot) => {
        const [hour, minute] = timeSlot.split(":").map(Number);
        const slotTime = hour * 60 + minute;
        const currentSlotTime = currentHour * 60 + currentMinute;

        // Considera disponível se estiver dentro de 30 minutos de tolerância
        return Math.abs(slotTime - currentSlotTime) <= 30;
      });

      return {
        id: tech.id,
        name: tech.user.name,
        email: tech.user.email,
        availability: tech.availability,
        isAvailableNow: isAvailable,
        currentCalls: tech.assignedCalls.length,
        profileImage: tech.profileImage,
      };
    });

    const availableTechnicians = availabilityInfo.filter(
      (tech) => tech.isAvailableNow
    );
    const unavailableTechnicians = availabilityInfo.filter(
      (tech) => !tech.isAvailableNow
    );

    response.json({
      currentTime: currentTimeString,
      totalTechnicians: technicians.length,
      availableTechnicians: availableTechnicians.length,
      unavailableTechnicians: unavailableTechnicians.length,
      technicians: availabilityInfo,
      canCreateCall: availableTechnicians.length > 0,
      message:
        availableTechnicians.length > 0
          ? "Há técnicos disponíveis para atendimento."
          : "Nenhum técnico disponível no horário atual.",
    });
  };
}

export { CallsController };
