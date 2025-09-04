import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { getAbsoluteImageUrl } from "../utils/UrlHelper";
import { compare, hash } from "bcrypt";
import { ProfileImageGenerator } from "../utils/ProfileImageGenerator";

// Enum para definir os roles disponíveis no sistema
enum UserRole {
  client = "client",
  admin = "admin",
  technician = "technician",
}

class UsersController {
  // Registra um novo usuário com perfil específico baseado no role
  create = async (request: Request, response: Response) => {
    // Valida dados de entrada do usuário
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
      role: z
        .enum([UserRole.admin, UserRole.technician, UserRole.client])
        .default(UserRole.client),
    });

    const { name, email, password, role } = bodySchema.parse(request.body);

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

    // Criptografa a senha com bcrypt
    const hashedPassword = await hash(password, 8);

    // Gera imagem de perfil padrão para o novo usuário
    const defaultProfileImage =
      await ProfileImageGenerator.generateDefaultProfileImage({
        name,
        size: 200,
        format: "png",
        saveLocally: true,
      });

    // Prepara dados de criação baseados no role
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role: role,
    };

    // Inclui o profile correto baseado no role
    const includeData: any = {};

    if (role === UserRole.admin) {
      // Cria perfil de admin
      userData.adminProfile = {
        create: {
          profileImage: defaultProfileImage,
        },
      };
      includeData.adminProfile = true;
    } else if (role === UserRole.technician) {
      // Cria perfil de técnico com disponibilidade vazia
      userData.technicianProfile = {
        create: {
          profileImage: defaultProfileImage,
          availability: [],
        },
      };
      includeData.technicianProfile = true;
    } else {
      // Cria perfil de cliente (role padrão)
      userData.clientProfile = {
        create: {
          profileImage: defaultProfileImage,
        },
      };
      includeData.clientProfile = true;
    }

    // Cria o usuário com o perfil correspondente
    const user = await prisma.user.create({
      data: userData,
      include: includeData,
    });

    // Prepara resposta baseada no role
    const responseData: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const baseUrl = process.env.BASE_URL || "http://localhost:3333";

    // Adiciona dados específicos do perfil baseado no role
    if (role === UserRole.admin && (user as any).adminProfile) {
      responseData.adminProfile = {
        id: (user as any).adminProfile.id,
        profileImage: (user as any).adminProfile.profileImage
          ? `${baseUrl}${(user as any).adminProfile.profileImage}`
          : null,
      };
    } else if (
      role === UserRole.technician &&
      (user as any).technicianProfile
    ) {
      responseData.technicianProfile = {
        id: (user as any).technicianProfile.id,
        profileImage: (user as any).technicianProfile.profileImage
          ? `${baseUrl}${(user as any).technicianProfile.profileImage}`
          : null,
        availability: (user as any).technicianProfile.availability,
      };
    } else if ((user as any).clientProfile) {
      responseData.clientProfile = {
        id: (user as any).clientProfile.id,
        profileImage: (user as any).clientProfile.profileImage
          ? `${baseUrl}${(user as any).clientProfile.profileImage}`
          : null,
      };
    }

    response.status(201).json({
      message: "Usuário criado com sucesso.",
      user: responseData,
    });
  };

  // Obtém detalhes do perfil do usuário autenticado
  getProfile = async (request: Request, response: Response) => {
    const userId = request.user?.id;
    const userRole = request.user?.role;

    // Verifica se o usuário está autenticado
    if (!userId || !userRole) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    // Busca usuário com o perfil correspondente ao role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: userRole === "client",
        technicianProfile: userRole === "technician",
        adminProfile: userRole === "admin",
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    // Prepara dados básicos do usuário
    let profileData: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const baseUrl = process.env.BASE_URL || "http://localhost:3333";

    // Adiciona dados específicos do perfil baseado no role
    if (user.role === "client" && user.clientProfile) {
      profileData.profileImage = getAbsoluteImageUrl(
        user.clientProfile.profileImage || null
      );
    } else if (user.role === "technician" && user.technicianProfile) {
      profileData.profileImage = getAbsoluteImageUrl(
        user.technicianProfile.profileImage || null
      );
      profileData.availability = user.technicianProfile.availability;
    } else if (user.role === "admin" && (user as any).adminProfile) {
      profileData.profileImage = getAbsoluteImageUrl(
        (user as any).adminProfile.profileImage || null
      );
    }

    response.json(profileData);
  };

  // Atualiza o próprio perfil do usuário autenticado
  updateProfile = async (request: Request, response: Response) => {
    // Valida dados de atualização
    const bodySchema = z.object({
      name: z
        .string()
        .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
        .optional(),
      email: z.string().email({ message: "Email inválido." }).optional(),
    });

    const { name, email } = bodySchema.parse(request.body);
    const userId = request.user?.id;
    const userRole = request.user?.role;

    if (!userId || !userRole) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    // Busca usuário com perfil correspondente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: userRole === "client",
        technicianProfile: userRole === "technician",
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    // Verifica se o novo email já está em uso por outro usuário
    if (email && email !== user.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserWithEmail) {
        throw new AppError("Este email já está em uso por outro usuário.", 400);
      }
    }

    // Atualiza dados do usuário em transação
    const updatedUser = await prisma.$transaction(async (tx) => {
      const userUpdateData: any = {};
      if (name) userUpdateData.name = name;
      if (email) userUpdateData.email = email;

      const updatedUserRecord = await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
      });

      return updatedUserRecord;
    });

    response.json({
      message: "Perfil atualizado com sucesso.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt,
      },
    });
  };

  // Atualiza a senha do próprio usuário autenticado
  updatePassword = async (request: Request, response: Response) => {
    // Valida dados de alteração de senha
    const bodySchema = z.object({
      oldPassword: z
        .string()
        .min(1, { message: "Senha antiga é obrigatória." }),
      newPassword: z
        .string()
        .min(6, { message: "Nova senha deve ter pelo menos 6 caracteres." }),
    });

    const { oldPassword, newPassword } = bodySchema.parse(request.body);
    const userId = request.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    // Busca usuário para validação
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    // Verifica se a senha antiga está correta
    const passwordMatched = await compare(oldPassword, user.password);

    if (!passwordMatched) {
      throw new AppError("Senha antiga incorreta.", 400);
    }

    // Verifica se a nova senha é diferente da antiga
    if (oldPassword === newPassword) {
      throw new AppError(
        "A nova senha não pode ser igual à senha antiga.",
        400
      );
    }

    // Criptografa a nova senha
    const hashedPassword = await hash(newPassword, 8);

    // Atualiza a senha no banco
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    response.json({ message: "Senha atualizada com sucesso." });
  };
}

export { UsersController };
