import { Router } from "express";
import { ServicesController } from "../controllers/services-controller";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const servicesRoutes = Router();
const servicesController = new ServicesController();

// Rota para criar novo serviço (apenas admins)
servicesRoutes.post(
  "/",
  verifyUserAuthorization(["admin"]),
  servicesController.create
);

// Rota para listar serviços com paginação e busca (usuários autenticados)
servicesRoutes.get("/", ensureAuthenticated, servicesController.index);

// Rota para obter detalhes de um serviço específico (apenas admins)
servicesRoutes.get(
  "/:id",
  verifyUserAuthorization(["admin"]),
  servicesController.show
);

// Rota para atualizar informações de um serviço (apenas admins)
servicesRoutes.put(
  "/:id",
  verifyUserAuthorization(["admin"]),
  servicesController.update
);

// Rota para ativar/desativar status de um serviço (apenas admins)
servicesRoutes.patch(
  "/:id/status",
  verifyUserAuthorization(["admin"]),
  servicesController.updateStatus
);

// Rota para excluir um serviço (apenas admins)
servicesRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  servicesController.delete
);

export { servicesRoutes };
