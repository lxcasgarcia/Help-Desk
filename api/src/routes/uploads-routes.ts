import { Router } from "express";
import { UploadsController } from "../controllers/uploads-controller";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import multer from "multer";
import uploadConfig from "../configs/upload";

const uploadsRoutes = Router();
const uploadsController = new UploadsController();

// Configuração do multer para upload de arquivos
const upload = multer(uploadConfig.MULTER);

// Rota para atualizar imagem de perfil (clientes, técnicos e admins)
uploadsRoutes.patch(
  "/profile-image",
  verifyUserAuthorization(["client", "technician", "admin"]),
  upload.single("profileImage"),
  uploadsController.updateProfileImage
);

export { uploadsRoutes };
