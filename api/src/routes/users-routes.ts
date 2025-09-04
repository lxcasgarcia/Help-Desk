import { Router } from "express";
import { UsersController } from "../controllers/users-controller";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const usersRoutes = Router();
const usersController = new UsersController();

// Rota para criar novo usuário (pública, sem autenticação)
usersRoutes.post("/", usersController.create);

// Rota para obter perfil do usuário autenticado (todos os roles)
usersRoutes.get(
  "/profile",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "technician", "client"]),
  usersController.getProfile
);

// Rota para atualizar perfil do usuário autenticado (todos os roles)
usersRoutes.patch(
  "/profile",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "technician", "client"]),
  usersController.updateProfile
);

// Rota para atualizar senha do usuário autenticado (todos os roles)
usersRoutes.patch(
  "/profile/password",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "technician", "client"]),
  usersController.updatePassword
);

export { usersRoutes };
