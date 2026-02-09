import fs from "fs";
import path from "path";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { http } from "../lib/httpClient";

const streamPipeline = promisify(pipeline);

const COVERS_DIR = path.join(process.cwd(), "storage", "covers");

function ensureCoversDir(): string {
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }
  return COVERS_DIR;
}

function extFromMime(mimeType?: string): string {
  const m = (mimeType || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  return "jpg";
}

function publicCoverPath(finalFilename: string): string {
  return `/covers/${finalFilename}`;
}

function absoluteCoverPath(finalFilename: string): string {
  return path.join(ensureCoversDir(), finalFilename);
}

/**
 * Guarda un stream como portada en storage/covers y devuelve el path público (/covers/...)
 */
export async function saveCoverStream(
  stream: NodeJS.ReadableStream,
  filenameBase: string, // sin extensión
  mimeType?: string,
): Promise<string> {
  const extension = extFromMime(mimeType);
  const finalFilename = `${filenameBase}.${extension}`;
  const filepath = absoluteCoverPath(finalFilename);

  await streamPipeline(stream, fs.createWriteStream(filepath));

  return publicCoverPath(finalFilename);
}

/**
 * Guarda un buffer como portada en storage/covers y devuelve el path público (/covers/...)
 */
export async function saveCoverBuffer(
  data: Buffer,
  filenameBase: string, // sin extensión
  mimeType?: string,
): Promise<string> {
  // Reutilizamos la versión de stream para no duplicar lógica
  return saveCoverStream(Readable.from(data), filenameBase, mimeType);
}

/**
 * Descarga una imagen desde una URL y la guarda localmente
 * @param imageUrl URL de la imagen a descargar
 * @param filenameBase Nombre del archivo (sin extensión)
 * @returns Path público (/covers/...) o null si falla
 */
export async function downloadAndSaveCover(
  imageUrl: string,
  filenameBase: string,
): Promise<string | null> {
  try {
    ensureCoversDir();

    const response = await http.get(imageUrl, {
      responseType: "stream",
      timeout: 10000,
      headers: { "User-Agent": "book-library-backend" },
    });

    const contentType = response.headers["content-type"];
    return await saveCoverStream(response.data, filenameBase, contentType);
  } catch (error) {
    console.error("Error descargando portada:", error);
    return null;
  }
}

/**
 * Elimina una portada del sistema de archivos
 * @param coverPath Ruta pública de la portada (ej: /covers/book-123.jpg)
 */
export function deleteCover(coverPath: string): void {
  try {
    if (!coverPath || !coverPath.startsWith("/covers/")) return;

    // coverPath: /covers/xxx.jpg -> filename: xxx.jpg
    const filename = coverPath.replace("/covers/", "");
    const filepath = path.join(process.cwd(), "storage", "covers", filename);

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
