# Design Document — Visual Rebrand

## Feature: `visual-rebrand`
## Workflow: Requirements-First
## Spec Type: Feature

---

## Overview

Este documento describe el diseño técnico para el rebrand visual de la app de pre-registro del evento **"Estás Mirando en Radianes"**. El alcance es exclusivamente visual/UI: se reemplaza la paleta blanco/negro/gris por una paleta cálida (café oscuro, marrón, terracota, crema), se incorpora una imagen de fondo global, se actualizan textos de títulos y footer, y se garantiza consistencia visual entre las tres pantallas de la app.

**La lógica de negocio (Firebase, EmailJS, QR generation) no se modifica.**

### Objetivos

- Aplicar `public/images/nuevo fondo pagina registro3500pxls.jpg` como fondo global en todas las pantallas.
- Reemplazar la paleta monocromática por la Warm_Palette en todos los componentes.
- Actualizar textos: título h1, subtítulo h2, footer.
- Garantizar contraste WCAG AA (≥ 4.5:1) en todas las combinaciones de color.
- Mantener consistencia visual entre `RegistrationForm`, `ConfirmationScreen` y `SuccessScreen`.

### Fuera de alcance

- Lógica de Firebase (`services/firebaseService.ts`)
- Lógica de EmailJS (`services/emailService.ts`)
- Generación de QR
- Flujo de estados de la app (`AppState`)
- Validaciones de formulario

---

## Architecture

La app no tiene sistema de theming centralizado (no hay `tailwind.config.js`). Los colores custom se aplican mediante:

1. **Valores arbitrarios de Tailwind CDN** — clases como `bg-[#3B1F0E]`, `text-[#F5ECD7]`, `border-[#C1714F]`.
2. **`style` props inline en React** — para propiedades CSS que Tailwind no cubre directamente (ej. `backgroundImage`, `backgroundAttachment`, `backgroundSize`).
3. **`index.html` `<style>` tag** — para el fallback de `body` background color.

```mermaid
graph TD
    A[index.html] -->|body background fallback #3B1F0E| B[App.tsx root div]
    B -->|backgroundImage style prop| C[Fondo global]
    B --> D[RegistrationForm]
    B --> E[ConfirmationScreen]
    B --> F[SuccessScreen]
    D --> G[Window.tsx]
    D --> H[Button.tsx]
    D --> I[Input.tsx]
    E --> G
    E --> H
    F --> G
    F --> H
```

### Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `dark-brown` | `#3B1F0E` | Fondo base, hover de botón, fondo body fallback |
| `medium-brown` | `#6B3A2A` | Borde de Input, separadores |
| `terracotta` | `#C1714F` | Borde de Window, fondo de Button, borde de Button |
| `cream` | `#F5ECD7` | Texto principal, texto de Button, placeholder base |
| `warm-red` | `#D9534F` | Borde de Input en estado de error |

### Verificación de contraste WCAG AA (ratio ≥ 4.5:1)

| Foreground | Background | Ratio estimado | Cumple AA |
|---|---|---|---|
| `#F5ECD7` (cream) | `rgba(59,31,14,0.85)` (Window) | ~9.2:1 | ✅ |
| `#F5ECD7` (cream) | `#C1714F` (Button) | ~3.1:1 | ⚠️ — ver nota |
| `#F5ECD7` (cream) | `#3B1F0E` (dark-brown) | ~11.4:1 | ✅ |
| `#F5ECD7` (cream) | Input bg `rgba(59,31,14,0.7)` | ~8.5:1 | ✅ |

> **Nota sobre Button:** El ratio cream sobre terracota es ~3.1:1, que no alcanza 4.5:1 para texto normal. Para cumplir WCAG AA se usará texto blanco puro `#FFFFFF` sobre terracota en el Button (ratio ~3.8:1) o se oscurecerá el fondo del botón a `#A05A3A` (ratio ~4.6:1). **Decisión de diseño: usar `#FFFFFF` como texto del Button y `#A05A3A` como fondo base del botón** para garantizar cumplimiento. En hover se usa `#3B1F0E` con `#F5ECD7` (ratio ~11.4:1 ✅).

---

## Components and Interfaces

### Diagrama de componentes afectados

