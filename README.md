# 📚 Book Library

Aplicación fullstack para gestionar tu biblioteca personal de libros con escaneo automático de archivos locales, búsqueda de metadatos y gestión completa de tu colección.

## ✨ Características

- 📖 **Gestión completa de biblioteca** - CRUD de libros con metadatos ricos
- 🔍 **Escaneo automático** - Detecta archivos EPUB, PDF, MOBI, AZW3 en carpetas locales
- 🌐 **Búsqueda externa** - Integración con Google Books y Open Library API
- 📊 **Base de datos local** - SQLite integrada sin configuración adicional
- 🖼️ **Gestión de portadas** - Almacenamiento y visualización de portadas
- 📱 **Visor integrado** - Lee PDFs y EPUBs directamente en la aplicación
- 🎨 **Interfaz moderna** - React con Tailwind CSS
- 🚀 **API REST completa** - Backend Express con documentación Swagger

## 🏗️ Arquitectura

```
book-library/
├── backend/           # API REST (Express + Prisma + SQLite)
│   ├── src/
│   │   ├── modules/books/    # Módulo de libros
│   │   ├── utils/            # Utilidades (scanner, extractors)
│   │   ├── config/           # Configuración
│   │   └── lib/              # Cliente Prisma
│   ├── prisma/               # Schema y migraciones
│   └── storage/covers/       # Portadas almacenadas
│
└── frontend/          # React + Vite + Tailwind
    ├── src/
    │   ├── components/       # Componentes reutilizables
    │   ├── pages/            # Páginas (Library, Search)
    │   ├── api/              # Cliente API backend
    │   └── services/         # Servicios externos
    └── public/
```

## 📋 Requisitos

- **Node.js** v20+ (recomendado v20.19+, v22.12+ o v24.0+)
- **pnpm** 10+ (recomendado como package manager)

## 🚀 Inicio Rápido

### 1. Clonar e Instalar

```bash
# Clonar repositorio
git clone <repo-url>
cd book-library

# Instalar dependencias del backend
cd backend
pnpm install

# Instalar dependencias del frontend
cd ../frontend
pnpm install
```

### 2. Configurar Backend

```bash
cd backend

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tu configuración
# LIBRARY_PATH=C:/Users/TuUsuario/Books  # Ruta a tu biblioteca
# DATABASE_URL="file:./dev.db"            # Base de datos SQLite
# PORT=3001                               # Puerto del servidor

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

# (Opcional) Configurar API keys para búsqueda externa
cp .env.example .env
# Agregar VITE_GOOGLE_BOOKS_API_KEY si tienes una

# Iniciar en modo desarrollo
pnpm dev
```

El frontend estará disponible en `http://localhost:5173`

## 💻 Comandos de Desarrollo

### Backend

```bash
cd backend

pnpm dev              # Desarrollo con hot-reload
pnpm build            # Build para producción
pnpm start            # Ejecutar build de producción
pnpm prisma studio    # Abrir UI de base de datos
pnpm prisma generate  # Regenerar cliente Prisma
```

### Frontend

```bash
cd frontend

pnpm dev              # Desarrollo con hot-reload
pnpm build            # Build para producción
pnpm preview          # Preview del build
pnpm test             # Ejecutar tests
pnpm lint             # Verificar código
pnpm format           # Formatear código
```

## 🔄 Actualizar en Otro Equipo

Si ya tienes el proyecto configurado y actualizas el código:

```bash
# 1. Actualizar código
git pull origin main

# 2. Backend: Aplicar migraciones pendientes
cd backend
pnpm prisma migrate deploy
pnpm prisma generate

# 3. Frontend: Si hay nuevas dependencias
cd ../frontend
pnpm install

# 4. Reiniciar servidores
cd ../backend && pnpm dev    # Terminal 1
cd ../frontend && pnpm dev   # Terminal 2
```

## 📡 API REST

El backend expone una API REST en `http://localhost:3001/api`:

### Endpoints Principales

- `GET /api/books` - Listar todos los libros
- `GET /api/books/:id` - Obtener un libro específico
- `POST /api/books` - Crear nuevo libro
- `PUT /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro
- `POST /api/books/scan` - Escanear carpeta de libros
- `POST /api/books/search` - Buscar en APIs externas

### Documentación Interactiva

Swagger UI disponible en: `http://localhost:3001/api-docs`

## 🗄️ Base de Datos

El proyecto usa **SQLite** por defecto (sin necesidad de servidor de BD).

