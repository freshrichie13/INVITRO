# Requirements Document

## Introduction

Este documento describe los ajustes visuales y de UI para la aplicación de pre-registro del evento de música en vivo **LIVE SETS**. La app está construida con React + TypeScript + Tailwind CSS (CDN) + Vite y desplegada en Vercel.

El objetivo del rebrand es reemplazar la estética actual (blanco/negro/gris) por una paleta más cálida y orgánica basada en café oscuro, marrón y terracota, incorporar una imagen de fondo existente en el proyecto, actualizar textos específicos y limpiar el footer.

Estos cambios son puramente visuales y no alteran la lógica de negocio, el flujo de registro ni la integración con Firebase o EmailJS.

---

## Glossary

- **App**: La aplicación web de pre-registro LIVE SETS en su totalidad.
- **RegistrationForm**: Pantalla principal con el formulario de pre-registro (estado `form`).
- **ConfirmationScreen**: Pantalla de confirmación de datos antes de enviar (estado `confirmation`).
- **SuccessScreen**: Pantalla de éxito mostrada tras completar el registro (estado `success`).
- **Window**: Componente contenedor (`components/Window.tsx`) que envuelve formularios y secciones de contenido con un borde y fondo.
- **Button**: Componente de botón reutilizable (`components/Button.tsx`).
- **Input**: Componente de campo de texto reutilizable (`components/Input.tsx`).
- **Footer**: Sección inferior de cada pantalla que contiene el texto de atribución de marca.
- **Background_Image**: Archivo `public/images/nuevo fondo pagina registro3500pxls.jpg` que se usará como fondo de la App.
- **Warm_Palette**: Paleta de colores cálidos compuesta por café oscuro (`#3B1F0E`), marrón medio (`#6B3A2A`), terracota (`#C1714F`) y crema/beige (`#F5ECD7`) como color de texto principal sobre fondos oscuros.
- **INVITRO**: Nombre de la marca que reemplaza al texto "Powered by FRESH RICHIE" en el Footer.

---

## Requirements

### Requirement 1: Imagen de fondo global

**User Story:** Como visitante del evento, quiero ver una imagen de fondo visualmente atractiva en toda la app, para que la experiencia de pre-registro refleje la estética del evento.

#### Acceptance Criteria

1. THE App SHALL mostrar `Background_Image` como fondo de pantalla completo en todas las pantallas (RegistrationForm, ConfirmationScreen, SuccessScreen).
2. WHEN la App se renderiza, THE App SHALL aplicar `background-size: cover` y `background-position: center` a la imagen de fondo para que cubra toda la ventana sin distorsión.
3. WHILE la imagen de fondo está activa, THE App SHALL mantener la imagen fija (sin scroll) usando `background-attachment: fixed` en pantallas de escritorio.
4. IF la imagen de fondo no puede cargarse, THEN THE App SHALL mostrar un color de fondo sólido de la Warm_Palette (`#3B1F0E`) como fallback.

---

### Requirement 2: Paleta de colores cálida

**User Story:** Como organizador del evento, quiero que la app use una paleta de colores cálida (café oscuro, marrón, terracota), para que la estética sea más orgánica y coherente con la identidad visual del evento.

#### Acceptance Criteria

1. THE App SHALL reemplazar el color de fondo base blanco (`#ffffff`) por el color café oscuro de la Warm_Palette (`#3B1F0E`) como color de fondo de respaldo (cuando no hay imagen).
2. THE Window SHALL reemplazar su fondo blanco y borde negro por un fondo semi-transparente en tonos oscuros cálidos (ej. `rgba(59, 31, 14, 0.85)`) y un borde en terracota (`#C1714F`).
3. THE Button SHALL reemplazar su esquema blanco/negro por un esquema basado en la Warm_Palette: fondo terracota (`#C1714F`), texto crema (`#F5ECD7`), borde terracota, y en estado hover fondo café oscuro (`#3B1F0E`) con texto crema.
4. THE Input SHALL reemplazar su fondo blanco y borde negro por fondo semi-transparente oscuro cálido, borde marrón (`#6B3A2A`), texto crema (`#F5ECD7`) y placeholder en tono marrón claro.
5. THE App SHALL reemplazar todos los textos en negro (`text-black`) por crema/beige (`#F5ECD7`) o blanco roto para garantizar legibilidad sobre fondos oscuros.
6. THE App SHALL reemplazar los textos secundarios en gris (`text-gray-500`, `text-gray-600`, `text-gray-700`) por variantes más claras de la Warm_Palette que mantengan contraste WCAG AA sobre el fondo oscuro.
7. WHEN un campo Input tiene un error de validación, THE Input SHALL mostrar el borde en rojo terracota o rojo cálido (ej. `#D9534F`) en lugar del rojo estándar, manteniendo coherencia con la paleta.

