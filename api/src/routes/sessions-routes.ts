import { Router } from "express";
import { SessionsController } from "../controllers/sessions-controller";

const sessionsRoutes = Router();
const sessionsController = new SessionsController();

// Rota para autenticação e login (pública, sem autenticação)
sessionsRoutes.post("/", sessionsController.create);

export { sessionsRoutes };
