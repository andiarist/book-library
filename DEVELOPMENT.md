# 💻 Guía de Desarrollo

## 🎯 Flujo de Trabajo Recomendado

### 1. Antes de Empezar
```bash
# Asegúrate de tener la última versión
pnpm install

# Verifica que todo funcione
pnpm type-check
pnpm lint
pnpm test
```

### 2. Durante el Desarrollo
```bash
# Terminal 1: Servidor de desarrollo
pnpm dev

# Terminal 2: Tests en modo watch (opcional)
pnpm test

# Antes de hacer commit
pnpm lint:fix
pnpm format
pnpm type-check
```

## 🧪 Testing

### Estructura de Tests
```typescript
// Patrón AAA (Arrange, Act, Assert)
it('should do something', async () => {
  // Arrange: Preparar datos y mocks
  const mockData = { /* ... */ };
  vi.mocked(service.method).mockResolvedValue(mockData);

  // Act: Ejecutar la acción
  const { result } = renderHook(() => useCustomHook());
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Assert: Verificar resultados
  expect(result.current.data).toEqual(mockData);
});
```

### Comandos Útiles
```bash
# Tests con cobertura detallada
pnpm test:coverage

# Tests de un archivo específico
pnpm test src/hooks/useBookMetadata.test.ts

# Tests con UI interactiva
pnpm test:ui

# Tests en modo CI (sin watch)
pnpm vitest run
```

### Coverage para SonarQube
El proyecto ya está configurado para generar reportes en formato LCOV:

```bash
pnpm test:coverage
# Genera: coverage/lcov.info
```

Configuración en SonarQube:
```properties
# sonar-project.properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=coverage/test-report.xml
sonar.typescript.tsconfigPath=tsconfig.json
```

## 🎨 Estilo de Código

### TypeScript
```typescript
// ✅ Bueno: Tipos explícitos para funciones públicas
export function searchByISBN(isbn: string): Promise<BookMetadata | null> {
  // ...
}

// ✅ Bueno: Interfaces para objetos complejos
interface BookCardProps {
  book: BookMetadata;
  onAdd?: () => void;
}

// ❌ Evitar: any sin justificación
const data: any = await fetch(); // ❌

// ✅ Mejor: Tipos específicos o unknown
const data: BookMetadata = await fetch(); // ✅
```

### React
```typescript
// ✅ Bueno: Componentes funcionales con tipos
export function BookCard({ book, onAdd }: BookCardProps) {
  return <div>...</div>;
}

// ✅ Bueno: Hooks personalizados con tipos de retorno claros
export function useBookMetadata(): UseBookMetadataReturn {
  // ...
}

// ✅ Bueno: Manejo de estados loading/error
const [loading, setLoading] = useState(false);
const [error, setError] = useState<APIError | null>(null);
```

### Nombrado
```typescript
// Componentes: PascalCase
export function BookCard() {}

// Hooks: camelCase con prefijo 'use'
export function useBookMetadata() {}

// Servicios: PascalCase + 'Service' suffix
export class GoogleBooksService {}

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Funciones y variables: camelCase
const searchBooks = () => {};
const bookData = [];
```

## 📦 Gestión de Dependencias

### Añadir Dependencias
```bash
# Dependencia de producción
pnpm add lodash

# Dependencia de desarrollo
pnpm add -D @types/lodash

# Dependencia específica de paquete (monorepo futuro)
pnpm add axios --filter book-library
```

### Actualizar Dependencias
```bash
# Ver qué está desactualizado
pnpm outdated

# Actualizar de forma interactiva
pnpm update -i

# Actualizar todo a latest
pnpm update --latest
```

### Verificar Vulnerabilidades
```bash
pnpm audit
pnpm audit --fix
```

## 🔍 Debugging

### VS Code
Configuración ya incluida en `.vscode/settings.json`:

1. Coloca breakpoints en el código
2. Presiona F5 o usa "Run and Debug"
3. VS Code se conectará al servidor de Vite

### Chrome DevTools
```bash
pnpm dev
# Abre http://localhost:5173
# F12 para abrir DevTools
```

### React DevTools
```bash
# Instala la extensión de React DevTools en Chrome/Firefox
# Te permitirá inspeccionar componentes, props, state, etc.
```

### Vitest UI
```bash
pnpm test:ui
# Abre interfaz visual en el navegador
# Útil para debugging de tests
```

## 🚀 Performance

### Analizar Bundle
```bash
# Instalar plugin
pnpm add -D rollup-plugin-visualizer

# Modificar vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Build y analizar
pnpm build
```

### Lazy Loading de Componentes
```typescript
import { lazy, Suspense } from 'react';

// Carga diferida de componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoización
```typescript
import { useMemo, useCallback } from 'react';

// Memoizar cálculos costosos
const expensiveResult = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// Memoizar callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## 🔒 Seguridad

### Variables de Entorno
```typescript
// ❌ NO exponer claves sensibles en el cliente
const API_SECRET = 'secret123'; // ❌

// ✅ Usar variables de entorno con prefijo VITE_
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

// ✅ Validar que existan (opcional)
if (!API_KEY && import.meta.env.PROD) {
  console.warn('API Key not configured');
}
```

### Validación de Inputs
```typescript
// ✅ Validar y sanitizar inputs de usuario
function validateISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return /^(97[89])?\d{9}[\dX]$/.test(cleaned);
}
```

## 📝 Git Workflow

### Commits Convencionales
```bash
# Formato: <type>(<scope>): <subject>

git commit -m "feat(search): add ISBN validation"
git commit -m "fix(api): handle network errors properly"
git commit -m "test(hooks): add tests for useBookMetadata"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(components): simplify BookCard logic"
git commit -m "chore(deps): update dependencies"
```

Tipos comunes:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `test`: Tests
- `refactor`: Refactorización
- `style`: Formateo, sin cambios de código
- `chore`: Mantenimiento, dependencias

### Pre-commit Hooks (Opcional)
```bash
# Instalar husky y lint-staged
pnpm add -D husky lint-staged

# Configurar en package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}

# Inicializar husky
pnpm exec husky init
echo "pnpm lint-staged" > .husky/pre-commit
```

## 🎓 Recursos de Aprendizaje

### React + TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Effective TypeScript](https://effectivetypescript.com/)

### Testing
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Best Practices](https://vitest.dev/guide/best-practices.html)

### Performance
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)

## 🐛 Troubleshooting Común

### Error: Module not found
```bash
# Limpiar y reinstalar
rm -rf node_modules
pnpm install
```

### TypeScript Errors en IDE
```bash
# Reiniciar TypeScript server en VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# O verificar manualmente
pnpm type-check
```

### Tests Fallando Inesperadamente
```bash
# Limpiar cache de vitest
pnpm vitest --clearCache

# Verificar mocks
# Asegúrate de llamar vi.clearAllMocks() en beforeEach
```

### Hot Reload No Funciona
```bash
# Verificar que no haya errores de sintaxis
pnpm type-check

# Reiniciar el servidor
# Ctrl + C, luego pnpm dev
```

---

💡 **Tip**: Mantén esta guía actualizada conforme el proyecto evolucione.
