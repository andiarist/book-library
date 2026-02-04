import * as crypto from "crypto";
import * as fs from "fs";

/**
 * Calcula el hash SHA256 de un archivo
 * Útil para detectar duplicados y verificar integridad
 */
export const calculateFileHash = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};
