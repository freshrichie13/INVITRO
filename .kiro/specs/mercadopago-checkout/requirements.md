# Requirements Document

## Introduction

Este documento describe los requisitos para integrar Mercado Pago Checkout Pro como pasarela de pago en la app de pre-registro del evento "ESTÁS MIRANDO EN RADIANES". El flujo actual (formulario → confirmar → guardar en Firebase → enviar email con QR) se extiende para incluir un paso de pago obligatorio antes de confirmar el registro. Se implementan dos Vercel Serverless Functions: una para crear la preferencia de pago en Mercado Pago y otra para recibir notificaciones de pago (webhook). El registro en Firebase y el envío del email con QR se mueven al webhook, garantizando que solo los pagos aprobados generen un registro válido.

## Glossary

- **App**: La aplicación React 19 + TypeScript + Vite desplegada en Vercel.
- **Create_Preference_Function**: La Vercel Serverless Function ubicada en `api/create-preference.ts` que crea preferencias de pago en la API de Mercado Pago.
- **Webhook_Function**: La Vercel Serverless Function ubicada en `api/webhook.ts` que recibe y procesa notificaciones de pago de Mercado Pago.
- **MP_API**: La API REST de Mercado Pago (api.mercadopago.com).
- **Firebase**: El servicio de base de datos Firestore usado para persistencia de registros.
- **EmailJS**: El servicio externo usado para envío de emails de confirmación con QR.
- **QR_Service**: La API pública `api.qrserver.com` usada para generar URLs de códigos QR.
- **Preferencia**: El objeto de preferencia de pago creado en MP_API que contiene precio, descripción, datos del comprador y URLs de retorno.
- **init_point**: La URL única de pago de Mercado Pago retornada al crear una Preferencia.
- **back_url**: Las URLs de retorno configuradas en la Preferencia a las que MP_API redirige al usuario tras el pago (success, failure, pending).
- **notification_url**: La URL del Webhook_Function configurada en la Preferencia para recibir notificaciones de pago de MP_API.
- **Registro_Pendiente**: Un documento en Firebase con `paymentStatus: 'pending_payment'` creado al iniciar el flujo de pago, antes de que el pago sea confirmado.
- **Registro_Confirmado**: Un documento en Firebase con `paymentStatus: 'paid'` actualizado por el Webhook_Function tras verificar un pago aprobado.
- **MP_ACCESS_TOKEN**: Credencial secreta de Mercado Pago almacenada como variable de entorno en Vercel, usada por las funciones serverless.
- **VITE_MP_PUBLIC_KEY**: Credencial pública de Mercado Pago expuesta al cliente React vía variable de entorno Vite.

---

## Requirements

### Requirement 1: Creación de Preferencia de Pago

**User Story:** Como usuario que completó el formulario de pre-registro, quiero ser redirigido a Mercado Pago para pagar mi entrada, para que mi registro quede confirmado solo si el pago es exitoso.

#### Acceptance Criteria

