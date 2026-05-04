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

---

## Iteration 2 — Typography & Layout Refinements

> Tareas para los Requirements 7–12. Las tareas 1–11 (Iteration 1) ya están completadas. Las nuevas tareas se numeran a partir del 12.

- [x] 12. Actualizar `App.tsx` — `RegistrationForm`: h1 uppercase + bold
  - [x] 12.1 En `RegistrationForm`, cambiar el `h1` de `font-normal` a `font-bold` y agregar la clase `uppercase`
    - El texto literal puede quedar en mayúsculas en el JSX para consistencia con el contenido del QR
    - Mantener el color `text-[#3B1F0E]` y el resto de clases sin modificación
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 12.2 En `SuccessScreen`, aplicar los mismos estilos (`font-bold`, `uppercase`, `text-[#3B1F0E]`) al `h1`
    - Verificar que ambas pantallas muestran el h1 con idénticas clases tipográficas
    - _Requirements: 7.4_

- [x] 13. Actualizar `App.tsx` — `RegistrationForm`: h2 "MAYO 14" sin negritas
  - [x] 13.1 En `RegistrationForm`, cambiar el `h2` "MAYO 14" de `font-semibold` a `font-normal`
    - Mantener tamaño (`text-3xl sm:text-4xl md:text-5xl`), color (`text-black`) y espaciado sin modificación
    - _Requirements: 8.1, 8.2_

- [x] 14. Actualizar `App.tsx` — `RegistrationForm`: eliminar párrafo descriptivo del header
  - [x] 14.1 Eliminar el elemento `<p>` con el texto "Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees." ubicado en la sección de header, inmediatamente debajo del `h2` "MAYO 14"
    - Tras la eliminación, la sección header debe contener únicamente el `h1` y el `h2`
    - No eliminar el párrafo equivalente que aparece en el footer inferior (fuera del Window) — ese es un elemento distinto
    - _Requirements: 9.1, 9.2_

- [x] 15. Actualizar `App.tsx` — `RegistrationForm`: color del párrafo de instrucciones
  - [x] 15.1 En el párrafo "Ingresa tu primer nombre, primer apellido y email...", cambiar `text-[#F5ECD7] opacity-80` por `text-[#6B3A2A]`
    - Eliminar la clase `opacity-80` del elemento (el color `#6B3A2A` ya provee el nivel de énfasis visual deseado)
    - Mantener el resto de clases (`text-xs sm:text-sm md:text-base`, `max-w-md mx-auto leading-relaxed px-2`) sin modificación
    - _Requirements: 10.1, 10.2_

- [x] 16. Checkpoint — Verificar cambios tipográficos en App.tsx
  - Asegurar que `RegistrationForm` y `SuccessScreen` compilan sin errores de TypeScript.
  - Verificar visualmente que el h1 aparece en mayúsculas y negritas, el h2 "MAYO 14" sin negritas, el párrafo descriptivo del header ha desaparecido, y el texto de instrucciones usa el color café claro.
  - Preguntar al usuario si hay dudas antes de continuar con Window.tsx.

- [x] 17. Actualizar `components/Window.tsx` — reducir opacidad del fondo
  - [x] 17.1 Cambiar el `style` prop del div raíz de `backgroundColor: 'rgba(59, 31, 14, 0.85)'` a `backgroundColor: 'rgba(59, 31, 14, 0.65)'`
    - Mantener el borde `border-[#C1714F]` y el resto de clases sin modificación
    - Verificar visualmente que la imagen de fondo es más visible a través del Window con la nueva opacidad
    - _Requirements: 11.1, 11.2_
  - [ ]* 17.2 Verificar contraste WCAG AA con la nueva opacidad del Window
    - **Property 5: Contraste WCAG AA con opacidad reducida del Window**
    - Confirmar que el texto crema `#F5ECD7` sobre `rgba(59,31,14,0.65)` mantiene ratio ≥ 4.5:1
    - Reutilizar la función `getContrastRatio` definida en la Iteration 1 si existe
    - **Validates: Requirements 11.3, 6.1**

- [x] 18. Actualizar `App.tsx` — footer inferior: color del párrafo descriptivo
  - [x] 18.1 En `RegistrationForm`, cambiar el color del párrafo "Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees" (footer inferior, fuera del Window) de `text-gray-400` a `text-[#6B3A2A]`
    - Eliminar el punto final (`.`) del texto del párrafo
    - _Requirements: 12.1, 12.3_
  - [x] 18.2 En `SuccessScreen`, aplicar el mismo cambio de color (`text-gray-400` → `text-[#6B3A2A]`) al párrafo equivalente en su footer inferior
    - Eliminar el punto final (`.`) del texto del párrafo
    - _Requirements: 12.2, 12.4_

- [x] 19. Actualizar `App.tsx` — footer inferior: posicionamiento fijo de "INVITRO"
  - [x] 19.1 En `RegistrationForm`, reemplazar el contenedor `<div className="mt-auto">` del texto "INVITRO" por `<div className="fixed bottom-4 left-0 right-0">`
    - El elemento sale del flujo normal del documento con `position: fixed`
    - `left-0 right-0` garantiza que el texto centrado ocupe el ancho completo del viewport
    - Mantener las clases del `<p>` interno (`font-normal text-xs tracking-widest uppercase opacity-90 text-center text-[#C1714F]`) sin modificación
    - _Requirements: 12.5_
  - [x] 19.2 En `SuccessScreen`, aplicar el mismo cambio de contenedor (`mt-auto` → `fixed bottom-4 left-0 right-0`) al texto "INVITRO"
    - Verificar que el posicionamiento es consistente entre `RegistrationForm` y `SuccessScreen`
    - _Requirements: 12.6_

- [x] 20. Checkpoint final Iteration 2 — Verificar consistencia visual completa
  - Asegurar que `App.tsx` y `components/Window.tsx` compilan sin errores de TypeScript.
  - Verificar visualmente en el navegador que:
    - El h1 aparece en mayúsculas y negritas en `RegistrationForm` y `SuccessScreen`.
    - El h2 "MAYO 14" aparece sin negritas.
    - No hay párrafo descriptivo entre el h2 y el Window en `RegistrationForm`.
    - El texto de instrucciones usa el color café claro `#6B3A2A`.
    - La imagen de fondo es más visible a través del Window (opacidad 0.65).
    - El footer inferior usa `text-[#6B3A2A]` y no tiene punto final.
    - "INVITRO" aparece fijo en el borde inferior del viewport en ambas pantallas.
  - Preguntar al usuario si hay dudas antes de cerrar.
