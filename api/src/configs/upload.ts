import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

// Permite configurar diretórios via variáveis de ambiente para ambientes como Render
const ENV_TMP_DIR = process.env.TMP_DIR;
const ENV_UPLOADS_DIR = process.env.UPLOADS_DIR;

// Diretórios padrão caem para a pasta do projeto quando não configurados
const DEFAULT_TMP = path.resolve(__dirname, "..", "..", "tmp");
const DEFAULT_UPLOADS = path.resolve(DEFAULT_TMP, "uploads");

const TMP_FOLDER = ENV_TMP_DIR ? path.resolve(ENV_TMP_DIR) : DEFAULT_TMP;
const UPLOADS_FOLDER = ENV_UPLOADS_DIR
  ? path.resolve(ENV_UPLOADS_DIR)
  : DEFAULT_UPLOADS;

// Criar diretórios se não existirem
if (!fs.existsSync(TMP_FOLDER)) {
  fs.mkdirSync(TMP_FOLDER, { recursive: true });
}
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

const MAX_FILE_SIZE = 1024 * 1024 * 1; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpg", "image/jpeg", "image/png"];

// Configuração do multer
const MULTER = {
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(16).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};

export default {
  TMP_FOLDER,
  UPLOADS_FOLDER,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  MULTER,
};
