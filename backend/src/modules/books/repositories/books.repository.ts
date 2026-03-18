import { BookFormat } from "../../../generated/prisma/enums";
import prisma from "../../../lib/prisma";

/**
 * Configuración de relaciones a incluir en las consultas de libros.
 * Define qué entidades relacionadas deben cargarse junto con cada libro:
 * - authors: Lista de autores del libro
 * - categories: Géneros/categorías asociadas
 * - series: Información de la serie a la que pertenece (si aplica)
 */
const include = {
  authors: true,
  categories: true,
  series: true,
} as const;

interface BookFilters {
  search?: string;
  format?: string;
  seriesId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const findAll = async (
  page: number = 1,
  limit: number = 20,
  filters?: BookFilters,
) => {
  const skip = (page - 1) * limit;

  // Construir where clause
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      {
        authors: {
          some: { name: { contains: filters.search } },
        },
      },
    ];
  }

  if (filters?.format) {
    where.format = filters.format;
  }

  if (filters?.seriesId) {
    where.seriesId = filters.seriesId;
  }

  // Obtener el total de resultados
  const total = await prisma.book.count({ where });

  // Caso especial: ordenar por autor o serie (relaciones)
  if (filters?.sortBy === "author" || filters?.sortBy === "series") {
    const sortOrder = filters.sortOrder || "desc";

    // 1. Obtener TODOS los libros que cumplen los filtros
    const allBooks = await prisma.book.findMany({
      where,
      include,
    });

    // 2. Ordenar TODOS los libros en memoria
    const sortedBooks = [...allBooks].sort((a, b) => {
      let comparison: number;

      if (filters?.sortBy === "author") {
        const authorA = a.authors[0]?.name || "";
        const authorB = b.authors[0]?.name || "";
        comparison = authorA.localeCompare(authorB);
      } else {
        // ordenar por serie
        const seriesA = a.series?.name || "";
        const seriesB = b.series?.name || "";
        comparison = seriesA.localeCompare(seriesB);

        // Si ambos pertenecen a la misma serie, ordenar por seriesOrder
        if (comparison === 0 && a.series?.name && b.series?.name) {
          const orderA = a.seriesOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.seriesOrder ?? Number.MAX_SAFE_INTEGER;
          comparison = orderA - orderB;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    // 3. Aplicar paginación DESPUÉS de ordenar
    const paginatedBooks = sortedBooks.slice(skip, skip + limit);

    return {
      data: paginatedBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Para otros campos, ordenar en la base de datos (más eficiente)
  let orderBy: any = { createdAt: "desc" };

  if (filters?.sortBy) {
    const sortOrder = filters.sortOrder || "desc";
    orderBy = { [filters.sortBy]: sortOrder };
  }

  const books = await prisma.book.findMany({
    where,
    include,
    orderBy,
    skip,
    take: limit,
  });

  return {
    data: books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findById = (id: number) =>
  prisma.book.findUnique({ where: { id }, include });

export const findByCategory = (name: string) =>
  prisma.book.findMany({
    where: { categories: { some: { name } } },
    include,
  });

export const findByAuthor = (name: string) =>
  prisma.book.findMany({
    where: { authors: { some: { name } } },
    include,
  });

export const findBySeries = (name: string) =>
  prisma.book.findMany({
    where: { series: { name } },
    include,
    orderBy: { seriesOrder: "asc" },
  });

export const findByIsbn = (isbn: string) =>
  prisma.book.findUnique({ where: { isbn }, include });

export const findByFileHash = (fileHash: string) =>
  prisma.book.findUnique({ where: { fileHash }, include });

export const findByFilePath = (filePath: string) =>
  prisma.book.findUnique({ where: { filePath }, include });

export const findByTitleAndAuthor = (title: string, authorName: string) =>
  prisma.book.findFirst({
    where: { title, authors: { some: { name: authorName } } },
    include,
  });

export const checkBookExists = async (
  isbn: string | null,
  title: string,
  authors: string[],
) => {
  if (isbn) {
    const byIsbn = await findByIsbn(isbn);
    if (byIsbn) return byIsbn;
  }

  if (authors.length > 0) {
    const byTitleAuthor = await findByTitleAndAuthor(title, authors[0]);
    if (byTitleAuthor) return byTitleAuthor;
  }

  return null;
};

type CreateBookRepositoryInput = {
  title: string;
  isbn: string | null;
  format: BookFormat;
  publisher: string | null;
  publishYear: number | null;
  pageCount?: number | null;
  description?: string | null;
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

  return prisma.$transaction((tx) =>
    tx.book.create({
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
      include,
    }),
  );
};

type UpdateBookRepositoryInput = {
  title?: string;
  isbn?: string | null;
  format?: BookFormat;
  publisher?: string | null;
  publishYear?: number | null;
  pageCount?: number | null;
  description?: string | null;
  coverPath?: string | null;
  seriesOrder?: number | null;
  authors?: string[];
  categories?: string[];
  seriesName?: string | null;
};

export const update = async (bookId: number, data: UpdateBookRepositoryInput) =>
  prisma.$transaction(async (tx) => {
    const { authors, categories, seriesName, ...bookData } = data;

    // campos simples (incluye coverPath)
    await tx.book.update({ where: { id: bookId }, data: bookData });

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

    return tx.book.findUnique({ where: { id: bookId }, include });
  });

export const remove = (bookId: number) =>
  prisma.book.delete({ where: { id: bookId } });

export const findAllWithFilePath = () =>
  prisma.book.findMany({
    where: { filePath: { not: null } },
    include,
  });

export const findAllSeries = async () => {
  const series = await prisma.series.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return series;
};

export const findAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return categories;
};
