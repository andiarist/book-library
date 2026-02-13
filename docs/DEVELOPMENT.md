# 🚀 Guía de Desarrollo - Book Library

Esta guía te ayudará a configurar y desarrollar en el proyecto Book Library, una aplicación fullstack con backend Express y frontend React.

## 📋 Requisitos Previos

- **Node.js** v20 o superior
- **pnpm** 10 o superior (recomendado) o npm
- **Git** para control de versiones
- Editor de código (recomendado: VSCode)

## 🛠️ Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <repo-url>
cd book-library
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
pnpm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tu configuración
# LIBRARY_PATH=C:/Users/TuUsuario/Books
# DATABASE_URL="file:./dev.db"
# PORT=3001

# Generar cliente Prisma
pnpm prisma generate

# Aplicar migraciones
pnpm prisma migrate dev

# Iniciar servidor en modo desarrollo
pnpm dev
```

El backend estará disponible en `http://localhost:3001`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
pnpm install

# (Opcional) Configurar API keys para búsqueda externa
cp .env.example .env
# Editar .env si tienes API keys de Google Books

# Iniciar en modo desarrollo
pnpm dev
```

El frontend estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

### Backend (`/backend`)

```
backend/
├── src/
│   ├── modules/books/          # Módulo principal de libros
│   │   ├── books.controller.ts # Maneja requests HTTP
│   │   ├── books.service.ts    # Lógica de negocio
│   │   ├── books.repository.ts # Acceso a datos
│   │   ├── books.routes.ts     # Definición de rutas
│   │   ├── books.types.ts      # Tipos TypeScript
│   │   ├── books.external.ts   # APIs externas
│   │   └── docs/               # Documentación OpenAPI
│   ├── config/                 # Configuraciones
│   ├── utils/                  # Utilidades
│   │   ├── fileScanner.ts      # Escaneo de archivos
│   │   ├── metadataExtractor.ts # Extracción de metadatos
│   │   ├── epubCoverExtractor.ts # Portadas EPUB
│   │   └── ...
│   ├── lib/
│   │   └── prisma.ts           # Cliente Prisma
│   ├── app.ts                  # Configuración Express
│   └── server.ts               # Punto de entrada
├── prisma/
│   ├── schema.prisma           # Schema de base de datos
│   └── migrations/             # Migraciones
└── storage/
    └── covers/                 # Portadas almacenadas
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/
│   │   ├── cards/              # Tarjetas de libros
│   │   │   ├── BookCardMini.tsx
│   │   │   └── BookCardSearch.tsx
│   │   ├── modals/             # Modales
│   │   │   ├── DetailBookModal.tsx
│   │   │   ├── EditBookModal.tsx
│   │   │   ├── EditLibraryBookModal.tsx
│   │   │   └── ScanResultsModal.tsx
│   │   ├── previews/           # Visores
│   │   │   ├── BookPreview.tsx
│   │   │   ├── EpubViewer.tsx
│   │   │   └── PdfViewer.tsx
│   │   ├── Button.tsx          # Componente reutilizable
│   │   ├── Input.tsx           # Componente reutilizable
│   │   └── BookInfoItem.tsx    # Componente reutilizable
│   ├── pages/
│   │   ├── LibraryPage.tsx     # Página de biblioteca
│   │   └── SearchPage.tsx      # Página de búsqueda
│   ├── hooks/
│   │   └── useBooks.ts         # Hook para gestión de libros
│   ├── services/               # Servicios externos
│   │   ├── googleBooksService.ts
│   │   ├── openLibraryService.ts
│   │   └── bookMetadataService.ts
│   ├── api/                    # Cliente API backend
│   │   ├── books.api.ts        # Endpoints de libros
│   │   └── http.ts             # Cliente Axios
│   ├── types/                  # Tipos TypeScript
│   ├── helpers/                # Utilidades
│   └── App.tsx                 # Componente principal
└── public/
```

## 💻 Comandos de Desarrollo

### Backend

```bash
# Desarrollo con hot-reload
pnpm dev

# Build para producción
pnpm build

# Ejecutar build de producción
pnpm start

# Prisma Studio (UI para base de datos)
pnpm prisma studio

# Crear nueva migración
pnpm prisma migrate dev --name nombre_migracion

# Regenerar cliente Prisma
pnpm prisma generate

# Resetear base de datos (¡CUIDADO!)
pnpm prisma migrate reset
```

### Frontend

```bash
# Desarrollo con hot-reload
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Tests
pnpm test
pnpm test:ui
pnpm test:coverage