---

### Requirement 3: Actualización del Footer

**User Story:** Como organizador del evento, quiero que el footer muestre únicamente "INVITRO" en lugar de "Powered by FRESH RICHIE", para reflejar la identidad de marca actual.

#### Acceptance Criteria

1. THE Footer SHALL reemplazar el texto "Powered by FRESH RICHIE" por el texto "INVITRO" en todas las pantallas donde aparece (RegistrationForm y SuccessScreen).
2. THE Footer SHALL eliminar el enlace `href` a `https://fresh-richie.vercel.app/` y renderizar "INVITRO" como texto plano no interactivo (sin `<a>` tag).
3. THE Footer SHALL mantener el mismo estilo tipográfico general (tamaño pequeño, uppercase, tracking amplio) adaptado a la Warm_Palette (texto en crema con opacidad reducida).

---

### Requirement 4: Actualización de textos de la interfaz

**User Story:** Como organizador del evento, quiero poder actualizar los textos visibles en la app (títulos, subtítulos, descripciones, mensajes), para que la información mostrada sea precisa y actualizada para cada edición del evento.

#### Acceptance Criteria

1. THE RegistrationForm SHALL mostrar el título principal (`h1`) con el texto: **"Estás Mirando en Radianes"**.
2. THE RegistrationForm SHALL mostrar el subtítulo (`h2`) con el texto: **"Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees."**
3. THE RegistrationForm SHALL eliminar el subtítulo de fecha "ABRIL 17" como elemento `h2` separado, integrando la fecha en el contexto del evento si aplica.
4. THE RegistrationForm SHALL mantener el texto descriptivo del formulario actualizado para reflejar el nuevo nombre del evento en lugar de "LIVE SETS".
5. THE SuccessScreen SHALL mostrar el mismo título principal "Estás Mirando en Radianes" para mantener consistencia de marca.
6. THE SuccessScreen SHALL mantener el mensaje de confirmación de registro y el texto de hora del evento.
7. WHEN el usuario solicite cambios de texto, THE App SHALL permitir actualizar dichos textos modificando únicamente los valores en los componentes correspondientes sin alterar la lógica de negocio.

---

### Requirement 5: Consistencia visual entre pantallas

**User Story:** Como visitante del evento, quiero que todas las pantallas de la app tengan una apariencia visual coherente, para que la experiencia de navegación sea fluida y profesional.

#### Acceptance Criteria

1. THE RegistrationForm, ConfirmationScreen y SuccessScreen SHALL aplicar la misma Background_Image, Warm_Palette y estilos de Window, Button e Input definidos en los Requirements 1 y 2.
2. THE ConfirmationScreen SHALL actualizar los textos de etiquetas ("Nombre:", "Email:") y los textos de botones ("Volver", "Confirmar") para usar colores de la Warm_Palette con contraste legible.
3. THE ConfirmationScreen SHALL actualizar el separador (`border-gray-200`) por un borde en tono marrón cálido de la Warm_Palette.
4. WHEN el estado de la App cambia entre pantallas, THE App SHALL mantener la Background_Image visible y sin parpadeo durante la transición.

---

### Requirement 6: Accesibilidad y legibilidad

**User Story:** Como visitante del evento, quiero que todos los textos sean legibles sobre el fondo oscuro e imagen de fondo, para que pueda completar el registro sin dificultad.

#### Acceptance Criteria

1. THE App SHALL garantizar que todos los textos de contenido principal cumplan con un ratio de contraste mínimo de 4.5:1 (WCAG AA) sobre sus fondos respectivos.
2. THE Window SHALL aplicar un fondo semi-transparente con suficiente opacidad para que el texto dentro del contenedor sea legible sobre la Background_Image.
3. THE Input SHALL mantener el texto ingresado por el usuario legible (contraste mínimo 4.5:1) sobre el fondo del campo.
4. IF el dispositivo del usuario tiene `prefers-reduced-motion` activo, THEN THE App SHALL no aplicar animaciones de transición en cambios de color o fondo.

