import { Router } from "express";
import { CallsController } from "../controllers/calls-controller";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const callsRoutes = Router();
const callController = new CallsController();

// Rota para criar novo chamado (apenas clientes)
callsRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["client"]),
  callController.create
);

// Rota para listar chamados com filtros e paginação
callsRoutes.get("/", ensureAuthenticated, callController.index);

// Rota para verificar disponibilidade de técnicos em tempo real
callsRoutes.get(
  "/availability",
  ensureAuthenticated,
  callController.checkAvailability
);

// Rota para obter detalhes de um chamado específico
callsRoutes.get("/:id", ensureAuthenticated, callController.show);

// Rota para atualizar status do chamado (técnicos e admins)
callsRoutes.patch(
  "/:id/status",
  verifyUserAuthorization(["technician", "admin"]),
  callController.updateStatus
);

// Rota para adicionar serviço a um chamado (técnicos e admins)
callsRoutes.post(
  "/:id/services",
  verifyUserAuthorization(["technician", "admin"]),
  callController.addService
);

// Rota para remover serviço de um chamado (técnicos e admins)
callsRoutes.delete(
  "/:id/services/:serviceId",
  verifyUserAuthorization(["technician", "admin"]),
  callController.removeService
);

// Rota para atualizar serviços adicionais personalizados (técnicos e admins)
callsRoutes.patch(
  "/:id/additional-services",
  verifyUserAuthorization(["technician", "admin"]),
  callController.updateAdditionalServices
);

// Rota para excluir chamado (apenas dono do chamado ou admin)
callsRoutes.delete("/:id", callController.delete);

export { callsRoutes };
