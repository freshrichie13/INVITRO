# NOW - Foco del Desarrollo

## Objetivo Actual
Finalizar el flujo de pre-registro "End-to-End" y asegurar la estabilidad de las integraciones con servicios externos.

## Estado de las Áreas
- **UI/UX:** 🟢 Terminado (Estética Matrix funcional).
- **Servicios (Firebase):** 🟡 En pruebas (Validación de duplicados activa).
- **Notificaciones (EmailJS):** ⚪ Pendiente de configuración de credenciales reales.

## Tareas Inmediatas
1. [ ] Reemplazar las credenciales placeholder en `config.ts`.
2. [ ] Probar el flujo completo: Registro -> Firestore -> EmailJS.
3. [ ] Añadir validación de "email ya registrado" con un mensaje más descriptivo en la UI.

## Bloqueos
- Se requieren las API Keys reales de Firebase y EmailJS para pruebas finales de integración.
