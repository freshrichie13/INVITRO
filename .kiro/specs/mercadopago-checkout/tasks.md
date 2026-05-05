# Implementation Plan: MercadoPago Checkout

## Overview

Integrar Mercado Pago Checkout Pro en la app de pre-registro. El flujo se extiende con un paso de pago obligatorio: el usuario es redirigido a MP tras confirmar sus datos, y solo un pago aprobado (notificado via webhook) confirma el registro en Firebase y dispara el email con QR.

La implementación sigue este orden: dependencias → tipos y config → servicios Firebase → funciones serverless → modificaciones al cliente React → tests.

## Tasks

- [x] 1. Instalar dependencias y configurar entorno
  - Ejecutar `npm install mercadopago@^2 @vercel/node@^5` para agregar las dependencias de producción y desarrollo
  - Agregar `"mercadopago": "^2.x.x"` en `dependencies` de `package.json`
  - Agregar `"@vercel/node": "^5.x.x"` en `devDependencies` de `package.json`
  - Agregar la sección `"functions"` en `vercel.json` con runtime `nodejs20.x` para `api/*.ts`
  - _Requirements: 5.1, 5.5_

- [x] 2. Actualizar tipos y configuración base
  - [x] 2.1 Extender `types.ts` con los nuevos tipos de pago
    - Agregar campo `paymentStatus: 'pending_payment' | 'paid'` a la interfaz `RegistrationData`
    - Extender `AppState` para incluir `'pending_payment'` y `'payment_failed'`
    - _Requirements: 4.1, 4.2_

  - [x] 2.2 Agregar configuración de MercadoPago en `config.ts`
    - Exportar `mpConfig` con `publicKey` leída desde `import.meta.env.VITE_MP_PUBLIC_KEY` con fallback a la clave pública de desarrollo
    - _Requirements: 4.4_

- [x] 3. Implementar nuevas funciones en `services/firebaseService.ts`
  - [x] 3.1 Implementar `savePendingRegistration`
    - Recibe `Omit<RegistrationData, 'qrCodeUrl'>` y guarda el documento en Firestore con `paymentStatus: 'pending_payment'` y `qrCodeUrl: ''`
    - Incluir campo `name` (firstName + lastName) para compatibilidad con el esquema existente
    - _Requirements: 1.4_

  - [x] 3.2 Implementar `confirmRegistration`
    - Recibe `email: string` y `qrCodeUrl: string`
    - Busca en Firestore el documento con `email == email` y `paymentStatus == 'pending_payment'`
    - Actualiza ese documento con `qrCodeUrl` y `paymentStatus: 'paid'`
    - Lanzar error si no se encuentra el documento
    - _Requirements: 2.4_

  - [x] 3.3 Implementar `checkIfPaidEmailExists`
    - Recibe `email: string`
    - Consulta Firestore buscando documentos con `email == email` y `paymentStatus == 'paid'`
    - Retorna `true` si existe al menos uno, `false` en caso contrario
    - _Requirements: 6.1, 6.2_

  - [ ]* 3.4 Escribir tests unitarios para las nuevas funciones de Firebase
    - Verificar que `savePendingRegistration` guarda con `paymentStatus: 'pending_payment'`
    - Verificar que `confirmRegistration` actualiza `paymentStatus` a `'paid'` y `qrCodeUrl`
    - Verificar que `checkIfPaidEmailExists` retorna `true` solo para registros `paid`
    - _Requirements: 1.4, 2.4, 6.1_

