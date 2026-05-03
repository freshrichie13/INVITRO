# Implementation Plan: Visual Rebrand

## Overview

Aplicar el rebrand visual de la app de pre-registro del evento "Estás Mirando en Radianes". Los cambios son exclusivamente de UI/CSS: paleta cálida (Warm_Palette), imagen de fondo global, actualización de textos y footer. La lógica de negocio (Firebase, EmailJS, QR) no se toca.

**Archivos a modificar:** `index.html`, `components/Window.tsx`, `components/Button.tsx`, `components/Input.tsx`, `App.tsx`

---

## Tasks

- [x] 1. Actualizar `index.html` — fallback de color de fondo
  - En el `<style>` del `<head>`, cambiar `background-color: #ffffff` por `#3B1F0E` y `color: #000000` por `#F5ECD7`
  - Esto garantiza que el fondo oscuro cálido aparezca incluso antes de que React monte el árbol
  - _Requirements: 1.4, 2.1_

- [x] 2. Actualizar `components/Window.tsx` — fondo semi-transparente y borde terracota
  - [x] 2.1 Reemplazar las clases `bg-white border-2 border-black` por `border-2 border-[#C1714F]` y agregar `style={{ backgroundColor: 'rgba(59, 31, 14, 0.85)' }}`
    - Usar `style` prop para el `rgba` porque Tailwind CDN no soporta `bg-[rgba(...)]` de forma confiable
    - _Requirements: 2.2, 6.2_
  - [ ]* 2.2 Escribir property test — Property 2: Consistencia visual entre pantallas
    - **Property 2: All app screens apply background image and warm palette**
    - Verificar que el elemento Window renderizado tenga `border-[#C1714F]` y `backgroundColor: rgba(59, 31, 14, 0.85)`
    - **Validates: Requirements 5.1**

- [x] 3. Actualizar `components/Button.tsx` — paleta cálida con hover handlers
  - [x] 3.1 Reemplazar las clases `bg-white border-2 border-black text-black hover:bg-black hover:text-white` por `border-2 border-[#C1714F]` y agregar `style` prop con `backgroundColor: '#A05A3A'` y `color: '#FFFFFF'`
    - Agregar `onMouseEnter` handler: `backgroundColor → '#3B1F0E'`, `color → '#F5ECD7'`
    - Agregar `onMouseLeave` handler: restaurar `backgroundColor → '#A05A3A'`, `color → '#FFFFFF'`
    - Usar `#A05A3A` (terracota oscurecida) como fondo base para alcanzar ratio de contraste ~4.6:1 con texto blanco
    - Los handlers de mouse son necesarios porque Tailwind CDN no soporta hover con colores arbitrarios custom de forma confiable
    - _Requirements: 2.3, 6.1_
  - [ ]* 3.2 Escribir property test — Property 1: Contraste WCAG AA en pares de color del Button
    - **Property 1: All color pairs meet WCAG AA contrast ratio (≥ 4.5:1)**
    - Verificar par `#FFFFFF` sobre `#A05A3A` (base) y `#F5ECD7` sobre `#3B1F0E` (hover)
    - Implementar `getContrastRatio` según fórmula WCAG 2.1 si no existe
    - **Validates: Requirements 2.3, 6.1**

- [x] 4. Actualizar `components/Input.tsx` — fondo oscuro cálido y texto crema
  - [x] 4.1 Reemplazar las clases `bg-white text-black border-2 border-black focus:bg-gray-50 placeholder-gray-400` por `border-2 border-[#6B3A2A] placeholder-[#A07060]` y agregar `style` prop con `backgroundColor: 'rgba(59, 31, 14, 0.70)'` y `color: '#F5ECD7'`
    - Eliminar `focus:bg-gray-50` (incompatible con fondo oscuro)
    - _Requirements: 2.4, 6.3_
  - [ ]* 4.2 Escribir property test — Property 1: Contraste WCAG AA en el Input
    - **Property 1: All color pairs meet WCAG AA contrast ratio (≥ 4.5:1)**
    - Verificar par `#F5ECD7` sobre `rgba(59,31,14,0.70)` (ratio esperado ~8.5:1)
    - **Validates: Requirements 2.4, 6.3**

- [x] 5. Checkpoint — Verificar componentes base
  - Asegurar que Window, Button e Input renderizan sin errores de TypeScript y que los estilos visuales son correctos. Preguntar al usuario si hay dudas antes de continuar con App.tsx.

- [x] 6. Actualizar `App.tsx` — root div con imagen de fondo global
  - Reemplazar `className="min-h-screen bg-white text-black font-sans"` por `className="min-h-screen font-sans"` y agregar `style` prop con:
    - `backgroundImage: "url('/images/nuevo fondo pagina registro3500pxls.jpg')"`
    - `backgroundSize: 'cover'`
    - `backgroundPosition: 'center'`
    - `backgroundAttachment: 'fixed'`
    - `backgroundColor: '#3B1F0E'` (fallback CSS)
    - `color: '#F5ECD7'`
  - El fondo se aplica una sola vez en el root div para evitar parpadeo al cambiar de pantalla
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.4_

