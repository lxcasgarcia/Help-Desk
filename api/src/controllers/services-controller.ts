import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";

class ServicesController {
  // Cria um novo serviço com validação de nome único
  async create(request: Request, response: Response) {
    // Valida dados de entrada do serviço
    const bodySchema = z.object({
      name: z.string().trim().min(3, {
        message: "Nome do serviço deve ter pelo menos 3 caracteres.",
      }),
      value: z
        .number()
        .positive({ message: "Valor deve ser um número positivo." }),
    });

    const { name, value } = bodySchema.parse(request.body);

    // Verifica se já existe serviço com o mesmo nome
    const serviceWithSameName = await prisma.service.findUnique({
      where: { name },
    });

    if (serviceWithSameName) {
      throw new AppError("Já existe um serviço cadastrado com esse nome.", 400);
    }

    // Cria o serviço no banco de dados
    const service = await prisma.service.create({
      data: {
        name,
        value,
        active: true,
      },
    });

    response.status(201).json({
      message: "Serviço criado com sucesso.",
      service: {
        id: service.id,
        name: service.name,
        value: service.value,
        active: service.active,
      },
    });
  }

  // Lista serviços com paginação e busca
  async index(request: Request, response: Response) {
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
    let whereClause: any = {};

    if (search) {
      whereClause = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const skip = (page - 1) * perPage;

    // Busca serviços e total em paralelo para otimização
    const [services, totalCount] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        skip,
        take: perPage,
        orderBy: { name: "asc" },
      }),
      prisma.service.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    response.json({
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        value: service.value,
        active: service.active,
      })),
      pagination: {
        page,
        perPage,
        totalRecords: totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      },
    });
  }

  // Busca um serviço específico pelo ID
  show = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do serviço inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    response.json({
      id: service.id,
      name: service.name,
      value: service.value,
      active: service.active,
    });
  };

  // Atualiza informações de um serviço específico
  async update(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID inválido." }),
    });

    const bodySchema = z.object({
      name: z
        .string()
        .trim()
        .min(3, {
          message: "Nome do serviço deve ter pelo menos 3 caracteres.",
        })
        .optional(),
      value: z
        .number()
        .positive({ message: "Valor deve ser um número positivo." })
        .optional(),
    });

    const { id } = paramSchema.parse(request.params);
    const updateData = bodySchema.parse(request.body);

    const existingService = await prisma.service.findUnique({ where: { id } });

    if (!existingService) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    if (updateData.name && updateData.name !== existingService.name) {
      const serviceWithSameName = await prisma.service.findUnique({
        where: { name: updateData.name },
      });

      if (serviceWithSameName) {
        throw new AppError(
          "Já existe um serviço cadastrado com esse nome.",
          400
        );
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    response.json({
      message: "Serviço atualizado com sucesso.",
      service: {
        id: updatedService.id,
        name: updatedService.name,
        value: updatedService.value,
        active: updatedService.active,
      },
    });
  }

  // Ativa/desativa o status de um serviço
  updateStatus = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do serviço inválido." }),
    });

    const bodySchema = z.object({
      active: z.boolean({
        invalid_type_error: "O status 'active' deve ser um booleano.",
      }),
    });

    const { id } = paramSchema.parse(request.params);
    const { active } = bodySchema.parse(request.body);

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    // Se o serviço está sendo desativado, verificar se está em chamados abertos ou em andamento
    if (active === false) {
      const activeCallsUsingService = await prisma.callService.count({
        where: {
          serviceId: id,
          call: {
            status: { in: ["open", "in_progress"] },
          },
        },
      });

      if (activeCallsUsingService > 0) {
        throw new AppError(
          "Não é possível desativar o serviço, pois ele está vinculado a chamados abertos ou em andamento.",
          400
        );
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { active },
    });

    response.json({
      message: `Serviço ${
        updatedService.active ? "ativado" : "desativado"
      } com sucesso.`,
      service: updatedService,
    });
  };

  // Exclui um serviço
  delete = async (request: Request, response: Response) => {
    const paramSchema = z.object({
      id: z.string().uuid({ message: "ID do serviço inválido." }),
    });

    const { id } = paramSchema.parse(request.params);

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado.", 404);
    }

    // Verificar se o serviço está sendo usado em algum chamado
    const callsUsingService = await prisma.callService.count({
      where: { serviceId: id },
    });

    if (callsUsingService > 0) {
      throw new AppError(
        "Não é possível excluir o serviço, pois ele está vinculado a chamados existentes. Considere desativá-lo.",
        400
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    response.json({
      message: "Serviço excluído com sucesso.",
    });
  };
}

export { ServicesController };