- [x] 4. Crear `api/create-preference.ts` — Vercel Serverless Function
  - [x] 4.1 Implementar el handler principal con validación y lógica de negocio
    - Manejar preflight CORS (OPTIONS → 200 con headers `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`)
    - Rechazar métodos distintos de POST con HTTP 405
    - Parsear y validar body: si falta `firstName`, `lastName` o `email` → HTTP 400 `{ error: "Missing required fields" }`
    - Llamar a `checkIfPaidEmailExists(email)`: si retorna `true` → HTTP 409 `{ error: "Este email ya está registrado y tiene un pago confirmado." }`
    - Inicializar cliente MP con `process.env.MP_ACCESS_TOKEN`
    - Construir la preferencia con `items`, `payer`, `back_urls` y `notification_url` usando `VERCEL_URL` o `process.env.APP_URL`
    - Llamar a `preference.create(body)` del SDK de MP
    - Retornar `{ init_point: result.init_point }` con HTTP 200
    - En caso de error de MP_API → HTTP 500 `{ error: "Error al crear la preferencia de pago." }`
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8, 1.10, 5.2, 5.4, 6.1_

  - [ ]* 4.2 Escribir test de propiedad — Property 1: Estructura de la preferencia de pago
    - **Property 1: Estructura de la preferencia de pago**
    - Para cualquier combinación válida de `firstName`, `lastName` y `email`, la preferencia enviada a MP_API debe contener `items[0].title === 'Entrada — ESTÁS MIRANDO EN RADIANES'`, `items[0].unit_price === 550`, `items[0].currency_id === 'MXN'` y `payer.email === email`
    - Usar `fast-check` con `fc.record({ firstName: fc.string({minLength:1}), lastName: fc.string({minLength:1}), email: fc.emailAddress() })`
    - **Validates: Requirements 1.2**

  - [ ]* 4.3 Escribir test de propiedad — Property 2: URLs de retorno y notificación
    - **Property 2: URLs de retorno y notificación siempre apuntan al dominio correcto**
    - Para cualquier valor de `APP_URL`, las `back_urls` (success, failure, pending) deben comenzar con esa URL base y `notification_url` debe terminar en `/api/webhook`
    - Usar `fc.webUrl()` para generar URLs arbitrarias
    - **Validates: Requirements 1.6, 1.7**

  - [ ]* 4.4 Escribir test de propiedad — Property 3: Validación de campos requeridos
    - **Property 3: Validación de campos requeridos retorna HTTP 400**
    - Para cualquier combinación de campos faltantes o vacíos (`firstName`, `lastName`, `email`), la función debe retornar HTTP 400
    - Usar `fc.record` con `fc.option(fc.string())` y filtrar casos donde al menos uno sea falsy
    - **Validates: Requirements 1.10**

  - [ ]* 4.5 Escribir test de propiedad — Property 9: Prevención de duplicados
    - **Property 9: Prevención de duplicados en create-preference**
    - Para cualquier email que ya tenga `paymentStatus: 'paid'` en Firebase, la función debe retornar HTTP 409 sin llamar a MP_API
    - Usar `fc.emailAddress()` con mock de `checkIfPaidEmailExists` retornando `true`
    - **Validates: Requirements 6.1**

  - [ ]* 4.6 Escribir test de propiedad — Property 10: Headers CORS
    - **Property 10: Headers CORS presentes en todas las respuestas**
    - Para cualquier solicitud (incluyendo OPTIONS preflight), la respuesta debe incluir `Access-Control-Allow-Origin`
    - **Validates: Requirements 5.4**

  - [ ]* 4.7 Escribir tests unitarios para `api/create-preference.ts`
    - Verificar que OPTIONS retorna 200 con headers CORS
    - Verificar que métodos distintos de POST retornan 405
    - Verificar que body vacío retorna 400
    - Verificar que HTTP 409 se retorna cuando el email ya tiene registro `paid`
    - Verificar que error de MP_API retorna 500
    - Verificar que respuesta exitosa contiene `init_point`
    - _Requirements: 1.3, 1.8, 1.10, 5.4, 6.1_

- [x] 5. Checkpoint — Verificar funciones serverless
  - Asegurarse de que `api/create-preference.ts` compila sin errores TypeScript
  - Verificar que los tipos importados de `@vercel/node` (`VercelRequest`, `VercelResponse`) están disponibles
  - Asegurarse de que todos los tests de la tarea 4 pasan, preguntar al usuario si hay dudas.