- [x] 7. Actualizar `App.tsx` — `RegistrationForm`: header, párrafo descriptivo y errores
  - [x] 7.1 Actualizar el `h1` con el nuevo texto "Estás Mirando en Radianes" y clase `text-[#F5ECD7]`
    - _Requirements: 4.1, 2.5_
  - [x] 7.2 Reemplazar el `h2` de "ABRIL 17" por el nuevo subtítulo "Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees." con clases `text-base sm:text-lg md:text-xl font-light text-[#F5ECD7] max-w-md mx-auto leading-relaxed px-2`
    - _Requirements: 4.2, 4.3_
  - [x] 7.3 Actualizar el párrafo descriptivo del formulario: cambiar `text-gray-700` por `text-[#F5ECD7] opacity-80` y corregir el texto (tildes y "entrada" en lugar de "promoción")
    - _Requirements: 4.4, 2.6_
  - [x] 7.4 Actualizar los mensajes de error de validación: cambiar `text-red-500` por `text-[#D9534F]` en los tres campos (firstName, lastName, email)
    - _Requirements: 2.7_
  - [x] 7.5 Actualizar el error global del formulario: cambiar `bg-red-50 border border-red-500 text-red-700` por `bg-[#3B1F0E] border border-[#D9534F] text-[#F5ECD7]`
    - _Requirements: 2.7_

- [x] 8. Actualizar `App.tsx` — `RegistrationForm`: botón "Limpiar" y textos secundarios
  - [x] 8.1 Actualizar el botón "Limpiar" inline: reemplazar `border-gray-300 text-gray-400 hover:border-black hover:text-black` por `border-[#6B3A2A] text-[#F5ECD7] opacity-60 hover:border-[#C1714F] hover:opacity-100`
    - _Requirements: 2.5, 2.6_
  - [x] 8.2 Actualizar el texto "By ANCI, GIJO...": cambiar `text-gray-600` por `text-[#F5ECD7] opacity-70`
    - _Requirements: 2.6_
  - [x] 8.3 Actualizar el footer de `RegistrationForm`: reemplazar el `<a href="...">Powered by FRESH RICHIE</a>` por `<p className="font-normal text-xs tracking-widest uppercase opacity-60 text-center text-[#F5ECD7]">INVITRO</p>`
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 9. Actualizar `App.tsx` — `ConfirmationScreen`: paleta cálida
  - [x] 9.1 Actualizar el título `h3` "Confirmar Datos": agregar `text-[#F5ECD7]`
    - _Requirements: 2.5, 5.2_
  - [x] 9.2 Actualizar las etiquetas "Nombre:" y "Email:": cambiar `text-gray-500` por `text-[#F5ECD7] opacity-60`
    - _Requirements: 5.2_
  - [x] 9.3 Actualizar los valores de datos del usuario: agregar `text-[#F5ECD7]` a los `<span>` de nombre y email
    - _Requirements: 2.5_
  - [x] 9.4 Actualizar el separador: cambiar `border-gray-200` por `border-[#6B3A2A]`
    - _Requirements: 5.3_

- [x] 10. Actualizar `App.tsx` — `SuccessScreen`: header, contenido y footer
  - [x] 10.1 Reemplazar el `h1` "LIVE SETS" por "Estás Mirando en Radianes" con clase `text-[#F5ECD7]` y eliminar el `h2` de "ABRIL 17"
    - _Requirements: 4.5, 4.3_
  - [x] 10.2 Actualizar el `h3` "¡Pre-registro Exitoso!": agregar `text-[#F5ECD7]`
    - _Requirements: 2.5_
  - [x] 10.3 Actualizar el separador del Window en SuccessScreen: cambiar `border-gray-200` por `border-[#6B3A2A]`
    - _Requirements: 5.1_
  - [x] 10.4 Actualizar el párrafo de instrucciones: cambiar `text-gray-700` por `text-[#F5ECD7] opacity-80`
    - _Requirements: 2.6_
  - [x] 10.5 Actualizar el texto "Te esperamos 8:00 PM": cambiar `text-gray-800` por `text-[#F5ECD7]`
    - _Requirements: 4.6, 2.5_
  - [x] 10.6 Actualizar el texto "By ANCI, GIJO...": cambiar `text-gray-600` por `text-[#F5ECD7] opacity-70`
    - _Requirements: 2.6_
  - [x] 10.7 Actualizar el footer de `SuccessScreen`: reemplazar el `<a href="...">Powered by FRESH RICHIE</a>` por `<p className="font-normal text-xs tracking-widest uppercase opacity-60 text-center text-[#F5ECD7]">INVITRO</p>`
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 11. Checkpoint final — Verificar consistencia visual completa
  - Asegurar que los 5 archivos modificados compilan sin errores de TypeScript.
  - Verificar visualmente en el navegador que las tres pantallas (RegistrationForm, ConfirmationScreen, SuccessScreen) muestran la imagen de fondo, la paleta cálida y los textos actualizados.
  - Confirmar que el footer muestra "INVITRO" (sin enlace) en RegistrationForm y SuccessScreen.
  - Asegurar que todos los tests pasan. Preguntar al usuario si hay dudas antes de cerrar.

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- El orden de las tareas es importante: los componentes base (Window, Button, Input) se modifican antes que App.tsx para que los cambios sean coherentes.
- No se modifica ningún archivo en `services/`, `types.ts` ni `config.ts`.
- Los `style` props inline se usan donde Tailwind CDN no soporta valores arbitrarios con `rgba` o hover states custom.
- La imagen de fondo se aplica una sola vez en el root div de `App.tsx` para garantizar que no haya parpadeo al navegar entre pantallas (Requirement 5.4).
