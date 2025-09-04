import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, "uploads");

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
