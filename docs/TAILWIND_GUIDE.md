# Guía de Tailwind CSS

## ✅ Instalación Completada

Tailwind CSS ha sido instalado y configurado correctamente en tu proyecto. Aquí está lo que se ha configurado:

### Archivos creados/modificados:

1. **tailwind.config.js** - Configuración de Tailwind
2. **postcss.config.js** - Configuración de PostCSS
3. **src/index.css** - Directivas de Tailwind añadidas
4. **.eslintrc.cjs** - Actualizado para ignorar archivos de configuración
5. **.prettierrc** - Plugin de Tailwind añadido para ordenar clases automáticamente

### Dependencias instaladas:

- `tailwindcss` - Framework CSS
- `postcss` - Herramienta para transformar CSS
- `autoprefixer` - Añade prefijos de navegador automáticamente
- `prettier-plugin-tailwindcss` - Ordena las clases de Tailwind automáticamente

## 🚀 Cómo usar Tailwind CSS

### Ejemplo básico

Puedes usar las clases de Tailwind directamente en tus componentes:

```tsx
function Example() {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2">Hola Tailwind!</h1>
      <p className="text-sm">Este es un ejemplo de Tailwind CSS</p>
    </div>
  );
}
```

### Clases comunes útiles:

#### Layout y espaciado:
```tsx
// Padding
<div className="p-4">      {/* padding: 1rem (16px) */}
<div className="px-6 py-3"> {/* padding-x: 1.5rem, padding-y: 0.75rem */}

// Margin
<div className="m-4">      {/* margin: 1rem */}
<div className="mt-2 mb-4"> {/* margin-top: 0.5rem, margin-bottom: 1rem */}

// Flex
<div className="flex items-center justify-between gap-4">
<div className="flex flex-col space-y-2">

// Grid
<div className="grid grid-cols-3 gap-4">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

#### Texto y tipografía:
```tsx
<h1 className="text-3xl font-bold text-gray-900">
<p className="text-sm text-gray-600 leading-relaxed">
<span className="uppercase tracking-wide">
```

#### Colores:
```tsx
<div className="bg-blue-500 text-white">     {/* Fondo azul, texto blanco */}
<div className="bg-gray-100 text-gray-800">  {/* Fondo gris claro, texto gris oscuro */}
<div className="border border-gray-300">     {/* Borde gris */}
```

#### Bordes y sombras:
```tsx
<div className="rounded-lg shadow-md">       {/* Bordes redondeados y sombra mediana */}
<div className="rounded-full border-2">      {/* Bordes circulares y borde de 2px */}
```

#### Responsive:
```tsx
// Móvil primero: sm: > 640px, md: > 768px, lg: > 1024px, xl: > 1280px
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

#### Estados (hover, focus, etc.):
```tsx
<button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700">
<input className="border focus:ring-2 focus:ring-blue-500">
<div className="opacity-50 hover:opacity-100 transition-opacity">
```

### Ejemplo de botón completo:

```tsx
<button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
  Guardar
</button>
```

### Ejemplo de tarjeta (card):

```tsx
<div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
  <h2 className="text-2xl font-bold text-gray-900 mb-2">Título</h2>
  <p className="text-gray-600 mb-4">Descripción de la tarjeta</p>
  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
    Ver más
  </button>
</div>
```

### Ejemplo de formulario:

```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Nombre
    </label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <button
    type="submit"
    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
  >
    Enviar
  </button>
</form>
```

## 🎨 Personalización

Puedes personalizar los colores, fuentes y más en `tailwind.config.js`:

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... más tonos
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

## 📚 Recursos útiles

- [Documentación oficial de Tailwind](https://tailwindcss.com/docs)
- [Tailwind Play](https://play.tailwindcss.com/) - Playground online
- [Tailwind UI](https://tailwindui.com/) - Componentes premium
- [Headless UI](https://headlessui.com/) - Componentes sin estilo para React

## 🔧 Comandos disponibles

```bash
# Desarrollo (Tailwind se compila automáticamente)
pnpm dev

# Build de producción (CSS optimizado)
pnpm build

# Formatear código (con ordenación de clases Tailwind)
pnpm format
```

## 💡 Tips

1. **Usa el plugin de VSCode**: Instala "Tailwind CSS IntelliSense" para autocompletado
2. **Ordenación automática**: Las clases se ordenan automáticamente con Prettier
3. **Dark mode**: Tailwind soporta dark mode con la clase `dark:`
4. **Componentes reutilizables**: Extrae componentes cuando uses las mismas clases repetidamente
5. **@apply (usa con moderación)**: Puedes extraer clases comunes en CSS:

```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
  }
}
```

## 🎯 Próximos pasos

1. Empieza a reemplazar el CSS existente con clases de Tailwind
2. Crea componentes reutilizables con estilos consistentes
3. Aprovecha las utilidades responsive para diseño móvil
4. Considera añadir plugins como `@tailwindcss/forms` si usas muchos formularios

¡Disfruta usando Tailwind CSS en tu proyecto! 🚀