```mermaid
graph LR
    subgraph "Archivos modificados"
        A[index.html]
        B[App.tsx]
        C[components/Window.tsx]
        D[components/Button.tsx]
        E[components/Input.tsx]
    end
    subgraph "Archivos NO modificados"
        F[services/firebaseService.ts]
        G[services/emailService.ts]
        H[types.ts]
        I[config.ts]
    end
```

---

### `index.html`

**Cambio:** Actualizar el `<style>` del `body` para usar el color de fondo fallback de la Warm_Palette.

```html
<!-- ANTES -->
<style>
  body {
    font-family: 'Inter', ...;
    background-color: #ffffff;
    color: #000000;
  }
</style>

<!-- DESPUÉS -->
<style>
  body {
    font-family: 'Inter', ...;
    background-color: #3B1F0E;
    color: #F5ECD7;
  }
</style>
```

---

### `App.tsx` — Root div

**Cambio:** Reemplazar `className="min-h-screen bg-white text-black font-sans"` por un `style` prop con la imagen de fondo y clases Tailwind para el color de texto base.

```tsx
// ANTES
<div className="min-h-screen bg-white text-black font-sans">

// DESPUÉS
<div
  className="min-h-screen font-sans"
  style={{
    backgroundImage: "url('/images/nuevo fondo pagina registro3500pxls.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundColor: '#3B1F0E', // fallback si la imagen no carga
    color: '#F5ECD7',
  }}
>
```

> **Nota:** `backgroundAttachment: 'fixed'` aplica en desktop. En mobile iOS, `fixed` puede causar comportamiento inesperado; se acepta como limitación conocida dado el stack actual (sin config de Tailwind para media queries custom).

---

### `App.tsx` — `RegistrationForm`

#### Header (h1, h2)

```tsx
// ANTES
<h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide mb-2">LIVE SETS</h1>
<h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2">ABRIL 17</h2>

// DESPUÉS
<h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide mb-2 text-[#F5ECD7]">
  Estás Mirando en Radianes
</h1>
<h2 className="text-base sm:text-lg md:text-xl font-light mb-2 text-[#F5ECD7] max-w-md mx-auto leading-relaxed px-2">
  Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees.
</h2>
```

> El h2 de "ABRIL 17" se elimina. El nuevo h2 es el subtítulo del taller.

#### Párrafo descriptivo del formulario

```tsx
// ANTES
<p className="text-xs sm:text-sm md:text-base text-gray-700 max-w-md mx-auto leading-relaxed px-2">
  Ingresa tu primer nombre, primer apellido y email para poder enviarte el codigo QR...
</p>

// DESPUÉS
<p className="text-xs sm:text-sm md:text-base text-[#F5ECD7] opacity-80 max-w-md mx-auto leading-relaxed px-2">
  Ingresa tu primer nombre, primer apellido y email para poder enviarte el código QR necesario y hacer válida tu entrada el día del evento.
</p>
```

#### Botón "Limpiar" (inline en RegistrationForm)

```tsx
// ANTES
<button
  type="button"
  onClick={handleReset}
  className="px-6 py-2 bg-transparent border-2 border-gray-300 text-gray-400 font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors w-full md:w-auto min-w-[120px]"
>

// DESPUÉS
<button
  type="button"
  onClick={handleReset}
  className="px-6 py-2 bg-transparent border-2 border-[#6B3A2A] text-[#F5ECD7] opacity-60 font-bold uppercase tracking-widest hover:border-[#C1714F] hover:opacity-100 transition-colors w-full md:w-auto min-w-[120px]"
>
```

#### Footer — RegistrationForm y SuccessScreen

```tsx
// ANTES
<a
  href="https://fresh-richie.vercel.app/"
  target="_blank"
  rel="noopener noreferrer"
  className="font-normal text-xs tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity duration-300 text-center cursor-pointer"
>
  Powered by FRESH RICHIE
</a>

// DESPUÉS
<p className="font-normal text-xs tracking-widest uppercase opacity-60 text-center text-[#F5ECD7]">
  INVITRO
</p>
```

> Se reemplaza `<a>` por `<p>`. Sin enlace, sin interactividad.

#### Texto secundario "By ANCI, GIJO..."

```tsx
// ANTES
<p className="text-sm text-gray-600 px-2 uppercase tracking-widest font-bold">

// DESPUÉS
<p className="text-sm text-[#F5ECD7] opacity-70 px-2 uppercase tracking-widest font-bold">
```