# Linting
pnpm lint
pnpm lint:fix

# Formateo de código
pnpm format
pnpm format:check

# Type checking
pnpm type-check
```

## 🎨 Stack Tecnológico

### Backend

- **Express 5**: Framework web
- **TypeScript**: Tipado estático
- **Prisma**: ORM y migrations
- **SQLite**: Base de datos
- **Swagger**: Documentación API
- **epub2**: Parser de EPUB
- **pdf-parse**: Parser de PDF
- **fast-glob**: Escaneo de archivos
- **axios**: Cliente HTTP

### Frontend

- **React 18**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Tailwind CSS 4**: Framework CSS
- **TanStack Query**: Data fetching y caché
- **Axios**: Cliente HTTP
- **epubjs**: Visor de EPUB
- **pdfjs-dist**: Visor de PDF
- **Vitest**: Testing framework
- **React Testing Library**: Testing de componentes

## 🔧 Configuración del Editor (VSCode)

### Extensiones Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Settings VSCode

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## 📝 Convenciones de Código

### TypeScript

- Usar tipos explícitos cuando sea necesario
- Evitar `any`, usar `unknown` si es necesario
- Interfaces para objetos públicos, types para unions/intersections
- Named exports sobre default exports

### React

- Componentes funcionales con TypeScript
- Props con interfaces tipadas
- Hooks personalizados en `/hooks`
- Nombres de archivos en PascalCase para componentes

### Estilo

- ESLint y Prettier configurados
- Ordenación automática de imports
- Ordenación automática de clases Tailwind
- 2 espacios de indentación
- Sin punto y coma (configuración Prettier)

## 🧪 Testing

### Frontend

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch
pnpm test -- --watch

# Ver UI de tests
pnpm test:ui

# Generar reporte de cobertura
pnpm test:coverage
```

### Estructura de Tests

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Component from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## 🔍 Debugging

### Backend

```typescript
// Usar console.log o debugger
console.log('Debug:', variable)

// O configurar VSCode launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["dev"],
  "cwd": "${workspaceFolder}/backend"
}
```

### Frontend

- React DevTools en el navegador
- Usar `console.log()` o `debugger`
- Redux DevTools para TanStack Query

## 📚 APIs y Servicios

### Backend API

El backend expone una API REST en `http://localhost:3001`:

- `GET /api/books` - Listar todos los libros
- `GET /api/books/:id` - Obtener un libro
- `POST /api/books` - Crear libro
- `PUT /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro
- `POST /api/books/scan` - Escanear biblioteca
- `POST /api/books/search` - Buscar en APIs externas

Documentación Swagger: `http://localhost:3001/api-docs`

### APIs Externas (Frontend)

El frontend puede usar directamente:

- **Google Books API**: Búsqueda de libros por ISBN
- **Open Library API**: Metadatos alternativos

## 🚀 Despliegue

### Backend

```bash
# Build
pnpm build

# Las migraciones se deben aplicar en producción
pnpm prisma migrate deploy

# Iniciar
pnpm start
```

### Frontend

```bash
# Build
pnpm build

# Los archivos estarán en /dist
# Servir con cualquier servidor estático (nginx, vercel, netlify, etc.)
```

### Variables de Entorno Producción

**Backend (.env):**

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./prod.db"
LIBRARY_PATH=/path/to/books
```

**Frontend (.env.production):**

```env
VITE_API_URL=https://tu-api.com
VITE_GOOGLE_BOOKS_API_KEY=tu-key-opcional
```

## 🐛 Solución de Problemas

### Backend no inicia

```bash
# Regenerar Prisma client
cd backend
pnpm prisma generate

# Verificar base de datos
pnpm prisma studio
```

### Frontend no conecta con Backend

- Verificar que el backend esté corriendo en puerto 3001
- Verificar CORS en `backend/src/app.ts`
- Verificar `VITE_API_URL` en frontend

### Tests fallan

```bash
# Limpiar caché
pnpm test -- --clearCache

# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors

```bash
# Verificar versiones
pnpm type-check

# Regenerar tipos de Prisma
cd backend
pnpm prisma generate
```

## 📖 Recursos Adicionales

- [Express Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [TanStack Query Docs](https://tanstack.com/query)
- [Vitest Docs](https://vitest.dev)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Commits Convencionales

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, sin cambios en código
refactor: refactorización de código
test: añadir o corregir tests
chore: tareas de mantenimiento
```

---

**¡Happy coding! 🚀**
