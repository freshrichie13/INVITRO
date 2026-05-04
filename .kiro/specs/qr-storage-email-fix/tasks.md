# Implementation Plan: qr-storage-email-fix

## Overview

Implementación en tres archivos (`types.ts`, `services/firebaseService.ts`, `App.tsx`) para reemplazar el flujo base64 por Firebase Storage URLs, corregir los bugs de QR invisible en emails y errores silenciados, y mejorar el manejo de errores del Registration_Flow.

> ⚠️ **Prerequisito manual (no es una tarea de código):** Antes de ejecutar las tareas, habilitar Firebase Storage en la consola de Firebase:
> Firebase Console → proyecto `invitro-radianes` → Storage → Get Started → modo prueba

## Tasks

- [x] 1. Actualizar el tipo `RegistrationData` en `types.ts`
  - Reemplazar el campo `qrCodeDataUrl: string` por `qrCodeUrl: string` en la interfaz `RegistrationData`
  - Verificar con `tsc --noEmit` que no hay errores de tipo tras el cambio
  - _Requirements: 6.1, 6.2_

- [ ] 2. Agregar `uploadQRToStorage` a `services/firebaseService.ts`
  - [ ] 2.1 Agregar imports del SDK de Firebase Storage
    - Importar `getStorage`, `ref`, `uploadString`, `getDownloadURL` desde `firebase/storage`
    - _Requirements: 1.1, 1.4_

  - [ ] 2.2 Implementar la función `uploadQRToStorage`
    - Firma: `async (base64DataUrl: string, email: string): Promise<string>`
    - Usar `getStorage(firebaseApp)` para obtener la instancia de Storage
    - Construir la referencia con ruta `qr-codes/{email}.png`
    - Subir con `uploadString(storageRef, base64DataUrl, 'data_url')` (tipo `image/png` implícito en data URL)
    - Obtener y retornar la URL pública con `getDownloadURL`
    - Envolver en try/catch y lanzar `new Error('Could not upload QR code to storage.')` si falla
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.3 Escribir property test — Property 1: URL retornada tiene esquema https://
    - **Property 1: La URL retornada por Storage tiene esquema https://**
    - Mockear `getDownloadURL` para retornar una URL `https://`
    - Usar `fc.string()` como generador de emails
    - Verificar que el resultado de `uploadQRToStorage` siempre comienza con `"https://"`
    - **Validates: Requirements 1.2**

  - [ ]* 2.4 Escribir unit tests para `uploadQRToStorage`
    - Test: lanza `"Could not upload QR code to storage."` cuando `uploadString` falla
    - Test: llama a `uploadString` con el formato `'data_url'`
    - Test: construye la ruta correcta `qr-codes/{email}.png`
    - _Requirements: 1.1, 1.3, 1.4_

- [ ] 3. Checkpoint — Verificar compilación y tests de Storage
  - Ejecutar `tsc --noEmit` y confirmar cero errores de tipo
  - Ejecutar los tests de `firebaseService` y confirmar que pasan
  - Preguntar al usuario si hay dudas antes de continuar

