# 📚 Biblioteca Personal

Una aplicación para gestionar tu colección de libros con búsqueda de metadatos desde Google Books y Open Library.

## 🚀 Características

- ✅ Búsqueda de libros por ISBN
- ✅ Integración con Google Books API (primaria)
- ✅ Fallback a Open Library API
- ✅ Gestión de biblioteca personal
- ✅ Tests con Vitest y React Testing Library
- ✅ Linting con ESLint
- ✅ Formateo con Prettier
- 🔜 Lectura de carpetas locales de eBooks (Fase 2 con Tauri)
- 🔜 Escaneo de códigos de barras desde móvil (Fase 3)

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **APIs**: Google Books API, Open Library API
- **Futuro**: Tauri para funcionalidades nativas

## 📋 Prerequisitos

- Node.js >= 18
- pnpm >= 8 (Recomendado)

> 💡 **¿Primera vez con pnpm?** Lee la [Guía Rápida de pnpm](./docs/PNPM_GUIDE.md) para instalación y comandos útiles.

Si no tienes pnpm instalado:

```bash
npm install -g pnpm
# o
corepack enable
corepack prepare pnpm@latest --activate
```

## 🔧 Instalación

### Opción 1: Setup Automático (Recomendado)

**Linux/macOS:**

```bash
git clone <tu-repo>
cd book-library
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell):**

```powershell
git clone <tu-repo>
cd book-library
.\setup.ps1
```

El script automáticamente:

- ✅ Verifica Node.js y pnpm
- ✅ Instala dependencias
- ✅ Crea archivo `.env`
- ✅ Ejecuta verificaciones de código

### Opción 2: Setup Manual

1. Clona el repositorio:

```bash
git clone <tu-repo>
cd book-library
```

2. Instala las dependencias:

```bash
pnpm install
```

3. (Opcional) Configura tu API key de Google Books:

```bash
cp .env.example .env
# Edita .env y añade tu VITE_GOOGLE_BOOKS_API_KEY
```

> **Nota**: La API key de Google Books es opcional. Sin ella, la aplicación funcionará pero con límites de uso más restrictivos. Open Library siempre funcionará como fallback.

## 🏃 Desarrollo

```bash
# Inicia el servidor de desarrollo
pnpm dev

# Ejecuta tests
pnpm test

# Ejecuta tests con UI
pnpm test:ui

# Genera reporte de cobertura
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

## 🏗️ Build

```bash
pnpm build
pnpm preview
```

## 📁 Estructura del Proyecto

```
book-library/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ISBNSearchForm.tsx
│   │   └── BookCard.tsx
│   ├── hooks/               # Custom hooks
│   │   └── useBookMetadata.ts
│   ├── services/            # Servicios para APIs
│   │   ├── googleBooksService.ts
│   │   ├── openLibraryService.ts
│   │   └── bookMetadataService.ts
│   ├── types/               # Definiciones de tipos
│   │   └── book.ts
│   ├── __tests__/           # Tests
│   │   ├── useBookMetadata.test.ts
│   │   └── ISBNSearchForm.test.tsx
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── setupTests.ts        # Configuración de tests
├── vite.config.ts           # Configuración de Vite
├── tsconfig.json            # Configuración de TypeScript
├── .eslintrc.cjs            # Configuración de ESLint
├── .prettierrc              # Configuración de Prettier
└── package.json
```

## 🧪 Testing

Los tests están configurados con Vitest y React Testing Library. Incluyen:

- Tests unitarios para hooks personalizados
- Tests de componentes con user interactions
- Configuración para coverage con formato LCOV (compatible con SonarQube)

```bash
# Ejecutar tests en modo watch
npm test

# Generar coverage
npm run test:coverage
```

El reporte de coverage se genera en formato LCOV en `coverage/lcov.info`, listo para integrarse con SonarQube.

## 🔐 Variables de Entorno

| Variable                    | Descripción             | Obligatoria      |
| --------------------------- | ----------------------- | ---------------- |
| `VITE_GOOGLE_BOOKS_API_KEY` | API key de Google Books | No (recomendada) |

## 🗺️ Roadmap

### Fase 1: Prototipo Web ✅

- [x] Setup del proyecto
- [x] Integración con APIs
- [x] Búsqueda por ISBN
- [x] UI básica
- [x] Testing

### Fase 2: Tauri Desktop 🔄

- [ ] Migración a Tauri
- [ ] Lectura de carpetas locales
- [ ] Extracción de metadatos de EPUB/PDF
- [ ] Base de datos local (SQLite)
- [ ] Gestión completa de biblioteca

### Fase 3: Móvil 📱

- [ ] Escaneo de códigos de barras
- [ ] Sincronización entre dispositivos
- [ ] App móvil (RN/Expo o Tauri Mobile)

## 🤝 Contribuir

> 📖 Lee la [Guía de Desarrollo](./docs/DEVELOPMENT.md) para mejores prácticas, testing, debugging y más.

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

MIT

## 📚 Documentación

- **[README.md](./docs/README.md)** - Este archivo (visión general)
- **[PNPM_GUIDE.md](./docs/PNPM_GUIDE.md)** - Guía completa de pnpm
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Guía de desarrollo y mejores prácticas
- **[API_EXAMPLES.md](./docs/API_EXAMPLES.md)** - Ejemplos de uso de servicios y hooks
- **[TAURI_MIGRATION.md](./docs/TAURI_MIGRATION.md)** - Guía para migrar a Tauri (Fase 2)

## 🔗 Enlaces Útiles

- [Google Books API](https://developers.google.com/books)
- [Open Library API](https://openlibrary.org/developers/api)
- [Tauri Docs](https://tauri.app/)
- [Vite Docs](https://vitejs.dev/)
- [Vitest Docs](https://vitest.dev/)
- [pnpm Docs](https://pnpm.io/)