1. WHEN el usuario confirma sus datos en la pantalla de confirmación, THE App SHALL llamar a `POST /api/create-preference` con `firstName`, `lastName` y `email` del usuario.
2. WHEN la App llama a `POST /api/create-preference`, THE Create_Preference_Function SHALL crear una Preferencia en MP_API con título "Entrada — ESTÁS MIRANDO EN RADIANES", precio `550`, moneda `MXN` y los datos del comprador (`firstName`, `lastName`, `email`).
3. WHEN la Preferencia es creada exitosamente en MP_API, THE Create_Preference_Function SHALL retornar un objeto JSON con el campo `init_point` (URL de pago de Mercado Pago).
4. WHEN la Create_Preference_Function retorna `init_point`, THE App SHALL guardar un Registro_Pendiente en Firebase con `paymentStatus: 'pending_payment'` antes de redirigir al usuario.
5. WHEN el Registro_Pendiente es guardado en Firebase, THE App SHALL redirigir al usuario a la URL `init_point` recibida de la Create_Preference_Function.
6. WHEN la Create_Preference_Function crea la Preferencia, THE Create_Preference_Function SHALL configurar `notification_url` apuntando a `/api/webhook` en el dominio de la App.
7. WHEN la Create_Preference_Function crea la Preferencia, THE Create_Preference_Function SHALL configurar `back_urls` con rutas `success`, `failure` y `pending` apuntando al dominio de la App.
8. IF la llamada a MP_API falla al crear la Preferencia, THEN THE Create_Preference_Function SHALL retornar un código HTTP 500 con un mensaje de error descriptivo en JSON.
9. IF la App recibe un error de `POST /api/create-preference`, THEN THE App SHALL mostrar un mensaje de error al usuario y mantener la pantalla de confirmación activa.
10. WHEN la Create_Preference_Function recibe una solicitud, THE Create_Preference_Function SHALL validar que `firstName`, `lastName` y `email` estén presentes y no vacíos; IF alguno falta, THEN THE Create_Preference_Function SHALL retornar HTTP 400 con un mensaje de error descriptivo.

---

### Requirement 2: Procesamiento del Webhook de Pago

**User Story:** Como operador del evento, quiero que el sistema confirme automáticamente los registros solo cuando Mercado Pago notifique un pago aprobado, para que no se generen entradas sin pago real.

#### Acceptance Criteria

1. WHEN MP_API envía una notificación `POST /api/webhook` con `topic=payment` e `id` del pago, THE Webhook_Function SHALL consultar `GET https://api.mercadopago.com/v1/payments/{id}` para obtener los detalles del pago.
2. WHEN el pago consultado tiene `status: 'approved'`, THE Webhook_Function SHALL buscar el Registro_Pendiente en Firebase usando el email del pagador (`payer.email`) obtenido de la respuesta de MP_API.
3. WHEN el Registro_Pendiente es encontrado en Firebase, THE Webhook_Function SHALL generar la URL del QR via QR_Service usando los datos del registro (`firstName`, `lastName`, `email`, fecha y nombre del evento).
4. WHEN la URL del QR es generada, THE Webhook_Function SHALL actualizar el Registro_Pendiente en Firebase estableciendo `qrCodeUrl` con la URL generada y `paymentStatus: 'paid'`.
5. WHEN el registro en Firebase es actualizado a `paymentStatus: 'paid'`, THE Webhook_Function SHALL enviar el email de confirmación con QR via EmailJS al email del registro.
6. WHEN el Webhook_Function completa el procesamiento exitosamente, THE Webhook_Function SHALL retornar HTTP 200.
7. IF el pago consultado tiene `status` distinto de `'approved'` (ej. `pending`, `rejected`), THEN THE Webhook_Function SHALL retornar HTTP 200 sin modificar ningún registro en Firebase.
8. IF la notificación recibida no contiene `topic=payment`, THEN THE Webhook_Function SHALL retornar HTTP 200 sin realizar ninguna acción.
9. IF la consulta a MP_API para obtener detalles del pago falla, THEN THE Webhook_Function SHALL retornar HTTP 500 con un mensaje de error descriptivo.
10. IF no se encuentra un Registro_Pendiente en Firebase con el email del pagador, THEN THE Webhook_Function SHALL registrar el evento en los logs y retornar HTTP 200 sin lanzar un error.
11. IF el envío del email via EmailJS falla, THEN THE Webhook_Function SHALL registrar el error en los logs, mantener el registro en Firebase con `paymentStatus: 'paid'` y retornar HTTP 200 para evitar reintentos innecesarios de MP_API.

---

### Requirement 3: Pantalla de Éxito Post-Pago

**User Story:** Como usuario que completó el pago, quiero ver una pantalla de confirmación al ser redirigido de vuelta a la app, para saber que mi registro fue exitoso.

#### Acceptance Criteria

