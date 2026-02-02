# Book Library

Proyecto fullstack para gestionar una biblioteca de libros (API + frontend).

## Visión general

- Backend: carpeta `backend` (API REST con Express + Prisma).
- Frontend: carpeta `frontend` (React + Vite).
- Base de datos: SQLite por defecto (configurada vía `DATABASE_URL`).

## Requisitos

- Node.js (v20.19+, v22.12+, v24.0+)
- pnpm (10+)

## Instalación

1. Backend

   ```bash
   cd backend
   pnpm install
   ```

2. Frontend

   ```bash
   cd ../frontend
   pnpm install
   ```

## Backend — inicializar y ejecutar

1. Configurar variables de entorno
   - Renombra el fichero `.env.expample` a `.env` con los datos necesarios:

2. Generar cliente Prisma

   ```bash
   cd backend
   pnpm prisma generate
   ```

3. Aplicar migraciones (desarrollo)

   ```bash
   pnpm prisma migrate dev
   ```

4. Ejecutar en modo desarrollo

   ```bash
   pnpm dev
   ```

   - Los scripts del backend están en [backend/package.json](backend/package.json).

5. Build y producción

   ```bash
   pnpm build
   pnpm start
   ```

## Frontend — inicializar y ejecutar

1. Instalar dependencias (ver sección Instalación).

2. Ejecutar en modo desarrollo

   ```bash
   cd frontend
   pnpm dev
   ```

3. Build para producción

   ```bash
   pnpm build
   pnpm preview
   ```

4. Tests y utilidades
   - Ejecutar tests: `pnpm test` (en `frontend`).
   - Lint: `pnpm lint`.

Los scripts del frontend se pueden ver en [frontend/package.json](frontend/package.json).

## Almacenamiento de cubiertas (WIP)

- Las cubiertas locales se guardan en `backend/storage/covers`.
- Asegúrese de que la carpeta exista y tenga permisos de escritura por el proceso del servidor.

## Documentación y ejemplos

- Ejemplos de API: [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md)
- Desarrollo y guías: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Notas adicionales

- Prisma: la configuración está en [backend/prisma.config.ts](backend/prisma.config.ts) y el esquema en [backend/prisma/schema.prisma](backend/prisma/schema.prisma).
- El backend usa SQLite por defecto según el esquema. Si usa otra base de datos, ajuste `DATABASE_URL` y el `provider` en `schema.prisma`.

## Comandos útiles rápidos

- Instalar (root): `pnpm -w install`
- Backend dev: `cd backend && pnpm dev`
- Frontend dev: `cd frontend && pnpm dev`
- Generar Prisma: `cd backend && pnpm prisma generate`
- Migraciones (dev): `cd backend && pnpm prisma migrate dev`
