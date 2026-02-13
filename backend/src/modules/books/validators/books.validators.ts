import { Request } from "express";

export class ValidationError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Valida y parsea el ID de un libro desde los parámetros de la ruta
 */
export const parseBookId = (req: Request): number => {
  const id = Number(req.params.id);

  if (Number.isNaN(id) || id <= 0) {
    throw new ValidationError("Invalid book ID");
  }

  return id;
};

/**
 * Valida el query parameter requerido
 */
export const requireQueryParam = (req: Request, paramName: string): string => {
  const value = req.query[paramName] as string;

  if (!value || value.trim().length === 0) {
    throw new ValidationError(`Query parameter "${paramName}" is required`);
  }

  return value.trim();
};

/**
 * Valida parámetros de paginación
 */
export const parsePaginationParams = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(req.query.limit as string) || 20),
  );

  return { page, limit };
};

/**
 * Valida parámetros de ordenamiento
 */
export const parseSortParams = (req: Request) => {
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

  // Whitelist de campos permitidos para ordenar
  const allowedSortFields = [
    "createdAt",
    "title",
    "publishYear",
    "author",
    "series",
  ];

  if (!allowedSortFields.includes(sortBy)) {
    throw new ValidationError(`Invalid sortBy field: ${sortBy}`);
  }

  if (sortOrder !== "asc" && sortOrder !== "desc") {
    throw new ValidationError(`Invalid sortOrder: ${sortOrder}`);
  }

  return { sortBy, sortOrder };
};
