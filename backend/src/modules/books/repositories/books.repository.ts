import { BookFormat } from '../../../generated/prisma/enums';
import prisma from '../../../lib/prisma';

const include = {
  authors: true,
  categories: true,
  series: true,
} as const;

const includeAndOrder = {
  include,
  orderBy: { createdAt: 'desc' as const },
};

interface BookFilters {
  search?: string;
  format?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

  // Construir orderBy
  let orderBy: any = { createdAt: 'desc' };

  if (filters?.sortBy) {
    const sortOrder = filters.sortOrder || 'desc';

    if (filters.sortBy === 'author') {
      // Para ordenar por autor, necesitamos un enfoque especial
      orderBy = { authors: { _count: sortOrder } };
    } else {
      orderBy = { [filters.sortBy]: sortOrder };
    }
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  // Si ordenamos por autor, hacemos un post-sort en memoria
  let sortedBooks = books;
  if (filters?.sortBy === 'author') {
    sortedBooks = [...books].sort((a, b) => {
      const authorA = a.authors[0]?.name || '';
      const authorB = b.authors[0]?.name || '';
      const comparison = authorA.localeCompare(authorB);
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  return {
    books: sortedBooks,
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
    orderBy: { seriesOrder: 'asc' },
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

  return prisma.$transaction(tx =>
    tx.book.create({
      data: {
        ...bookData,
        authors: {
          connectOrCreate: authors.map(name => ({
            where: { name },
            create: { name },
          })),
        },
        categories: {
          connectOrCreate: categories.map(name => ({
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
  prisma.$transaction(async tx => {
    const { authors, categories, seriesName, ...bookData } = data;

    // campos simples (incluye coverPath)
    await tx.book.update({ where: { id: bookId }, data: bookData });

    if (authors) {
      await tx.book.update({
        where: { id: bookId },
        data: {
          authors: {
            set: [],
            connectOrCreate: authors.map(name => ({
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
            connectOrCreate: categories.map(name => ({
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
