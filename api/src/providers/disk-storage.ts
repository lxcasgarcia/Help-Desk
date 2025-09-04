import fs from "node:fs";
import path from "node:path";

import uploadConfig from "../configs/upload";

// Classe para gerenciar armazenamento de arquivos em disco
export class DiskStorage {
  // Move arquivo da pasta temporária para pasta de uploads
  async saveFile(file: string) {
    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, file),
      path.resolve(uploadConfig.UPLOADS_FOLDER, file)
    );

    return file;
  }

  // Remove arquivo da pasta temporária ou de uploads
  async deleteFile(file: string, type: "tmp" | "upload") {
    // Define caminho base baseado no tipo de pasta
    const pathFile =
      type === "tmp" ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER;

    const filePath = path.resolve(pathFile, file);

    try {
      // Verifica se o arquivo existe antes de tentar excluir
      await fs.promises.stat(filePath);
    } catch {
      // Se arquivo não existe, retorna sem erro
      return;
    }

    // Remove o arquivo do disco
    await fs.promises.unlink(filePath);
  }
}
