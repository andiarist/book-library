import { BookFormat } from "../../generated/prisma/enums";
import prisma from "../../lib/prisma";

const include = {
  authors: true,
  categories: true,
  series: true,
} as const;

const includeAndOrder = {
  include,
  orderBy: { createdAt: "desc" as const },
};

export const findAll = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      ...includeAndOrder,
      skip,
      take: limit,
    }),
    prisma.book.count(),
  ]);

  return {
    books,
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
