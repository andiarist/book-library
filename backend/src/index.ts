import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import axios from 'axios';
import { normalizeString } from './utils/formatters';
import prisma from './lib/prisma';
import { BookInput } from './types/books';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ENDPOINT DE BÚSQUEDA (ETAPA 1) ---
app.get('/api/search/isbn/:isbn', async (req: Request, res: Response) => {
  const { isbn } = req.params;
  const cleanISBN = (isbn as string).replace(/[-\s]/g, '');

  try {
    // 1. Intentar Google Books
    const gResponse = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`,
    );

    if (gResponse.data.items?.length > 0) {
      const info = gResponse.data.items[0].volumeInfo;
      return res.json({
        title: info.title,
        authors: info.authors || [],
        categories: info.categories || [],
        publisher: info.publisher,
        publishYear: info.publishedDate
          ? parseInt(info.publishedDate.substring(0, 4))
          : null,
        imageUrl: info.imageLinks?.thumbnail,
      });
    }

    // 2. Fallback a Open Library (si Google falla)
    const olResponse = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`,
    );
    const bookKey = `ISBN:${cleanISBN}`;

    if (olResponse.data[bookKey]) {
      const info = olResponse.data[bookKey];
      return res.json({
        title: info.title,
        authors: info.authors?.map((a: any) => a.name) || [],
        categories: info.subjects?.slice(0, 5).map((s: any) => s.name) || [],
        publisher: info.publishers?.[0]?.name,
        publishYear: info.publish_date
          ? parseInt(info.publish_date.match(/\d{4}/)?.[0] || '')
          : null,
        imageUrl: info.cover?.large || info.cover?.medium,
      });
    }

    res
      .status(404)
      .json({ message: 'Libro no encontrado en bases de datos externas' });
  } catch (error) {
    console.error('Error buscando metadata:', error);
    res.status(500).json({ error: 'Error interno al buscar el libro' });
  }
});

// --- ENDPOINTS GET PARA OBTENER LIBROS ---

// Obtener TODOS los libros
app.get('/api/books', async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        authors: true,
        categories: true,
        series: true,
      },
      orderBy: {
        createdAt: 'desc', // Los más recientes primero
      },
    });
    res.json(books);
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ error: 'Error al obtener libros' });
  }
});

// Obtener un libro por ID
app.get('/api/books/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        authors: true,
        categories: true,
        series: true,
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ error: 'Error al obtener libro' });
  }
});

// Obtener libros por categoría
app.get(
  '/api/books/category/:categoryName',
  async (req: Request, res: Response) => {
    try {
      const { categoryName } = req.params;
      const normalizedCategory = normalizeString(categoryName as string);

      const books = await prisma.book.findMany({
        where: {
          categories: {
            some: {
              name: normalizedCategory,
            },
          },
        },
        include: {
          authors: true,
          categories: true,
          series: true,
        },
      });

      res.json(books);
    } catch (error) {
      console.error('Error al buscar por categoría:', error);
      res.status(500).json({ error: 'Error al buscar libros por categoría' });
    }
  },
);

// Obtener libros por autor
app.get(
  '/api/books/author/:authorName',
  async (req: Request, res: Response) => {
    try {
      const { authorName } = req.params;
      const normalizedAuthor = normalizeString(authorName as string);

      const books = await prisma.book.findMany({
        where: {
          authors: {
            some: {
              name: normalizedAuthor,
            },
          },
        },
        include: {
          authors: true,
          categories: true,
          series: true,
        },
      });

      res.json(books);
    } catch (error) {
      console.error('Error al buscar por autor:', error);
      res.status(500).json({ error: 'Error al buscar libros por autor' });
    }
  },
);

// Obtener libros de una saga/serie
app.get(
  '/api/books/series/:seriesName',
  async (req: Request, res: Response) => {
    try {
      const { seriesName } = req.params;
      const normalizedSeries = normalizeString(seriesName as string);

      const books = await prisma.book.findMany({
        where: {
          series: {
            name: normalizedSeries,
          },
        },
        include: {
          authors: true,
          categories: true,
          series: true,
        },
        orderBy: {
          seriesOrder: 'asc', // Ordenados por el número de orden en la saga
        },
      });

      res.json(books);
    } catch (error) {
      console.error('Error al buscar por serie:', error);
      res.status(500).json({ error: 'Error al buscar libros por serie' });
    }
  },
);
// --- ENDPOINT DE GUARDADO (CON NORMALIZACIÓN) ---

app.post('/api/books', async (req: Request, res: Response) => {
  try {
    const {
      title,
      isbn,
      authors,
      categories,
      publisher,
      publishYear,
      seriesName,
      seriesOrder,
      format,
    } = req.body as BookInput;

    // Normalización de datos
    const cleanTitle = normalizeString(title);
    const cleanAuthors = (authors || []).map(normalizeString);
    const cleanCategories = (categories || []).map(normalizeString);
    const cleanSeries = seriesName ? normalizeString(seriesName) : null;

    const book = await prisma.book.create({
      data: {
        title: cleanTitle,
        isbn: isbn || null,
        format: format || 'PHYSICAL',
        publisher: publisher || null,
        publishYear: publishYear || null,
        seriesOrder: seriesOrder ? Number(seriesOrder) : null,

        // Relación Muchos a Muchos: Autores
        authors: {
          connectOrCreate: cleanAuthors.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },

        // Relación Muchos a Muchos: Categorías
        categories: {
          connectOrCreate: cleanCategories.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },

        // Relación 1 a Muchos: Saga
        ...(cleanSeries && {
          series: {
            connectOrCreate: {
              where: { name: cleanSeries },
              create: { name: cleanSeries },
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

    res.status(201).json(book);
  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error al guardar en la base de datos' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
