# 🚀 Guía Rápida de Inicio (pnpm)

## Instalación de pnpm

Si no tienes pnpm instalado, elige una opción:

### Opción 1: Con npm
```bash
npm install -g pnpm
```

### Opción 2: Con Corepack (Node.js >= 16.13)
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Opción 3: Script de instalación
```bash
# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# Linux/macOS
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 🎯 Iniciar el Proyecto

```bash
# 1. Instalar dependencias
pnpm install

# 2. (Opcional) Configurar API de Google Books
cp .env.example .env
# Edita .env y añade tu VITE_GOOGLE_BOOKS_API_KEY

# 3. Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📝 Comandos Más Usados

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm preview          # Preview del build

# Testing
pnpm test             # Tests en modo watch
pnpm test:ui          # Tests con interfaz visual
pnpm test:coverage    # Reporte de cobertura

# Calidad de código
pnpm lint             # Ejecutar ESLint
pnpm lint:fix         # Arreglar problemas automáticamente
pnpm format           # Formatear código
pnpm type-check       # Verificar tipos TypeScript

# Gestión de dependencias
pnpm add <paquete>              # Añadir dependencia
pnpm add -D <paquete>           # Añadir dev dependency
pnpm remove <paquete>           # Eliminar dependencia
pnpm update                     # Actualizar dependencias
pnpm outdated                   # Ver dependencias obsoletas
```

## 🔍 Ventajas de pnpm

### 1. **Eficiencia de Espacio**
pnpm usa un almacén de contenido global. Los paquetes se instalan una sola vez y se crean enlaces simbólicos en cada proyecto.

```bash
# Ver estadísticas de almacenamiento
pnpm store status
```

### 2. **Más Rápido**
- Instalaciones paralelas eficientes
- Reutilización de paquetes entre proyectos

### 3. **Estructura de node_modules Estricta**
- Evita "phantom dependencies" (dependencias no declaradas)
- Solo puedes importar paquetes que declaraste explícitamente

### 4. **Workspaces Nativos**
Ideal para monorepos (cuando añadas más paquetes en el futuro):

```yaml
# pnpm-workspace.yaml (ya incluido)
packages:
  - '.'
  - 'packages/*'  # Para futuras extensiones
```

## 🛠️ Comandos Específicos de pnpm

```bash
# Actualizar pnpm
pnpm self-update

# Limpiar caché y reinstalar
pnpm store prune
pnpm install --force

# Ejecutar scripts en múltiples paquetes (monorepo)
pnpm -r run build
pnpm --filter <package-name> test

# Ver árbol de dependencias
pnpm list
pnpm list --depth=1

# Verificar integridad de node_modules
pnpm install --frozen-lockfile  # No actualiza pnpm-lock.yaml
```

## 🔄 Migración desde npm/yarn

Si tienes un `package-lock.json` o `yarn.lock`:

```bash
# pnpm lo detectará automáticamente y creará pnpm-lock.yaml
pnpm install

# Opcional: Limpiar lockfiles antiguos
rm package-lock.json  # o yarn.lock
```

## 🎨 Integración con IDEs

### VS Code
Las extensiones recomendadas ya están configuradas en `.vscode/extensions.json`. VS Code detectará automáticamente pnpm.

### WebStorm/IntelliJ
Ve a: Settings → Languages & Frameworks → Node.js → Package Manager
Selecciona: pnpm

## 📊 Monitoreo de Performance

```bash
# Ver tiempo de instalación
pnpm install --reporter=append-only

# Analizar el bundle
pnpm build
pnpm vite-bundle-visualizer  # (necesita plugin)
```

## 🐛 Solución de Problemas

### Error: ENOENT no such file or directory
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Problemas con peer dependencies
Ya configurado en `.npmrc`:
```
auto-install-peers=true
```

### Problemas con hoisting
```bash
# Editar .npmrc si es necesario
shamefully-hoist=true  # Ya configurado
```

## 🔗 Recursos

- [Documentación oficial de pnpm](https://pnpm.io/)
- [Benchmarks](https://pnpm.io/benchmarks)
- [CLI Commands](https://pnpm.io/cli/add)
- [Workspace](https://pnpm.io/workspaces)

## 🎯 Próximos Pasos

1. ✅ Proyecto configurado con pnpm
2. 🔄 Desarrolla tu aplicación
3. 📱 Cuando estés listo, migra a Tauri (ver `TAURI_MIGRATION.md`)
4. 🚀 Deploy o distribución de la app nativa

---

**Tip Pro**: Añade un alias a tu shell para acortar comandos:
```bash
# ~/.bashrc o ~/.zshrc
alias p="pnpm"
alias pd="pnpm dev"
alias pt="pnpm test"
alias pb="pnpm build"
```

Ahora puedes usar: `p install`, `pd`, `pt`, etc.