#### Mensajes de error de validación

```tsx
// ANTES
<p className="text-red-500 text-xs mt-1 ml-1">{formErrors.firstName}</p>

// DESPUÉS
<p className="text-[#D9534F] text-xs mt-1 ml-1">{formErrors.firstName}</p>
```

#### Error global del formulario

```tsx
// ANTES
<div className="bg-red-50 border border-red-500 text-red-700 px-4 py-2 text-sm text-center">

// DESPUÉS
<div className="bg-[#3B1F0E] border border-[#D9534F] text-[#F5ECD7] px-4 py-2 text-sm text-center">
```

---

### `App.tsx` — `ConfirmationScreen`

#### Etiquetas de datos

```tsx
// ANTES
<span className="font-bold text-gray-500 text-xs sm:text-sm uppercase">Nombre:</span>
<span className="sm:col-span-2 font-medium text-sm sm:text-base break-words">...</span>

// DESPUÉS
<span className="font-bold text-[#F5ECD7] opacity-60 text-xs sm:text-sm uppercase">Nombre:</span>
<span className="sm:col-span-2 font-medium text-sm sm:text-base break-words text-[#F5ECD7]">...</span>
```

#### Separador

```tsx
// ANTES
<div className="... border-t border-b border-gray-200 py-3 md:py-4">

// DESPUÉS
<div className="... border-t border-b border-[#6B3A2A] py-3 md:py-4">
```

#### Título "Confirmar Datos"

```tsx
// ANTES
<h3 className="text-xl sm:text-2xl font-light">Confirmar Datos</h3>

// DESPUÉS
<h3 className="text-xl sm:text-2xl font-light text-[#F5ECD7]">Confirmar Datos</h3>
```

---

### `App.tsx` — `SuccessScreen`

#### Header (h1)

```tsx
// ANTES
<h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide mb-2">LIVE SETS</h1>
<h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2">ABRIL 17</h2>

// DESPUÉS
<h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide mb-2 text-[#F5ECD7]">
  Estás Mirando en Radianes
</h1>
```

> El h2 de "ABRIL 17" se elimina en SuccessScreen también.

#### Contenido del Window en SuccessScreen

```tsx
// ANTES
<h3 className="text-2xl sm:text-3xl font-light mb-3 md:mb-4">¡Pre-registro Exitoso!</h3>
<div className="... border-t border-b border-gray-200 py-4 md:py-6">
<p className="text-sm md:text-base text-gray-700 leading-relaxed px-2">
<p className="text-base md:text-lg lg:text-xl font-light text-gray-800">

// DESPUÉS
<h3 className="text-2xl sm:text-3xl font-light mb-3 md:mb-4 text-[#F5ECD7]">¡Pre-registro Exitoso!</h3>
<div className="... border-t border-b border-[#6B3A2A] py-4 md:py-6">
<p className="text-sm md:text-base text-[#F5ECD7] opacity-80 leading-relaxed px-2">
<p className="text-base md:text-lg lg:text-xl font-light text-[#F5ECD7]">
```

---

### `components/Window.tsx`

**Cambio:** Reemplazar `bg-white border-2 border-black` por fondo semi-transparente cálido y borde terracota.

