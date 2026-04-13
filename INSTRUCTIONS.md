# INSTRUCTIONS - Reglas de Ingeniería PARADIGMA

## Objetivo
Garantizar que el sistema de pre-registro sea infalible, evitando registros duplicados y asegurando que cada usuario reciba su código QR.

## Reglas de Oro del Proyecto
1. **Validación de Email:** Nunca permitir un registro sin validar antes si el email existe en Firebase.
2. **Integridad del QR:** El código QR debe contener un JSON con `email` y `timestamp` para validación forense posterior.
3. **Estética Intacta:** Cualquier nuevo componente debe seguir la línea visual "Retrotech". No introducir elementos minimalistas modernos que rompan la inmersión.
4. **Manejo de Errores:** Todos los procesos asíncronos (Firebase/EmailJS) deben tener bloques try/catch con feedback visual al usuario en la ventana de registro.

## Verificación de Cambios
- **Local:** Verificar que `npm run dev` no lance advertencias de TypeScript.
- **Firebase:** Confirmar que los datos se escriben correctamente en la colección de registros.
- **Email:** Validar que el template de EmailJS recibe correctamente el `qr_code_image_url`.
