import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import booksRoutes from './modules/books/books.routes';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', // Puerto por defecto de Vite
    credentials: true,
  }),
);
app.use(express.json());

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
