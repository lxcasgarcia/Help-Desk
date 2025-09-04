import { Router } from "express";
import { ClientController } from "../controllers/clients-controller";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";

const clientsRoutes = Router();
const clientController = new ClientController();

// Rota para listar clientes com paginação e busca (apenas admins)
clientsRoutes.get(
  "/",
  verifyUserAuthorization(["admin"]),
  clientController.index
);

// Rota para atualizar informações de um cliente (apenas admins)
clientsRoutes.put(
  "/:id",
  verifyUserAuthorization(["admin"]),
  clientController.update
);

// Rota para excluir um cliente (apenas admins)
clientsRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  clientController.delete
);

// Rota para obter detalhes de um cliente específico (apenas admins)
clientsRoutes.get(
  "/:id",
  verifyUserAuthorization(["admin"]),
  clientController.show
);

export { clientsRoutes };
