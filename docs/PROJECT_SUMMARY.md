# 📋 Resumen del Proyecto Book Library

## 🎯 Visión General

**Book Library** es una aplicación fullstack para gestionar tu biblioteca personal de libros, con backend propio (Express + Prisma + SQLite) y frontend React.

### Estado Actual: Aplicación Fullstack Completa ✅

- Backend REST API con Express y Prisma
- Frontend React con Tailwind CSS
- Base de datos SQLite
- Escáner automático de archivos locales (EPUB, PDF, MOBI, AZW3)
- Búsqueda de metadatos con APIs externas (Google Books, Open Library)
- Gestión completa de biblioteca (CRUD)

## 📦 Estructura del Proyecto

```
book-library/
├── backend/                    # API REST
│   ├── src/
│   │   ├── modules/books/     # Módulo de libros
│   │   │   ├── books.controller.ts
│   │   │   ├── books.service.ts
│   │   │   ├── books.repository.ts
│   │   │   ├── books.routes.ts
│   │   │   ├── books.types.ts
│   │   │   ├── books.external.ts
│   │   │   └── docs/
│   │   ├── config/            # Configuración
│   │   ├── utils/             # Utilidades
│   │   ├── lib/               # Cliente Prisma
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── storage/
│   │   └── covers/            # Portadas de libros
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/         # Tarjetas de libros
│   │   │   ├── modals/        # Modales (Detalle, Edición, Scan)
│   │   │   ├── previews/      # Visores (PDF, EPUB)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── BookInfoItem.tsx
│   │   ├── pages/
│   │   │   ├── LibraryPage.tsx
│   │   │   └── SearchPage.tsx
│   │   ├── hooks/
│   │   │   └── useBooks.ts
│   │   ├── services/          # Servicios API externos
│   │   │   ├── googleBooksService.ts
│   │   │   ├── openLibraryService.ts
│   │   │   └── bookMetadataService.ts
│   │   ├── api/               # Cliente API backend
│   │   │   ├── books.api.ts
│   │   │   └── http.ts
│   │   ├── types/
│   │   ├── helpers/
│   │   ├── __tests__/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── docs/                       # Documentación
    ├── README.md
    ├── API_EXAMPLES.md
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT.md
    ├── DUPLICATE_VALIDATION.md
    ├── LIBRARY_SCANNER.md
    ├── PNPM_GUIDE.md
    └── PROJECT_SUMMARY.md
```

## 🛠️ Stack Tecnológico

### Backend

- **Express 5** - Framework web
- **TypeScript** - Type safety
- **Prisma** - ORM
- **SQLite** - Base de datos
- **Swagger** - Documentación API
- **epub2 / pdf-parse** - Parsers de archivos

### Frontend

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Estilos
- **TanStack Query** - Gestión de estado servidor
- **Axios** - Cliente HTTP
- **epubjs / pdfjs** - Visores de archivos

### Testing & Quality

- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **ESLint** - Linting
- **Prettier** - Code formatting

### Package Manager

- **pnpm** - Gestión de dependencias

## 🎯 Características Implementadas

### ✅ Backend

1. **API REST completa** con endpoints CRUD
2. **Escáner de biblioteca** - Detecta archivos locales automáticamente
3. **Extracción de metadatos** desde archivos EPUB y PDF
4. **Validación de duplicados** (por ISBN, hash, título+autor)
5. **Gestión de portadas** - Almacenamiento local
6. **Integración con APIs externas** (Google Books, Open Library)
7. **Arquitectura limpia** (Controller → Service → Repository)
8. **Documentación Swagger** generada automáticamente

### ✅ Frontend

1. **Página de Biblioteca** - Lista todos los libros
2. **Página de Búsqueda** - Busca en APIs externas
3. **Modal de detalles** - Visualiza información completa
4. **Modal de edición** - Edita metadatos
5. **Modal de resultados de escaneo** - Muestra libros encontrados
6. **Visor de PDF** integrado
7. **Visor de EPUB** integrado
8. **Componentes reutilizables** (Button, Input, BookInfoItem)
9. **Diseño responsive** con Tailwind CSS

### ✅ Funcionalidades Core

