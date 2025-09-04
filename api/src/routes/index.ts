import { Router } from "express";

import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { callsRoutes } from "./calls-routes";
import { techniciansRoutes } from "./technicians-routes";
import { clientsRoutes } from "./client-routes";
import { servicesRoutes } from "./services-routes";
import { uploadsRoutes } from "./uploads-routes";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/calls", ensureAuthenticated, callsRoutes);
routes.use("/technicians", ensureAuthenticated, techniciansRoutes);
routes.use("/clients", ensureAuthenticated, clientsRoutes);
routes.use("/services", ensureAuthenticated, servicesRoutes);
routes.use("/uploads", ensureAuthenticated, uploadsRoutes);

export { routes };
