import { Router } from "express";
import { TechniciansController } from "../controllers/technicians-controller";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const techniciansRoutes = Router();
const techniciansController = new TechniciansController();

// Rota para criar novo técnico (apenas admins)
techniciansRoutes.post(
  "/",
  verifyUserAuthorization(["admin"]),
  techniciansController.create
);

// Rota para listar técnicos com paginação e busca (apenas admins)
techniciansRoutes.get(
  "/",
  verifyUserAuthorization(["admin"]),
  techniciansController.index
);

// Rota para obter detalhes de um técnico específico (apenas admins)
techniciansRoutes.get(
  "/:id",
  verifyUserAuthorization(["admin"]),
  techniciansController.show
);

// Rota para atualizar informações de um técnico (apenas admins)
techniciansRoutes.put(
  "/:id",
  verifyUserAuthorization(["admin"]),
  techniciansController.update
);

// Rota para excluir um técnico (apenas admins)
techniciansRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  techniciansController.delete
);

export { techniciansRoutes };
