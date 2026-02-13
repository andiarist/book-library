# SearchPage - Página de Búsqueda de Libros

Esta carpeta contiene la implementación refactorizada de la página de búsqueda de libros externos.

## Estructura

```
search/
├── SearchPage.tsx              # Componente principal de la página
├── useSearchPage.ts            # Hook personalizado con la lógica de estado
├── index.ts                    # Exportación pública
├── components/                 # Componentes específicos de la página
│   ├── SearchForm.tsx          # Formulario de búsqueda
│   ├── SearchResults.tsx       # Lista de resultados
│   ├── SearchEmptyState.tsx    # Estado inicial (sin búsqueda)
│   ├── SearchLoadingState.tsx  # Estado de carga
│   ├── SearchErrorState.tsx    # Estado de error
│   ├── NoResultsState.tsx      # Estado sin resultados
│   └── index.ts                # Exportaciones de componentes
└── README.md                   # Este archivo
```

## Características

### Estados Manejados

1. **Estado Inicial**: Cuando no se ha realizado ninguna búsqueda
2. **Estado de Carga**: Durante la búsqueda
3. **Estado de Error**: Si ocurre un error en la búsqueda
4. **Sin Resultados**: Cuando la búsqueda no devuelve resultados
5. **Con Resultados**: Muestra la lista de libros encontrados

### Componentes

- **SearchPage**: Componente principal que orquesta todos los estados y componentes
- **SearchForm**: Formulario de búsqueda con validación
- **SearchResults**: Grid de tarjetas de libros con contador de resultados
- **Estados visuales**: Componentes dedicados para cada estado de la UI

### Hook Personalizado

`useSearchPage` encapsula toda la lógica de estado:

- Gestión del query de búsqueda
- Estado de carga y errores
- Manejo del modal de edición
- Tracking de si se ha realizado una búsqueda

## Uso

```tsx
import { SearchPage } from '@/pages/search';

// En tu router o componente padre
<SearchPage />;
```

## Mejoras sobre la versión anterior

1. ✅ Separación clara de responsabilidades
2. ✅ Estados de UI claramente definidos
3. ✅ Componentes reutilizables y testeables
4. ✅ Mejor manejo de errores
5. ✅ Consistencia con el patrón de LibraryPage
6. ✅ Mejores keys en las listas (usa ISBN cuando está disponible)
7. ✅ Mensajes informativos para el usuario
