import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import EPub from "epub2";

const COVERS_DIR = path.resolve(process.cwd(), "storage", "covers");

const mimeToExt = (mime?: string) => {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  return "jpg";
};

const pickCoverItemId = (epub: any): string | null => {
  // 1) meta cover id (lo más habitual)
  const metaCover =
    epub?.metadata?.cover ??
    epub?.metadata?.meta?.cover ??
    epub?.metadata?.["meta"]?.cover ??
    null;

  if (metaCover && epub?.manifest?.[metaCover]) return metaCover;

  // 2) manifest item con properties="cover-image" (EPUB3)
  if (epub?.manifest) {
    for (const [id, item] of Object.entries<any>(epub.manifest)) {
      const props = String(item?.properties || "").toLowerCase();
      if (props.includes("cover-image")) return id;
    }
  }

  // 3) fallback: por nombre/href típico
  if (epub?.manifest) {
    for (const [id, item] of Object.entries<any>(epub.manifest)) {
      const href = String(item?.href || "").toLowerCase();
      const idLc = String(id).toLowerCase();
      const isImg = String(item?.["media-type"] || "")
        .toLowerCase()
        .startsWith("image/");
      if (isImg && (href.includes("cover") || idLc.includes("cover")))
        return id;
    }
  }

  return null;
};

export async function extractAndSaveEpubCover(
  epubPath: string,
  filenameBase: string, // sin extensión
): Promise<string | null> {
  const epub = new EPub(epubPath);

  await new Promise<void>((resolve, reject) => {
    epub.on("end", () => resolve());
    epub.on("error", (e: unknown) => reject(e));
    epub.parse();
  });

  const coverId = pickCoverItemId(epub as any);
  if (!coverId) return null;

  const { data, mime } = await new Promise<{ data: Buffer; mime?: string }>(
    (resolve, reject) => {
      epub.getImage(
        coverId,
        (err: Error | null, data?: Buffer, mimeType?: string) => {
          if (err || !data) {
            return reject(err || new Error("No cover data"));
          }
          resolve({ data, mime: mimeType });
        },
      );
    },
  ).catch(() => ({ data: null as any, mime: undefined }));

  if (!data) return null;

  await fs.promises.mkdir(COVERS_DIR, { recursive: true });

  const ext = mimeToExt(mime);
  const filename = `${filenameBase}.${ext}`;
  const absolute = path.join(COVERS_DIR, filename);

  await fs.promises.writeFile(absolute, data);

  // Guardamos un path relativo que luego puedas servir con tu endpoint estático
  return path.join("storage", "covers", filename).replace(/\\/g, "/");
}