```tsx
// ANTES
<div className={`bg-white border-2 border-black p-6 md:p-8 w-full ${className}`}>

// DESPUÉS
<div
  className={`border-2 border-[#C1714F] p-6 md:p-8 w-full ${className}`}
  style={{ backgroundColor: 'rgba(59, 31, 14, 0.85)' }}
>
```

> Se usa `style` prop para `rgba` porque Tailwind CDN con valores arbitrarios no soporta `bg-[rgba(...)]` de forma confiable en todos los navegadores. `border-[#C1714F]` sí funciona con valores arbitrarios de Tailwind CDN.

---

### `components/Button.tsx`

**Cambio:** Reemplazar esquema blanco/negro por terracota oscuro/crema.

```tsx
// ANTES
<button
  className={`px-6 py-2 bg-white border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  {...props}
>

// DESPUÉS
<button
  className={`px-6 py-2 border-2 border-[#C1714F] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  style={{
    backgroundColor: '#A05A3A',
    color: '#FFFFFF',
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3B1F0E';
    (e.currentTarget as HTMLButtonElement).style.color = '#F5ECD7';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#A05A3A';
    (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
  }}
  {...props}
>
```

> **Rationale:** Se usa `#A05A3A` (terracota oscurecida) en lugar de `#C1714F` para el fondo base del botón, logrando ratio de contraste ~4.6:1 con texto blanco `#FFFFFF`. El hover usa `#3B1F0E` con `#F5ECD7` (ratio ~11.4:1). Los handlers `onMouseEnter`/`onMouseLeave` son necesarios porque Tailwind CDN no permite definir colores hover custom con valores arbitrarios de forma confiable.

---

### `components/Input.tsx`

**Cambio:** Reemplazar fondo blanco y borde negro por fondo oscuro cálido semi-transparente, borde marrón, texto crema.

```tsx
// ANTES
<input
  className={`bg-white text-black px-3 py-2.5 sm:py-2 border-2 border-black outline-none focus:bg-gray-50 placeholder-gray-400 font-light text-base sm:text-sm ${className}`}
  {...props}
/>

// DESPUÉS
<input
  className={`px-3 py-2.5 sm:py-2 border-2 border-[#6B3A2A] outline-none font-light text-base sm:text-sm placeholder-[#A07060] ${className}`}
  style={{
    backgroundColor: 'rgba(59, 31, 14, 0.70)',
    color: '#F5ECD7',
  }}
  {...props}
/>
```

> `placeholder-[#A07060]` usa un marrón claro para el placeholder, manteniendo coherencia con la paleta. El fondo `rgba(59,31,14,0.70)` da suficiente contraste para el texto crema (ratio ~8.5:1).

---

## Data Models

No hay cambios en modelos de datos. Este feature es puramente visual. Los tipos en `types.ts` y la estructura de datos de Firebase no se modifican.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Este feature es predominantemente de configuración visual (CSS, clases Tailwind, style props). La mayoría de los acceptance criteria son checks de configuración estática (SMOKE) o ejemplos concretos (EXAMPLE). Sin embargo, hay dos propiedades universales que aplican a property-based testing:

### Property 1: Contraste WCAG AA en todas las combinaciones de color

*Para cualquier* par (color de texto, color de fondo) utilizado en la app tras el rebrand, el ratio de contraste calculado según la fórmula WCAG 2.1 SHALL ser mayor o igual a 4.5:1.

**Validates: Requirements 2.6, 6.1, 6.3**

> Esta propiedad consolida los tres acceptance criteria de contraste (2.6, 6.1, 6.3) en una sola propiedad universal. Se puede implementar como un test que itera sobre todas las combinaciones de color definidas en la paleta y verifica el ratio computado.

### Property 2: Consistencia visual entre pantallas

*Para cualquier* pantalla de la app (RegistrationForm, ConfirmationScreen, SuccessScreen), el elemento raíz de esa pantalla SHALL tener aplicada la `Background_Image` y los componentes `Window` dentro de ella SHALL usar el fondo semi-transparente cálido y borde terracota de la Warm_Palette.

**Validates: Requirements 5.1**

---

## Error Handling

### Imagen de fondo no disponible

- El `style` prop del root div incluye `backgroundColor: '#3B1F0E'` como fallback CSS nativo.
- Si el archivo `public/images/nuevo fondo pagina registro3500pxls.jpg` no existe en el build, el fondo sólido café oscuro se muestra automáticamente.
- No se requiere manejo de error en JavaScript; el fallback es puramente CSS.

### Colores custom en Tailwind CDN

- Los valores arbitrarios de Tailwind CDN (`bg-[#3B1F0E]`, `border-[#C1714F]`) funcionan en tiempo de ejecución porque el CDN genera estilos dinámicamente.
- Para propiedades que requieren `rgba` o hover states con colores custom, se usan `style` props y handlers de eventos en React como alternativa confiable.

### Accesibilidad — `prefers-reduced-motion`

- Las clases `transition-colors` de Tailwind respetan automáticamente `prefers-reduced-motion: reduce` en navegadores modernos cuando se usa la directiva `@media (prefers-reduced-motion: reduce)`.
- Con Tailwind CDN, se puede agregar la clase `motion-reduce:transition-none` a los elementos con transiciones para cumplir el Requirement 6.4.

---

## Testing Strategy

### Enfoque general

Este feature es visual/UI. La estrategia de testing combina:

1. **Smoke tests** — verifican que las propiedades CSS y clases Tailwind correctas están aplicadas (la mayoría de los acceptance criteria).
2. **Example-based tests** — verifican textos específicos (h1, h2, footer) y comportamientos condicionales (error state en Input).
3. **Property-based tests** — verifican propiedades universales (contraste WCAG, consistencia entre pantallas).

### Property-Based Testing

PBT aplica a este feature para las dos propiedades identificadas. Se recomienda usar **fast-check** (TypeScript/JavaScript).

#### Property 1: Contraste WCAG AA

```typescript
// Feature: visual-rebrand, Property 1: WCAG contrast ratio >= 4.5:1 for all color pairs
import fc from 'fast-check';
import { getContrastRatio } from './utils/colorUtils'; // función a implementar

const COLOR_PAIRS = [
  { fg: '#F5ECD7', bg: 'rgba(59,31,14,0.85)' }, // texto en Window
  { fg: '#FFFFFF',  bg: '#A05A3A' },              // texto en Button (base)
  { fg: '#F5ECD7', bg: '#3B1F0E' },               // texto en Button (hover)
  { fg: '#F5ECD7', bg: 'rgba(59,31,14,0.70)' },  // texto en Input
  { fg: '#F5ECD7', bg: '#3B1F0E' },               // texto general sobre fondo oscuro
];

test('Property 1: All color pairs meet WCAG AA contrast ratio', () => {
  fc.assert(
    fc.property(fc.constantFrom(...COLOR_PAIRS), ({ fg, bg }) => {
      const ratio = getContrastRatio(fg, bg);
      return ratio >= 4.5;
    }),
    { numRuns: 100 }
  );
});
```

#### Property 2: Consistencia visual entre pantallas

```typescript
// Feature: visual-rebrand, Property 2: All screens apply background image and warm palette
import fc from 'fast-check';
import { render } from '@testing-library/react';

const SCREENS = ['form', 'confirmation', 'success'] as const;

test('Property 2: All app screens apply background image and warm palette', () => {
  fc.assert(
    fc.property(fc.constantFrom(...SCREENS), (screen) => {
      const { container } = renderAppInState(screen);
      const rootDiv = container.firstChild as HTMLElement;
      // Background image applied
      expect(rootDiv.style.backgroundImage).toContain('nuevo fondo pagina registro3500pxls');
      // Warm palette fallback
      expect(rootDiv.style.backgroundColor).toBe('#3B1F0E');
      // Window uses warm border
      const windowEl = container.querySelector('[class*="border-\\[\\#C1714F\\]"]');
      expect(windowEl).toBeTruthy();
    }),
    { numRuns: 100 }
  );
});
```

### Example-based tests

| Criterio | Test |
|---|---|
| 3.1, 3.2 | Render RegistrationForm → footer text === "INVITRO", no `<a>` tag |
| 4.1 | Render RegistrationForm → h1 text === "Estás Mirando en Radianes" |
| 4.2 | Render RegistrationForm → h2 text contiene "mirada por default" |
| 4.3 | Render RegistrationForm → no existe h2 con texto "ABRIL 17" |
| 4.5 | Render SuccessScreen → h1 text === "Estás Mirando en Radianes" |
| 2.7 | Render Input con className de error → borde `#D9534F` aplicado |
| 6.4 | Verificar que elementos con `transition-colors` también tienen `motion-reduce:transition-none` |

### Smoke tests (verificación manual / revisión de código)

Los siguientes acceptance criteria se verifican mediante revisión de código y prueba visual en el navegador:

- 1.1–1.4: Imagen de fondo visible en todas las pantallas, fallback activo.
- 2.1–2.5: Paleta cálida aplicada en todos los componentes.
- 2.2, 2.3, 2.4: Window, Button, Input con clases/estilos correctos.
- 5.2, 5.3: ConfirmationScreen con etiquetas y separador en Warm_Palette.
- 5.4: Sin parpadeo al cambiar de pantalla (background en root div, no por pantalla).
- 6.2: Window con opacidad suficiente para legibilidad.

### Herramientas recomendadas

- **fast-check** — property-based testing (TypeScript)
- **@testing-library/react** — render de componentes
- **Vitest** — test runner (ya en el stack con Vite)
- **wcag-contrast** o implementación manual de la fórmula WCAG 2.1 para `getContrastRatio`