- [x] 4. Actualizar `saveRegistration` en `services/firebaseService.ts`
  - Ajustar el tipo del parámetro para que use `qrCodeUrl` en lugar de `qrCodeDataUrl` (el cambio en `types.ts` ya lo propaga, verificar que no queden referencias a `qrCodeDataUrl`)
  - Confirmar que el documento guardado en Firestore incluye `qrCodeUrl` y excluye `qrCodeDataUrl`
  - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 4.1 Escribir property test — Property 2: Documento de Firestore contiene campos requeridos
    - **Property 2: El documento de Firestore contiene exactamente los campos requeridos**
    - Usar `fc.record` con `firstName`, `lastName`, `email`, `qrCodeUrl` como generadores
    - Mockear `addDoc` y capturar el argumento pasado
    - Verificar que el documento contiene `qrCodeUrl` y NO contiene `qrCodeDataUrl`
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 5. Actualizar `handleConfirmRegistration` en `App.tsx`
  - [x] 5.1 Importar `uploadQRToStorage` desde `services/firebaseService`
    - Agregar `uploadQRToStorage` a la importación existente de `firebaseService`
    - _Requirements: 4.1_

  - [x] 5.2 Reordenar el flujo: generar QR → subir a Storage → guardar en Firestore → enviar email
    - Después de generar `qrCodeDataUrl` con `QRCode.toDataURL`, llamar a `uploadQRToStorage(qrCodeDataUrl, userData.email)` para obtener `qrCodeUrl`
    - Pasar `qrCodeUrl` (URL https://) a `saveRegistration` en lugar de `qrCodeDataUrl`
    - Pasar `qrCodeUrl` a `sendConfirmationEmail` como `qr_code_image_url`
    - Eliminar el campo `qrCodeDataUrl` del objeto `registrationData`
    - _Requirements: 4.1, 4.2, 2.1, 3.1, 3.2_

  - [x] 5.3 Mejorar el bloque `catch` con logging incondicional y mensajes específicos
    - Eliminar el condicional `if (process.env.NODE_ENV === 'development')` — `console.error` debe llamarse siempre
    - Implementar la lógica de detección de origen del error según la tabla del diseño:
      - `err.message` contiene `'upload'` o `'storage'` → `"No se pudo procesar el código QR. Inténtalo de nuevo."`
      - `err.message` contiene `'email'` o `'confirmation'` → `"No se pudo enviar el email de confirmación. Inténtalo de nuevo."`
      - `err.message` contiene `'save'` o `'registration'` → `"No se pudo guardar el registro. Inténtalo de nuevo."`
      - Fallback → `"Ocurrió un error. Inténtalo de nuevo."`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.4 Escribir property test — Property 3: Payload de EmailJS con URL es menor a 50 KB
    - **Property 3: El payload de EmailJS con URL es menor a 50 KB**
    - Usar `fc.record` con `fc.webUrl()` para `qr_code_image_url` y `fc.string()` para los demás campos
    - Verificar que `JSON.stringify(params).length < 50000` para cualquier combinación de inputs
    - **Validates: Requirements 3.3**

  - [ ]* 5.5 Escribir property test — Property 4: El flujo se detiene ante cualquier fallo y muestra error
    - **Property 4: El flujo se detiene ante cualquier fallo y muestra error**
    - Usar `fc.constantFrom('storage', 'firestore', 'email')` para seleccionar el paso que falla
    - Mockear el servicio correspondiente para que lance un error
    - Verificar que `appState === 'form'` y `error !== null` tras el fallo
    - Verificar que los pasos posteriores al fallo no se ejecutan
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 5.6 Escribir property test — Property 5: console.error siempre se llama
    - **Property 5: console.error siempre se llama ante cualquier error**
    - Usar `fc.constantFrom('production', 'development', 'test')` para `NODE_ENV`
    - Mockear `uploadQRToStorage` para que falle
    - Verificar que `consoleSpy` fue invocado independientemente del entorno
    - **Validates: Requirements 5.1**

  - [ ]* 5.7 Escribir property test — Property 6: Mensajes de error específicos por servicio
    - **Property 6: Los mensajes de error son específicos según el servicio que falla**
    - Usar `fc.constantFrom` con los tres pares `{ error, expectedMessage }` definidos en el diseño
    - Verificar que el mensaje capturado en `setError` coincide exactamente con el esperado para cada servicio
    - **Validates: Requirements 5.3, 5.4, 5.5**

  - [ ]* 5.8 Escribir unit tests para `handleConfirmRegistration`
    - Test: ejecuta los 4 pasos en el orden correcto cuando todos tienen éxito
    - Test: transiciona a `'success'` cuando todos los pasos tienen éxito
    - Test: mantiene `isSubmitting: true` durante la ejecución y `false` al finalizar (bloque `finally`)
    - _Requirements: 4.1, 4.4, 4.5_

- [x] 6. Checkpoint final — Verificar compilación y tests completos
  - Ejecutar `tsc --noEmit` y confirmar cero errores de tipo en todos los archivos modificados
  - Ejecutar todos los tests y confirmar que pasan
  - Verificar que no quedan referencias a `qrCodeDataUrl` en `types.ts`, `firebaseService.ts` ni `App.tsx`
  - Preguntar al usuario si hay dudas antes de dar por completada la implementación

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- El prerequisito de habilitar Firebase Storage en la consola es manual y debe completarse antes de probar el flujo en el navegador
- Los tests de propiedades usan `fast-check` — instalar con `npm install --save-dev fast-check` si no está disponible
- Cada tarea referencia los requisitos específicos para trazabilidad completa
- El campo `name` (nombre completo) se mantiene en el Registration_Record por compatibilidad con datos existentes