- [x] 6. Crear `api/webhook.ts` — Vercel Serverless Function
  - [x] 6.1 Implementar el handler principal del webhook
    - Verificar que `req.query.topic === 'payment'` y que `req.query.id` esté presente; si no → HTTP 200 sin acción
    - Inicializar cliente MP con `process.env.MP_ACCESS_TOKEN`
    - Consultar `GET /v1/payments/{id}` via SDK de MP; si falla → HTTP 500
    - Si `payment.status !== 'approved'` → HTTP 200 sin acción
    - Extraer `payer.email` del pago
    - Llamar a `checkIfPaidEmailExists(payer.email)`: si `true` → HTTP 200 sin acción (idempotencia)
    - Buscar Registro_Pendiente en Firebase (`email == payer.email`, `paymentStatus == 'pending_payment'`); si no existe → log + HTTP 200
    - Generar URL de QR via `api.qrserver.com` con los datos del registro
    - Llamar a `confirmRegistration(payer.email, qrCodeUrl)` para actualizar Firebase
    - Enviar email via EmailJS (`emailjs.send`); si falla → log, no revertir Firebase, continuar
    - Retornar HTTP 200
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 6.2_

  - [ ]* 6.2 Escribir test de propiedad — Property 5: Pagos no aprobados no modifican Firebase
    - **Property 5: Pagos no aprobados no modifican Firebase**
    - Para cualquier `status` distinto de `'approved'` (`'pending'`, `'rejected'`, `'cancelled'`, `'in_process'`, `'refunded'`), el webhook no debe realizar ninguna escritura en Firebase y debe retornar HTTP 200
    - Usar `fc.constantFrom('pending', 'rejected', 'cancelled', 'in_process', 'refunded')`
    - **Validates: Requirements 2.7**

  - [ ]* 6.3 Escribir test de propiedad — Property 6: El webhook usa el email del pagador
    - **Property 6: El webhook usa el email del pagador para buscar el registro**
    - Para cualquier pago aprobado con cualquier `payer.email`, el webhook debe consultar Firebase usando exactamente ese email
    - Usar `fc.emailAddress()` y verificar que la query a Firebase usa el email del pago
    - **Validates: Requirements 2.2**

  - [ ]* 6.4 Escribir test de propiedad — Property 7: Idempotencia del webhook
    - **Property 7: Idempotencia del webhook — email ya confirmado**
    - Para cualquier email que ya tenga `paymentStatus: 'paid'`, el webhook no debe actualizar Firebase ni enviar email, y debe retornar HTTP 200
    - Usar `fc.emailAddress()` con mock de `checkIfPaidEmailExists` retornando `true`
    - **Validates: Requirements 2.2, 6.2**

  - [ ]* 6.5 Escribir tests unitarios para `api/webhook.ts`
    - Verificar que topic distinto de `payment` retorna 200 sin acción
    - Verificar que pago con status `pending` no modifica Firebase
    - Verificar que pago aprobado sin Registro_Pendiente retorna 200 con log
    - Verificar que error de EmailJS no revierte el registro en Firebase
    - Verificar que email ya confirmado es ignorado (idempotencia)
    - _Requirements: 2.7, 2.8, 2.10, 2.11, 6.2_

- [x] 7. Checkpoint — Verificar webhook
  - Asegurarse de que `api/webhook.ts` compila sin errores TypeScript
  - Asegurarse de que todos los tests de la tarea 6 pasan, preguntar al usuario si hay dudas.