1. WHEN MP_API redirige al usuario a la `back_url` de éxito, THE App SHALL mostrar la pantalla de éxito (`AppState: 'success'`) con un mensaje que indique que el pago fue procesado y el email con QR será enviado.
2. WHEN la App detecta que la URL actual corresponde a la `back_url` de éxito (parámetro `?status=approved` o ruta `/success`), THE App SHALL transicionar automáticamente a `AppState: 'success'` sin requerir acción del usuario.
3. WHEN la App detecta que la URL actual corresponde a la `back_url` de `failure` o `pending`, THE App SHALL mostrar un mensaje apropiado al usuario indicando el estado del pago y ofrecer la opción de reintentar.
4. THE App SHALL mostrar en la pantalla de éxito un mensaje que indique que el email con el código QR puede tardar unos minutos en llegar, dado que el procesamiento es asíncrono via webhook.

---

### Requirement 4: Tipos y Estado de la Aplicación

**User Story:** Como desarrollador, quiero que los tipos TypeScript reflejen el nuevo flujo de pago, para mantener type-safety en toda la aplicación.

#### Acceptance Criteria

1. THE App SHALL extender `RegistrationData` en `types.ts` con el campo `paymentStatus` de tipo `'pending_payment' | 'paid'`.
2. THE App SHALL extender `AppState` en `types.ts` para incluir el estado `'pending_payment'` que representa al usuario siendo redirigido a Mercado Pago.
3. WHILE la App está en `AppState: 'pending_payment'`, THE App SHALL mostrar un indicador de carga o mensaje que informe al usuario que está siendo redirigido a Mercado Pago.
4. THE App SHALL agregar en `config.ts` la configuración de Mercado Pago con `publicKey` leída desde la variable de entorno `VITE_MP_PUBLIC_KEY`.

---

### Requirement 5: Configuración de Vercel Serverless Functions

**User Story:** Como desarrollador, quiero que las funciones serverless estén correctamente configuradas en Vercel, para que los endpoints `/api/create-preference` y `/api/webhook` sean accesibles en producción.

#### Acceptance Criteria

1. THE App SHALL incluir los archivos `api/create-preference.ts` y `api/webhook.ts` en el repositorio para que Vercel los detecte y despliegue automáticamente como Serverless Functions.
2. THE Create_Preference_Function y THE Webhook_Function SHALL leer `MP_ACCESS_TOKEN` exclusivamente desde variables de entorno de Vercel (`process.env.MP_ACCESS_TOKEN`), sin incluir credenciales en el código fuente.
3. WHEN se realiza una solicitud a `/api/create-preference` o `/api/webhook`, THE Vercel SHALL enrutar la solicitud a la Serverless Function correspondiente sin interferir con el enrutamiento del frontend React.
4. THE Create_Preference_Function y THE Webhook_Function SHALL incluir headers CORS apropiados para permitir solicitudes desde el dominio de la App.
5. THE Create_Preference_Function y THE Webhook_Function SHALL usar el SDK oficial de Mercado Pago (`mercadopago` npm package) para interactuar con MP_API.

---

### Requirement 6: Prevención de Registros Duplicados

**User Story:** Como operador del evento, quiero que el sistema prevenga registros duplicados por email, para que cada persona solo pueda registrarse una vez aunque intente pagar múltiples veces.

#### Acceptance Criteria

1. WHEN la Create_Preference_Function recibe una solicitud con un `email` que ya tiene un Registro_Confirmado (`paymentStatus: 'paid'`) en Firebase, THE Create_Preference_Function SHALL retornar HTTP 409 con un mensaje indicando que el email ya está registrado.
2. WHEN el Webhook_Function procesa un pago aprobado y encuentra que el email ya tiene un Registro_Confirmado en Firebase, THE Webhook_Function SHALL omitir la actualización y el envío de email, y retornar HTTP 200.
3. WHEN la App recibe HTTP 409 de `POST /api/create-preference`, THE App SHALL mostrar al usuario un mensaje indicando que su email ya está registrado y no redirigir a Mercado Pago.
