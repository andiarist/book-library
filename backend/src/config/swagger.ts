import path from "path";
import fs from "fs";
import YAML from "yaml";

// Leer el archivo YAML de documentación de books
const booksDocsPath = path.join(
  __dirname,
  "../modules/books/docs/books.openapi.yaml",
);
const booksDocsYaml = fs.readFileSync(booksDocsPath, "utf8");
const booksDocs = YAML.parse(booksDocsYaml);

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Book Library API",
    version: "1.0.0",
    description: "API para gestión de biblioteca personal de libros",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Servidor de desarrollo",
    },
  ],
  tags: [
    {
      name: "Books",
      description: "Endpoints para gestión de libros",
    },
    {
      name: "Search",
      description: "Endpoints para búsqueda externa de metadatos",
    },
  ],
  components: {
    schemas: {
      Book: {
        type: "object",
        required: ["id", "title", "format"],
        properties: {
          id: {
            type: "integer",
            description: "ID autogenerado del libro",
            example: 1,
          },
          title: {
            type: "string",
            description: "Título del libro (normalizado)",
            example: "el señor de los anillos",
          },
          isbn: {
            type: "string",
            description: "ISBN del libro",
            example: "978-0261103252",
            nullable: true,
          },
          format: {
            type: "string",
            enum: ["EPUB", "PDF", "PHYSICAL", "MOBI", "AZW3"],
            description: "Formato del libro",
            example: "PHYSICAL",
          },
          publisher: {
            type: "string",
            description: "Editorial",
            example: "HarperCollins",
            nullable: true,
          },
          publishYear: {
            type: "integer",
            description: "Año de publicación",
            example: 1954,
            nullable: true,
          },
          coverPath: {
            type: "string",
            description: "Ruta de la imagen de portada",
            example: "/uploads/covers/book-123.jpg",
            nullable: true,
          },
          seriesOrder: {
            type: "integer",
            description: "Orden en la serie",
            example: 1,
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Fecha de creación del registro",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Fecha de última actualización",
          },
          authors: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Author",
            },
          },
          categories: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Category",
            },
          },
          series: {
            $ref: "#/components/schemas/Series",
            nullable: true,
          },
        },
      },
      Author: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            description: "Nombre del autor (normalizado)",
            example: "j.r.r. tolkien",
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            description: "Nombre de la categoría (normalizado)",
            example: "fantasia",
          },
        },
      },
      Series: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            description: "Nombre de la serie (normalizado)",
            example: "el señor de los anillos",
          },
        },
      },
      CreateBookDTO: {
        type: "object",
        required: ["title", "format", "authors", "categories"],
        properties: {
          title: {
            type: "string",
            description: "Título del libro",
            example: "El Señor de los Anillos",
          },
          isbn: {
            type: "string",
            description: "ISBN del libro",
            example: "978-0261103252",
          },
          format: {
            type: "string",
            enum: ["EPUB", "PDF", "PHYSICAL", "MOBI", "AZW3"],
            description: "Formato del libro",
            example: "PHYSICAL",
          },
          publisher: {
            type: "string",
            description: "Editorial",
            example: "HarperCollins",
          },
          publishYear: {
            type: "integer",
            description: "Año de publicación",
            example: 1954,
          },
          coverPath: {
            type: "string",
            description: "Ruta de la imagen de portada (uso manual)",
            example: "/covers/book-123.jpg",
            nullable: true,
          },
          imageUrl: {
            type: "string",
            format: "uri",
            description:
              "URL externa de la portada (se descargará automáticamente)",
            example: "https://books.google.com/books/content?id=xxx",
          },
          seriesName: {
            type: "string",
            description: "Nombre de la serie",
            example: "El Señor de los Anillos",
          },
          seriesOrder: {
            type: "integer",
            description: "Orden en la serie",
            example: 1,
          },
          authors: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Lista de nombres de autores",
            example: ["J.R.R. Tolkien"],
            minItems: 1,
          },
          categories: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Lista de categorías",
            example: ["Fantasía", "Aventura"],
            minItems: 1,
          },
        },
      },
      UpdateBookDTO: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título del libro",
            example: "El Señor de los Anillos",
          },
          isbn: {
            type: "string",
            description: "ISBN del libro",
            example: "978-0261103252",
            nullable: true,
          },
          format: {
            type: "string",
            enum: ["EPUB", "PDF", "PHYSICAL", "MOBI", "AZW3"],
            description: "Formato del libro",
          },
          publisher: {
            type: "string",
            description: "Editorial",
            nullable: true,
          },
          publishYear: {
            type: "integer",
            description: "Año de publicación",
            nullable: true,
          },
          coverPath: {
            type: "string",
            description: "Ruta de la imagen de portada (uso manual)",
            nullable: true,
          },
          imageUrl: {
            type: "string",
            format: "uri",
            description:
              "URL externa de la portada (se descargará automáticamente y reemplazará la anterior)",
            example: "https://books.google.com/books/content?id=xxx",
          },
          seriesName: {
            type: "string",
            description: "Nombre de la serie (null para desconectar)",
            nullable: true,
          },
          seriesOrder: {
            type: "integer",
            description: "Orden en la serie",
            nullable: true,
          },
          authors: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Lista de nombres de autores",
          },
          categories: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Lista de categorías",
          },
        },
      },
      BookMetadata: {
        type: "object",
        properties: {
          title: {
            type: "string",
            example: "El Señor de los Anillos",
          },
          authors: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["J.R.R. Tolkien"],
          },
          categories: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["Fantasía", "Aventura"],
          },
          publisher: {
            type: "string",
            example: "HarperCollins",
          },
          publishYear: {
            type: "integer",
            example: 1954,
          },
          imageUrl: {
            type: "string",
            format: "uri",
            example: "https://books.google.com/books/content?id=xxx",
            nullable: true,
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Error message",
          },
        },
      },
    },
  },
  // Merge paths from YAML files
  paths: {
    ...booksDocs.paths,
  },
};