- [x] 8. Modificar `App.tsx` — nuevo flujo de pago
  - [x] 8.1 Implementar `getInitialAppState` para detección de query params
    - Crear función `getInitialAppState(): AppState` que lee `window.location.search`
    - Si `?payment=success` → retornar `'success'`
    - Si `?payment=failure` → retornar `'payment_failed'`
    - Si `?payment=pending` → retornar `'pending_payment'`
    - Default → retornar `'form'`
    - Usar `getInitialAppState` como valor inicial del `useState<AppState>`
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 8.2 Reemplazar `handleConfirmRegistration` con el nuevo flujo de pago
    - Llamar a `POST /api/create-preference` con `firstName`, `lastName`, `email`
    - Si HTTP 409 → `setError('Este email ya está registrado. Revisa tu bandeja de entrada.')` + `setAppState('form')`
    - Si error de red o HTTP 4xx/5xx → `setError('Ocurrió un error. Inténtalo de nuevo.')` + mantener `'confirmation'`
    - Si OK → extraer `init_point`, llamar a `savePendingRegistration(...)`, luego `setAppState('pending_payment')` y `window.location.href = init_point`
    - Actualizar imports: agregar `savePendingRegistration` desde `firebaseService`
    - _Requirements: 1.1, 1.4, 1.5, 1.9, 6.3_

  - [x] 8.3 Implementar pantalla `PendingPaymentScreen`
    - Crear componente `PendingPaymentScreen` que muestre un indicador de carga o mensaje informando que el usuario está siendo redirigido a Mercado Pago
    - _Requirements: 4.3_

  - [x] 8.4 Implementar pantalla `PaymentFailedScreen`
    - Crear componente `PaymentFailedScreen` que muestre un mensaje de pago fallido o pendiente con opción de reintentar (botón que llama a `setAppState('form')`)
    - _Requirements: 3.3_

  - [x] 8.5 Actualizar `SuccessScreen` con mensaje de demora del email
    - Agregar texto indicando que el email con QR puede tardar unos minutos en llegar (procesamiento asíncrono via webhook)
    - _Requirements: 3.4_

  - [x] 8.6 Agregar los nuevos casos al `switch` de `renderContent`
    - Agregar `case 'pending_payment': return <PendingPaymentScreen />`
    - Agregar `case 'payment_failed': return <PaymentFailedScreen onRetry={() => setAppState('form')} />`
    - _Requirements: 4.2, 3.3_

  - [ ]* 8.7 Escribir test de propiedad — Property 8: Detección de query params
    - **Property 8: Detección de query params de retorno**
    - Para cualquier valor de `?payment=` (`success`, `failure`, `pending`), `getInitialAppState()` debe retornar el `AppState` correcto
    - Usar `fc.constantFrom('success', 'failure', 'pending')` y verificar el mapeo
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 8.8 Escribir tests unitarios para `App.tsx`
    - Verificar que HTTP 409 muestra mensaje de email ya registrado
    - Verificar que error de API mantiene pantalla de confirmación
    - Verificar que pantalla `pending_payment` muestra indicador de carga
    - Verificar que pantalla `success` muestra mensaje sobre demora del email
    - _Requirements: 1.9, 3.4, 4.3, 6.3_

- [x] 9. Verificar compilación TypeScript completa
  - Ejecutar `npx tsc --noEmit` para verificar que todos los archivos modificados y nuevos compilan sin errores
  - Verificar que los nuevos tipos (`paymentStatus`, `AppState` extendido) son usados correctamente en `App.tsx`, `firebaseService.ts` y las funciones serverless
  - _Requirements: 4.1, 4.2_

- [x] 10. Checkpoint final — Asegurarse de que todos los tests pasan
  - Ejecutar `npx vitest --run` para correr todos los tests
  - Verificar que no hay errores de TypeScript con `npx tsc --noEmit`
  - Asegurarse de que todos los tests pasan, preguntar al usuario si hay dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los checkpoints en las tareas 5, 7 y 10 garantizan validación incremental
- Los tests de propiedades usan `fast-check` (debe instalarse: `npm install -D fast-check`)
- `MP_ACCESS_TOKEN` NUNCA debe tener prefijo `VITE_` — solo existe en el entorno de Vercel Functions
- Las funciones serverless usan el SDK cliente de Firebase (no Admin SDK) con inicialización condicional (`getApps().length === 0`) para evitar re-inicialización en invocaciones calientes
- El webhook retorna HTTP 200 incluso cuando EmailJS falla, para evitar reintentos innecesarios de MP_API
