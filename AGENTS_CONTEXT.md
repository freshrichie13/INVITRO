# AGENTS_CONTEXT — Referencia Operativa PARADIGMA

> **Documento maestro para agentes de IA (Antigravity, Claude, Cursor) que colaboran en el sistema de pre-registro de PARADIGMA.**
> Este documento define la identidad visual, el stack técnico y los flujos críticos de información.

---

## 1. Identidad y Objetivos del Proyecto

**Nombre:** PARADIGMA — Sistema de Pre-Registro Inmersivo.

**Propósito:** Gestionar el registro previo de asistentes para el evento PARADIGMA, generando un pase de acceso único (QR) y garantizando la persistencia en tiempo real.

**Estética:** Cyberpunk / Retrotech / Matrix. La interfaz debe sentirse como un sistema operativo antiguo o un terminal de hackeo, con animaciones de "glitch", lluvia de código y sonidos sintéticos.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Estilos** | CSS Vanilla (enfocado en fidelidad de diseño) |
| **Base de Datos** | Firebase Firestore |
| **Autenticación** | Firebase Auth (opcional para admin) |
| **Notificaciones** | EmailJS (Envío de QR por correo) |
| **Utilidades** | QRCode (CDN) para generación de pases |

---

## 3. Flujo Crítico de Registro

1. **Captura:** Formulario con validación de nombre y email.
2. **Validación:** Comprobación de existencia previa en Firestore para evitar duplicados.
3. **Generación:** Creación de QR con `email + timestamp`.
4. **Persistencia:** Guardado del registro y el DataURL del QR en Firestore.
5. **Notificación:** Envío de correo vía EmailJS con la imagen del QR incrustada.

---

## 4. Estándares de Calidad Obligatorios (SQA)

### Frontend & UI
- **Consistencia Visual:** Todos los modales deben usar el componente `<Window />`.
- **Efectos:** El fondo `<MatrixBanner />` y los sonidos `<GlitchSound />` son obligatorios para mantener la atmósfera.
- **Responsividad:** La app debe ser perfectamente funcional en dispositivos móviles (el QR se mostrará ahí).

### Código & TypeScript
- **Tipado Estricto:** Prohibido el uso de `any`. Todas las interfaces deben estar en `types.ts`.
- **Servicios:** La lógica de Firebase y Email deben estar aisladas en la carpeta `services/`.
- **Configuración:** Las credenciales deben residir en `config.ts` y cargarse mediante variables de entorno en producción.

---

## 5. Estructura del Proyecto

```
paradigma_pre_registro/
├── AGENTS_CONTEXT.md      ← ESTE ARCHIVO
├── App.tsx                ← Lógica principal y estados
├── components/            ← UI Atómica y Temática
│   ├── Window.tsx
│   ├── MatrixBanner.tsx
│   └── ...
├── services/              ← Integraciones Externas
│   ├── firebaseService.ts
│   └── emailService.ts
├── config.ts              ← Configuración de API Keys
├── types.ts               ← Interfaces de TypeScript
└── index.html             ← Carga de librerías externas (QRCode)
```

---

## 6. Reglas de Entrega de Tareas

Todo cambio debe cerrar con el reporte estándar:
```
[REPORTE_AGENTE]
Agente: <nombre>
Objetivo: <breve descripción>
Cambios: <archivos tocados>
Validación: <qué se probó (ej. registro exitoso, envío de mail)>
Siguiente paso: <acción recomendada>
```
