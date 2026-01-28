# Guía de Migración a Tauri (Fase 2)

Esta guía te ayudará a migrar el proyecto actual a Tauri para añadir funcionalidades nativas.

## 📋 Prerequisitos

Además de Node.js, necesitarás instalar las dependencias de Tauri según tu sistema operativo:

### Windows
```bash
# Instalar Visual Studio C++ Build Tools
# Descargar desde: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Instalar WebView2 (normalmente ya viene con Windows 11)
# Descargar desde: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

### macOS
```bash
# Instalar Xcode Command Line Tools
xcode-select --install

# Instalar Rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Instalar Rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

## 🚀 Instalación de Tauri

1. Instalar dependencias de Tauri:
```bash
pnpm add -D @tauri-apps/cli
pnpm add @tauri-apps/api
```

2. Inicializar Tauri:
```bash
pnpm tauri init
```

Responde a las preguntas del wizard:
- App name: `book-library`
- Window title: `Biblioteca Personal`
- Web assets: `dist`
- Dev server URL: `http://localhost:5173`
- Dev command: `pnpm dev`
- Build command: `pnpm build`

## 📝 Configuración

### 1. Actualizar `package.json`

Añade estos scripts:
```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### 2. Configurar permisos en `src-tauri/tauri.conf.json`

```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "readDir": true,
        "readFile": true,
        "scope": ["$HOME/Documents/**", "$HOME/Books/**"]
      },
      "dialog": {
        "open": true
      }
    }
  }
}
```

## 🔧 Implementar Funcionalidades Nativas

### 1. Comando para leer carpeta de eBooks

En `src-tauri/src/main.rs`:

```rust
use tauri::command;
use std::fs;
use std::path::PathBuf;

#[derive(serde::Serialize)]
struct EbookFile {
    path: String,
    name: String,
    extension: String,
}

#[command]
fn read_ebook_folder(folder_path: String) -> Result<Vec<EbookFile>, String> {
    let path = PathBuf::from(&folder_path);
    
    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    let entries = fs::read_dir(&path)
        .map_err(|e| e.to_string())?;

    let mut ebooks = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if let Some(extension) = path.extension() {
            let ext_str = extension.to_string_lossy().to_lowercase();
            if ext_str == "epub" || ext_str == "pdf" {
                ebooks.push(EbookFile {
                    path: path.to_string_lossy().to_string(),
                    name: path.file_name()
                        .unwrap()
                        .to_string_lossy()
                        .to_string(),
                    extension: ext_str.to_string(),
                });
            }
        }
    }

    Ok(ebooks)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_ebook_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. Crear servicio TypeScript para Tauri

Crea `src/services/tauriService.ts`:

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

interface EbookFile {
  path: string;
  name: string;
  extension: 'epub' | 'pdf';
}

export class TauriService {
  static async selectFolder(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    return typeof selected === 'string' ? selected : null;
  }

  static async readEbookFolder(folderPath: string): Promise<EbookFile[]> {
    return await invoke<EbookFile[]>('read_ebook_folder', { folderPath });
  }
}
```

### 3. Actualizar hook para usar Tauri

Modifica `src/hooks/useBookMetadata.ts` para detectar si está en Tauri:

```typescript
import { TauriService } from '@/services/tauriService';

// Detectar si estamos en Tauri
const isTauri = '__TAURI__' in window;

export function useLocalBooks() {
  const [books, setBooks] = useState<EbookFile[]>([]);
  const [loading, setLoading] = useState(false);

  const scanFolder = async () => {
    if (!isTauri) {
      console.warn('Local file access requires Tauri');
      return;
    }

    setLoading(true);
    try {
      const folder = await TauriService.selectFolder();
      if (folder) {
        const files = await TauriService.readEbookFolder(folder);
        setBooks(files);
      }
    } catch (error) {
      console.error('Error scanning folder:', error);
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, scanFolder };
}
```

## 🗄️ Base de Datos Local (SQLite)

### 1. Añadir dependencia en `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.30", features = ["bundled"] }
```

### 2. Implementar comandos de base de datos:

```rust
use rusqlite::{Connection, Result};

#[command]
fn init_database(db_path: String) -> Result<(), String> {
    let conn = Connection::open(db_path)
        .map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,
            isbn TEXT,
            title TEXT NOT NULL,
            authors TEXT,
            file_path TEXT,
            added_at TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    Ok(())
}
```

## 📱 Testing en Tauri

Los tests de React seguirán funcionando igual. Para tests específicos de Tauri:

```bash
# En modo desarrollo
pnpm tauri:dev

# Build para producción
pnpm tauri:build
```

## 🎯 Próximos Pasos

1. ✅ Migrar a Tauri
2. Implementar lectura de EPUB (usar librería `epub-rs`)
3. Implementar extracción de metadatos de PDF
4. Configurar SQLite para persistencia
5. Implementar sincronización de metadatos con APIs
6. Añadir gestión completa de biblioteca

## 🔗 Referencias

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [epub-rs](https://github.com/danigm/epub-rs)
- [pdf-extract](https://github.com/jrmuizel/pdf-extract)
