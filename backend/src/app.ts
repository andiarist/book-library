import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import booksRoutes from './modules/books/books.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/books', booksRoutes);

export default app;
