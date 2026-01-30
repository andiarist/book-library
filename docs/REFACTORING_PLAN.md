# Plan de Refactorización - Reutilización de Estilos

## Análisis del Estado Actual

### Problemas Identificados

1. **Estilos duplicados** en múltiples componentes (padding, margins, text styles)
2. **Falta de sistema de variantes** en Button (solo un estilo)
3. **Colores hardcodeados** sin sistema de design tokens
4. **No hay componentes base reutilizables** para Input, Modal, etc.

### Componentes Analizados

- `Button.tsx` - ✅ Ya refactorizado con variantes
- `BookCard.tsx` - bg-emerald-600, estilos específicos
- `LibraryBookCard.tsx` - bg-amber-200, hover effects
- `SearchForm.tsx` - Input con estilos inline
- `BookDetail.tsx` - Modal con estilos complejos

## Estrategia de Refactorización

### 1. Sistema de Colores en Tailwind (✅ Completado)

```js
// tailwind.config.js
colors: {
  primary: { ... }, // sky/blue
  success: { ... }, // green
  warning: { ... }, // yellow/amber
  danger: { ... },  // red
}
```

### 2. Componente Button con Variantes (✅ Completado)

```tsx
<Button variant="primary" size="md">Buscar</Button>
<Button variant="success">Añadir</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="secondary" size="sm">Cancelar</Button>
```

### 3. Componente Input Reutilizable

**Mantiene estilos originales de SearchForm**

```tsx
<Input label="ISBN" placeholder="978-0-123456-78-9" disabled={loading} />
```

### 4. Componente Modal Reutilizable

**Mantiene estructura de BookDetail**

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Detalle del Libro">
  {content}
</Modal>
```

### 5. Utilidades CSS Reutilizables

En lugar de crear componentes Card genéricos, crear clases utility:

```tsx
// Estilos de texto comunes
const textStyles = {
  label: 'font-semibold text-gray-900 dark:text-gray-100',
  meta: 'text-sm text-gray-600 dark:text-gray-400',
  body: 'text-base leading-relaxed',
};

// Info Item Component
function BookInfoItem({ label, value }) {
  return (
    <p className="mx-0 my-2 text-base">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}
```

### 6. Componentes Específicos Mantienen Sus Estilos

- `BookCard` - Mantiene `bg-emerald-600` y estructura específica
- `LibraryBookCard` - Mantiene `bg-amber-200` y efectos hover
- Pero usan componentes base (Button, BookInfoItem) para partes reutilizables

## Implementación

### Fase 1: Componentes Base (En Progreso)

- [x] Button con variantes
- [ ] Input con label y error states
- [ ] Modal reutilizable
- [ ] BookInfoItem (para mostrar info libro)

### Fase 2: Refactorizar Componentes Existentes

- [ ] SearchForm - usar componente Input
- [ ] BookCard - usar Button variant="success" y BookInfoItem
- [ ] BookDetail - usar Modal y BookInfoItem
- [ ] App.tsx - usar Button variants

### Fase 3: Limpiar CSS No Usado

- [ ] Eliminar estilos duplicados en App.css
- [ ] Consolidar media queries

## Beneficios Esperados

1. **Consistencia**: Todos los botones usan el mismo componente
2. **Mantenibilidad**: Cambiar estilos en un solo lugar
3. **Reutilización**: Componentes Input, Modal, Button disponibles
4. **Type Safety**: Props tipadas con TypeScript
5. **Flexibilidad**: Mantiene posibilidad de override con className

## Notas Importantes

- ⚠️ **NO crear Card genérico** - cada card tiene propósito específico
- ✅ **SÍ extraer partes comunes** - BookInfoItem, Button variants
- ✅ **Mantener apariencia actual** - los colores específicos se preservan
- ✅ **Usar className para overrides** - permite personalización cuando necesario
