import { BookFormat } from "../../generated/prisma/enums";
import prisma from "../../lib/prisma";

const defaultInclude = {
  authors: true,
  categories: true,
  series: true,
};

export const findAll = () =>
  prisma.book.findMany({
    include: defaultInclude,
    orderBy: { createdAt: "desc" },
  });

export const findById = (id: number) =>
  prisma.book.findUnique({ where: { id }, include: defaultInclude });

export const findByCategory = (name: string) =>
  prisma.book.findMany({
    where: { categories: { some: { name } } },
    include: defaultInclude,
  });

export const findByAuthor = (name: string) =>
  prisma.book.findMany({
    where: { authors: { some: { name } } },
    include: defaultInclude,
  });

export const findBySeries = (name: string) =>
  prisma.book.findMany({
    where: { series: { name } },
    include: defaultInclude,
    orderBy: { seriesOrder: "asc" },
  });

/**
 * Busca un libro por ISBN
 */
export const findByIsbn = (isbn: string) =>
  prisma.book.findUnique({
    where: { isbn },
    include: defaultInclude,
  });

/**
 * Busca un libro por hash de archivo
 */
export const findByFileHash = (fileHash: string) =>
  prisma.book.findUnique({
    where: { fileHash },
    include: defaultInclude,
  });

/**
 * Busca un libro por ruta de archivo
 */
export const findByFilePath = (filePath: string) =>
  prisma.book.findUnique({
    where: { filePath },
    include: defaultInclude,
  });

/**
 * Busca libros con el mismo título (normalizado) y al menos un autor en común
 * Útil para detectar duplicados cuando no hay ISBN
 */
export const findByTitleAndAuthor = (title: string, authorName: string) =>
  prisma.book.findFirst({
    where: {
      title,
      authors: {
        some: { name: authorName },
      },
    },
    include: defaultInclude,
  });

/**
 * Verifica si existe un libro con el mismo ISBN o con el mismo título + autor
 * Retorna el libro existente si lo encuentra, null si no existe
 */
export const checkBookExists = async (
  isbn: string | null,
  title: string,
  authors: string[],
) => {
  // Si tiene ISBN, buscar por ISBN primero (más confiable)
  if (isbn) {
    const bookByIsbn = await findByIsbn(isbn);
    if (bookByIsbn) return bookByIsbn;
  }

  // Si no tiene ISBN o no se encontró por ISBN, buscar por título + autor
  if (authors.length > 0) {
    const bookByTitleAuthor = await findByTitleAndAuthor(title, authors[0]);
    if (bookByTitleAuthor) return bookByTitleAuthor;
  }

  return null;
};

type CreateBookRepositoryInput = {
  title: string;
  isbn: string | null;
  format: BookFormat;
  publisher: string | null;
  publishYear: number | null;
  coverPath: string | null;
  filePath: string | null;
  fileHash: string | null;
  seriesOrder: number | null;
  authors: string[];
  categories: string[];
  seriesName: string | null;
};
export const create = async (data: CreateBookRepositoryInput) => {
  const { authors, categories, seriesName, ...bookData } = data;

  return prisma.$transaction(async (tx) => {
    return tx.book.create({
      data: {
        ...bookData,

        authors: {
          connectOrCreate: authors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },

        categories: {
          connectOrCreate: categories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },

        ...(seriesName && {
          series: {
            connectOrCreate: {
              where: { name: seriesName },
              create: { name: seriesName },
            },
          },
        }),
      },
      include: {
        authors: true,
        categories: true,
        series: true,
      },
    });
  });
};
type UpdateBookRepositoryInput = {
  title?: string;
  isbn?: string | null;
  format?: BookFormat;
  publisher?: string | null;
  publishYear?: number | null;
  coverPath?: string | null;
  seriesOrder?: number | null;
  authors?: string[];
  categories?: string[];
  seriesName?: string | null;
};

export const update = async (
  bookId: number,
  data: UpdateBookRepositoryInput,
) => {
  return prisma.$transaction(async (tx) => {
    const { authors, categories, seriesName, ...bookData } = data;

    // 1️⃣ Campos simples (incluye coverPath)
    await tx.book.update({
      where: { id: bookId },
      data: bookData,
    });

    // 2️⃣ Autores
    if (authors) {
      await tx.book.update({
        where: { id: bookId },
        data: {
          authors: {
            set: [],
            connectOrCreate: authors.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        },
      });
    }

    // 3️⃣ Categorías
    if (categories) {
      await tx.book.update({
        where: { id: bookId },
        data: {
          categories: {
            set: [],
            connectOrCreate: categories.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        },
      });
    }

    // 4️⃣ Serie
    if (seriesName !== undefined) {
      await tx.book.update({
        where: { id: bookId },
        data: seriesName
          ? {
              series: {
                connectOrCreate: {
                  where: { name: seriesName },
                  create: { name: seriesName },
                },
              },
            }
          : { series: { disconnect: true } },
      });
    }

    return tx.book.findUnique({
      where: { id: bookId },
      include: {
        authors: true,
        categories: true,
        series: true,
      },
    });
  });
};

export const remove = (bookId: number) => {
  return prisma.book.delete({ where: { id: bookId } });
};
