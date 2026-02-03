import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import fs from 'fs';
import booksRoutes from './modules/books/books.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (portadas de libros)
const coversPath = path.join(process.cwd(), 'storage', 'covers');
console.log('📁 Sirviendo portadas desde:', coversPath);
console.log('📂 Archivos disponibles:', fs.readdirSync(coversPath));

app.use('/covers', express.static(coversPath));

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Book Library API Docs',
  }),
);

// Endpoint para obtener el spec JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/books', booksRoutes);

export default app;
