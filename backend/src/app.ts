import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import fs from "fs";
import booksRoutes from "./modules/books/books.routes";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
console.log({ allowedOrigins });

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: ["Content-Length", "Content-Range", "Accept-Ranges"],
  }),
);
// app.use(cors({
//   origin: "http://localhost:5173",
//   allowedHeaders: ["Content-Type", "Authorization", "Range"],
//   exposedHeaders: ["Content-Length", "Content-Range", "Accept-Ranges"],
// }));

app.use(express.json({ limit: "1mb" }));

// Servir archivos estáticos (portadas)
const coversPath = path.join(process.cwd(), "storage", "covers");

if (!fs.existsSync(coversPath)) {
  console.warn("⚠️  No existe storage/covers, creando...");
  fs.mkdirSync(coversPath, { recursive: true });
}

console.log("📁 Sirviendo portadas desde:", coversPath);
app.use(
  "/covers",
  express.static(coversPath, {
    // opcional: cache en navegador
    maxAge: "1h",
    etag: true,
  }),
);

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Book Library API Docs",
  }),
);

app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/books", booksRoutes);

export default app;
