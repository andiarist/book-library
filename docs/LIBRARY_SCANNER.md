# Escáner de Biblioteca de Libros

## Descripción

Esta funcionalidad permite escanear un directorio del disco duro que contenga archivos de libros electrónicos (EPUB, PDF, MOBI, AZW3), extraer automáticamente su metadata y añadirlos a la base de datos.

## Configuración

### 1. Variables de Entorno

En el archivo `.env` del backend, configura la ruta donde están almacenados tus libros:

```env
LIBRARY_PATH="C:/Users/tuUsuario/Documentos/MisLibros"
```

**Ejemplos:**

- Windows: `C:/Users/usuario/Documentos/MisLibros`
- Linux/Mac: `/home/usuario/documentos/libros`
- Por defecto: `./storage/library` (dentro del proyecto)

### 2. Estructura del Directorio

El escáner procesará recursivamente todos los subdirectorios. Puedes organizar tus libros como prefieras:

```
MisLibros/
├── Ficción/
│   ├── libro1.epub
│   └── libro2.pdf
├── No Ficción/
│   └── libro3.epub
└── libro4.mobi
```

## Formatos Soportados

- ✅ **EPUB** (.epub)
- ✅ **PDF** (.pdf)
- ✅ **MOBI** (.mobi)
- ✅ **AZW3** (.azw3)

## Cómo Usar

### Backend (API)

#### Endpoint

```
POST /api/books/scan
```

#### Respuesta Exitosa

```json
{
  "message": "Escaneo completado",
  "libraryPath": "C:/Users/usuario/Documentos/MisLibros",
  "total": 50,
  "added": 45,
  "skipped": 3,
  "errors": 2,
  "details": [
    {
      "file": "libro1.epub",
      "status": "added",
      "bookId": 123
    },
    {
      "file": "libro2.epub",
      "status": "skipped",
      "reason": "Ya existe en la base de datos (mismo hash)"
    },
    {
      "file": "archivo_corrupto.pdf",
      "status": "error",
      "reason": "No se pudo extraer metadata del archivo"
    }
  ]
}
```

#### Ejemplo con cURL

```bash
curl -X POST http://localhost:3001/api/books/scan
```

### Frontend

Desde el frontend, puedes hacer una llamada al endpoint:

```typescript
const scanLibrary = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/books/scan", {
      method: "POST",
    });
    const results = await response.json();
    console.log("Resultados:", results);
  } catch (error) {
    console.error("Error al escanear:", error);
  }
};
```

## Metadata Extraída

El escáner extrae la siguiente información de cada archivo:

### EPUB

- ✅ Título
- ✅ Autores
- ✅ ISBN
- ✅ Editorial
- ✅ Año de publicación
- ✅ Categorías/Géneros
- ✅ Idioma

### PDF

- ✅ Título (del metadata)
- ✅ Autor (del metadata)
- ⚠️ ISBN (limitado, depende del PDF)
- ⚠️ Otros campos pueden estar limitados

### MOBI / AZW3

- ⚠️ Soporte básico (depende de la estructura del archivo)

## Prevención de Duplicados

El sistema previene duplicados mediante tres niveles:

1. **Hash del archivo**: Calcula un SHA-256 del contenido. Si el hash ya existe, omite el libro.
2. **Ruta del archivo**: Si la ruta ya existe en la BD, omite el libro.
3. **ISBN**: Si ya existe un libro con el mismo ISBN, omite el libro.

## Logs y Depuración

El proceso muestra logs detallados en la consola del servidor:

```
🔍 Iniciando escaneo de biblioteca...
📁 Encontrados 50 archivos

📖 Procesando: libro1.epub
  ✅ Hash calculado: a1b2c3d4e5f6...
  📋 Metadata extraída: El Quijote
  ✅ Añadido: El Quijote (ID: 123)

📖 Procesando: libro2.epub
  ✅ Hash calculado: f6e5d4c3b2a1...
  ⏭️  Ya existe (hash): Cien Años de Soledad

✨ Escaneo completado en 12.45s
   📊 Añadidos: 45
   ⏭️  Omitidos: 3
   ❌ Errores: 2
```

## Solución de Problemas

### Error: "No se pudo extraer metadata"

**Causas:**

- Archivo corrupto
- Formato no estándar
- DRM protegido

**Solución:** Verifica la integridad del archivo y que no tenga protección DRM.

### Error: "LIBRARY_PATH no está configurado"

**Solución:** Añade `LIBRARY_PATH` en tu archivo `.env`:

```env
LIBRARY_PATH="C:/ruta/a/tus/libros"
```

### El directorio está vacío pero tengo libros

**Solución:** Verifica:

1. Que la ruta sea correcta y use `/` (no `\`)
2. Que el usuario tenga permisos de lectura
3. Que los archivos tengan las extensiones correctas (.epub, .pdf, etc.)

### Libros duplicados

El sistema evita duplicados automáticamente. Si un libro se añade dos veces:

1. Verifica que no tengas el mismo archivo en diferentes ubicaciones
2. Si moviste el archivo, el hash cambiará y se considerará nuevo

## Arquitectura Técnica

### Archivos Creados

```
backend/
├── src/
│   ├── config/
│   │   └── library.ts              # Configuración de rutas
│   ├── utils/
│   │   ├── fileScanner.ts          # Escaneo recursivo de directorios
│   │   ├── metadataExtractor.ts    # Extracción de metadata por formato
│   │   └── fileHash.ts             # Cálculo de hash SHA-256
│   └── modules/books/
│       ├── books.service.ts        # Lógica de escaneo (scanLibraryFolder)
│       ├── books.controller.ts     # Endpoint (scanLibraryController)
│       ├── books.routes.ts         # POST /scan
│       └── books.repository.ts     # Queries (findByFileHash, findByFilePath)
```

### Flujo del Proceso

```
Usuario → POST /api/books/scan
    ↓
Controller (scanLibraryController)
    ↓
Service (scanLibraryFolder)
    ↓
1. scanLibraryDirectory() → Lista archivos
2. Para cada archivo:
   a. calculateFileHash() → Hash SHA-256
   b. Verificar duplicados (hash/path)
   c. extractMetadata() → Metadata del libro
   d. repository.create() → Guardar en BD
    ↓
Respuesta con resultados
```

## Próximas Mejoras

- [ ] Extracción de portadas desde archivos EPUB
- [ ] Soporte para más formatos (CBR, CBZ)
- [ ] Actualización de metadata de libros existentes
- [ ] Escaneo incremental (solo archivos nuevos)
- [ ] Procesamiento en segundo plano con cola de trabajos
- [ ] Interfaz de progreso en tiempo real (WebSockets)

## Dependencias

```json
{
  "epub2": "^3.0.2", // Lectura de archivos EPUB
  "pdf-parse": "^1.1.1" // Lectura de archivos PDF
}
```