### Comandos Prisma Útiles

```bash
cd backend

# Ver/editar datos visualmente
pnpm prisma studio

# Crear nueva migración
pnpm prisma migrate dev --name nombre_migracion

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
pnpm prisma migrate reset

# Ver estado de migraciones
pnpm prisma migrate status
```

### Cambiar a Otra Base de Datos

Si prefieres PostgreSQL, MySQL u otra:

1. Actualizar `DATABASE_URL` en `.env`
2. Modificar `provider` en `backend/prisma/schema.prisma`
3. Ejecutar `pnpm prisma migrate dev`

## 📦 Almacenamiento

### Portadas de Libros

Las portadas se guardan localmente en `backend/storage/covers/`:

- Extraídas automáticamente de archivos EPUB/PDF
- Descargadas desde APIs externas cuando están disponibles
- Servidas estáticamente por el backend en `/covers/:filename`

Asegúrate de que la carpeta tenga permisos de escritura.

## 🧪 Testing

### Frontend

```bash
cd frontend

# Ejecutar todos los tests
pnpm test

# Tests con interfaz visual
pnpm test:ui

# Generar reporte de cobertura
pnpm test:coverage
```

## 📚 Documentación Adicional

- **[PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Resumen completo del proyecto
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura del backend
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Guía detallada de desarrollo
- **[API_EXAMPLES.md](docs/API_EXAMPLES.md)** - Ejemplos de uso de APIs
- **[LIBRARY_SCANNER.md](docs/LIBRARY_SCANNER.md)** - Documentación del escáner
- **[DUPLICATE_VALIDATION.md](docs/DUPLICATE_VALIDATION.md)** - Validación de duplicados
- **[PNPM_GUIDE.md](docs/PNPM_GUIDE.md)** - Guía de pnpm
- **[TAILWIND_GUIDE.md](docs/TAILWIND_GUIDE.md)** - Guía de Tailwind CSS

## 🛠️ Stack Tecnológico

### Backend

- Express 5 - Framework web
- TypeScript - Type safety
- Prisma - ORM
- SQLite - Base de datos
- Swagger - Documentación API
- epub2 / pdf-parse - Parsers

### Frontend

- React 18 - Framework UI
- Vite - Build tool
- Tailwind CSS 4 - Estilos
- TanStack Query - State management
- Axios - HTTP client
- epubjs / pdfjs - Visores

## 🎯 Uso Típico

1. **Primera vez**: Configurar backend y frontend, ejecutar migraciones
2. **Escanear biblioteca**: POST a `/api/books/scan` con la ruta de tu carpeta
3. **Buscar nuevo libro**: Usar la página de búsqueda por ISBN
4. **Gestionar**: Editar, eliminar, ver detalles desde la interfaz
5. **Leer**: Abrir visor integrado de PDF/EPUB

## 🔧 Configuración Avanzada

### Variables de Entorno Backend

```env
# backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
LIBRARY_PATH=C:/Users/TuUsuario/Books
```

### Variables de Entorno Frontend

```env
# frontend/.env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_BOOKS_API_KEY=tu_api_key_opcional
```

## 🐛 Solución de Problemas

### Backend no inicia

```bash
cd backend
pnpm prisma generate    # Regenerar cliente Prisma
pnpm prisma studio      # Verificar BD
```

### Frontend no conecta

- Verificar que backend esté corriendo en puerto 3001
- Verificar CORS en `backend/src/app.ts`
- Verificar `VITE_API_URL` en frontend

### Errores de TypeScript

```bash
# Backend
cd backend
pnpm prisma generate

# Frontend
cd frontend
pnpm type-check
```

## 🚢 Despliegue

### Backend

```bash
cd backend
pnpm build
pnpm prisma migrate deploy
pnpm start
```

### Frontend

```bash
cd frontend
pnpm build
# Los archivos estarán en /dist
# Servir con nginx, vercel, netlify, etc.
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Commits Convencionales

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` formateo
- `refactor:` refactorización
- `test:` tests
- `chore:` mantenimiento

## 📄 Licencia

ISC

## 🎉 Características Futuras

- [ ] Categorías y etiquetas personalizadas
- [ ] Búsqueda avanzada en biblioteca
- [ ] Estadísticas de lectura
- [ ] Export/Import de biblioteca
- [ ] Modo oscuro
- [ ] App móvil con React Native
- [ ] Cliente desktop con Electron/Tauri

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0

Para más información, consulta la [documentación completa](docs/PROJECT_SUMMARY.md).
