import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { http } from "../lib/httpClient";

const streamPipeline = promisify(pipeline);

/**
 * Descarga una imagen desde una URL y la guarda localmente
 * @param imageUrl URL de la imagen a descargar
 * @param filename Nombre del archivo (sin extensión)
 * @returns Ruta relativa del archivo guardado o null si falla
 */
export async function downloadAndSaveCover(
  imageUrl: string,
  filename: string,
): Promise<string | null> {
  try {
    // Directorio donde se guardarán las portadas
    const coversDir = path.join(process.cwd(), "storage", "covers");

    // Crear directorio si no existe
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }
    // Descargar la imagen
    const response = await http.get(imageUrl, {
      responseType: "stream",
      timeout: 10000,
      // opcional: algunos CDNs agradecen User-Agent
      headers: { "User-Agent": "book-library-backend" },
    });

    // Detectar extensión desde Content-Type
    const contentType = response.headers["content-type"];
    let extension = "jpg"; // Por defecto

    if (contentType?.includes("png")) extension = "png";
    else if (contentType?.includes("webp")) extension = "webp";
    else if (contentType?.includes("gif")) extension = "gif";

    // Nombre final del archivo
    const finalFilename = `${filename}.${extension}`;
    const filepath = path.join(coversDir, finalFilename);

    await streamPipeline(response.data, fs.createWriteStream(filepath));

    // Retornar la ruta relativa (para guardar en BD)
    return `/covers/${finalFilename}`;
  } catch (error) {
    console.error("Error descargando portada:", error);
    return null;
  }
}

/**
 * Elimina una portada del sistema de archivos
 * @param coverPath Ruta relativa de la portada (ej: /covers/book-123.jpg)
 */
export function deleteCover(coverPath: string): void {
  try {
    if (!coverPath || !coverPath.startsWith("/covers/")) return;

    const filepath = path.join(
      process.cwd(),
      "storage",
      coverPath.replace("/covers/", "covers/"),
    );

    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (error) {
    console.error("Error eliminando portada:", error);
  }
}

/**
 * Genera un nombre único para una portada basado en timestamp y random
 */
export function generateCoverFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `book-${timestamp}-${random}`;
}