1. Añadir libros manualmente o desde APIs
2. Escanear carpetas locales automáticamente
3. Editar metadatos de libros existentes
4. Eliminar libros de la biblioteca
5. Ver portadas y metadatos
6. Leer libros (PDF y EPUB) en la app
7. Búsqueda por ISBN en APIs externas
8. Prevención automática de duplicados

## 📊 Métricas del Proyecto

### Backend

- **Endpoints API**: ~10
- **Servicios**: 1 (books)
- **Utilidades**: 8 (scanner, extractors, formatters, etc.)
- **Migraciones**: 3

### Frontend

- **Páginas**: 2
- **Componentes**: 12+
- **Modales**: 4
- **Hooks personalizados**: 1
- **Servicios**: 3
- **Tests**: 1

### Configuración

- **Total archivos de config**: 15+
- **Scripts npm**: 20+ (backend + frontend)
- **Documentación**: 8 archivos

## 🚀 Inicio Rápido

### Requisitos

- Node.js (v20+)
- pnpm (10+)

### Instalación

#### 1. Backend

```bash
cd backend
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar cliente Prisma
pnpm prisma generate

# Aplicar migraciones
pnpm prisma migrate dev

# Iniciar servidor
pnpm dev
```

El backend estará en `http://localhost:3001`

#### 2. Frontend

```bash
cd frontend
pnpm install

# (Opcional) Configurar API keys
cp .env.example .env

# Iniciar desarrollo
pnpm dev
```

El frontend estará en `http://localhost:5173`

### Comandos Esenciales

**Backend:**

```bash
pnpm dev              # Desarrollo
pnpm build            # Build producción
pnpm start            # Ejecutar build
pnpm prisma studio    # UI base de datos
```

**Frontend:**

```bash
pnpm dev              # Desarrollo
pnpm test             # Tests
pnpm build            # Build producción
pnpm lint             # Verificar código
pnpm format           # Formatear código
```

## 🎓 Recursos de Aprendizaje

### Documentación Incluida

1. **[README.md](../README.md)** - Documentación principal
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura backend
3. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guía de desarrollo frontend
4. **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Ejemplos de uso de APIs
5. **[LIBRARY_SCANNER.md](./LIBRARY_SCANNER.md)** - Escáner de biblioteca
6. **[DUPLICATE_VALIDATION.md](./DUPLICATE_VALIDATION.md)** - Validación de duplicados
7. **[PNPM_GUIDE.md](./PNPM_GUIDE.md)** - Guía de pnpm

### APIs y Tecnologías

- [Express Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Books API](https://developers.google.com/books)
- [Open Library API](https://openlibrary.org/developers/api)

## 🤝 Contribución

### Commits Convencionales

```bash
feat(scope): nueva funcionalidad
fix(scope): corrección de bug
docs(scope): documentación
test(scope): tests
refactor(scope): refactorización
```

### Code Style

- ESLint + Prettier configurados
- Ejecutar `pnpm lint:fix` y `pnpm format` antes de commit
- Todos los tests deben pasar

## 📈 Funcionalidades Futuras

### Planificadas

- [ ] Sistema de categorías y etiquetas personalizadas
- [ ] Búsqueda avanzada en biblioteca local
- [ ] Estadísticas de lectura
- [ ] Export/Import de biblioteca
- [ ] Sincronización en la nube (opcional)
- [ ] Soporte para más formatos (CBR, CBZ, etc.)
- [ ] Recomendaciones de libros basadas en biblioteca
- [ ] Modo oscuro
- [ ] Integración con Goodreads

### En Consideración

- [ ] App móvil con React Native
- [ ] Escaneo de códigos de barras (móvil)
- [ ] Cliente desktop con Tauri
- [ ] Lector de eBooks mejorado con anotaciones

## 🎉 Conclusión

Este proyecto proporciona una solución completa y moderna para gestionar una biblioteca personal de libros. La arquitectura fullstack bien estructurada facilita el mantenimiento y la extensión con nuevas funcionalidades.

**Características principales:**

- ✅ Backend robusto con API REST
- ✅ Frontend moderno con React y Tailwind
- ✅ Base de datos SQLite integrada
- ✅ Escáner automático de archivos locales
- ✅ Integración con APIs externas
- ✅ Visores de PDF y EPUB integrados
- ✅ Gestión completa de biblioteca

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0  
**Licencia**: ISC
