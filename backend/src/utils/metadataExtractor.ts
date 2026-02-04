import * as fs from "fs";
import * as path from "path";
// @ts-ignore - epub2 no tiene tipos oficiales completos
import EPub from "epub2";
// @ts-ignore - pdf-parse tiene problemas con tipos en esta versión
const pdf = require("pdf-parse");

export interface ExtractedMetadata {
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  categories?: string[];
}

/**
 * Extrae metadata de un archivo EPUB
 */
const extractEpubMetadata = async (
  filePath: string,
): Promise<ExtractedMetadata | null> => {
  try {
    const epub = new EPub(filePath);

    // Parsear el EPUB
    await new Promise((resolve, reject) => {
      epub.on("end", resolve);
      epub.on("error", reject);
      epub.parse();
    });

    // Extraer autores
    const authors: string[] = [];
    if (epub.metadata.creator) {
      if (Array.isArray(epub.metadata.creator)) {
        authors.push(...epub.metadata.creator);
      } else if (typeof epub.metadata.creator === "string") {
        authors.push(epub.metadata.creator);
      }
    }

    // Extraer año de publicación
    let publishYear: number | undefined;
    if (epub.metadata.date) {
      const dateStr =
        typeof epub.metadata.date === "string"
          ? epub.metadata.date
          : String(epub.metadata.date);
      const yearMatch = dateStr.match(/\d{4}/);
      if (yearMatch) {
        publishYear = parseInt(yearMatch[0]);
      }
    }

    // Extraer categorías/géneros
    const categories: string[] = [];
    if (epub.metadata.subject) {
      if (Array.isArray(epub.metadata.subject)) {
        categories.push(...epub.metadata.subject);
      } else if (typeof epub.metadata.subject === "string") {
        categories.push(epub.metadata.subject);
      }
    }

    return {
      title:
        epub.metadata.title || path.basename(filePath, path.extname(filePath)),
      authors: authors.length > 0 ? authors : ["Autor Desconocido"],
      isbn: epub.metadata.ISBN || undefined,
      publisher: epub.metadata.publisher || undefined,
      publishYear,
      categories: categories.length > 0 ? categories : undefined,
    };
  } catch (error) {
    console.error(`Error al extraer metadata de EPUB ${filePath}:`, error);
    return null;
  }
};

/**
 * Extrae metadata de un archivo PDF
 * Nota: Los PDFs suelen tener menos metadata estructurada que EPUBs
 */
const extractPdfMetadata = async (
  filePath: string,
): Promise<ExtractedMetadata | null> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    const info = data.info;

    // Intentar extraer autor
    const authors: string[] = [];
    if (info?.Author) {
      authors.push(info.Author);
    }

    // Intentar extraer año
    let publishYear: number | undefined;
    if (info?.CreationDate) {
      const yearMatch = info.CreationDate.match(/\d{4}/);
      if (yearMatch) {
        publishYear = parseInt(yearMatch[0]);
      }
    }

    return {
      title:
        info?.Title ||
        info?.Subject ||
        path.basename(filePath, path.extname(filePath)),
      authors: authors.length > 0 ? authors : ["Autor Desconocido"],
      publisher: info?.Producer || undefined,
      publishYear,
    };
  } catch (error) {
    console.error(`Error al extraer metadata de PDF ${filePath}:`, error);
    return null;
  }
};

/**
 * Extrae metadata de un archivo según su extensión
 */
export const extractMetadata = async (
  filePath: string,
): Promise<ExtractedMetadata | null> => {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".epub":
      return extractEpubMetadata(filePath);
    case ".pdf":
      return extractPdfMetadata(filePath);
    case ".mobi":
    case ".azw3":
      // Por ahora, estos formatos no tienen extracción automática
      // Se podría usar calibre o librerías específicas en el futuro
      return {
        title: path.basename(filePath, path.extname(filePath)),
        authors: ["Autor Desconocido"],
      };
    default:
      return null;
  }
};
