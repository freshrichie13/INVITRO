# Requirements Document

## Introduction

La app de pre-registro del evento "ESTÁS MIRANDO EN RADIANES" actualmente genera códigos QR como Data URLs en base64, los guarda directamente en Firestore y los envía como parámetro de imagen a EmailJS. Este flujo produce tres bugs críticos: (1) los clientes de email bloquean imágenes base64 inline por seguridad, impidiendo que el QR se renderice; (2) el payload pesado (~20–50 KB de base64) supera el límite de EmailJS y provoca fallos silenciosos donde el email no se envía pero la app muestra éxito; (3) los errores del bloque catch se silencian en producción, impidiendo diagnóstico y notificación.

Esta mejora técnica introduce Firebase Storage como capa de almacenamiento para los QR, reemplaza el base64 por URLs `https://` públicas en Firestore y en EmailJS, y mejora el manejo de errores para que los fallos sean visibles y accionables.

## Glossary

- **Registration_Flow**: El flujo completo de pre-registro que va desde la confirmación de datos del usuario hasta mostrar la pantalla de éxito.
- **QR_Generator**: El módulo cliente que usa la librería QRCode (CDN) para producir el código QR como Data URL base64.
- **Storage_Service**: El módulo `firebaseService.ts` extendido con la función `uploadQRToStorage()` que sube el QR a Firebase Storage y retorna una URL pública `https://`.
- **Firestore_Service**: El módulo `firebaseService.ts` que persiste los datos de registro en la colección `registrations` de Firestore.
- **Email_Service**: El módulo `emailService.ts` que envía el email de confirmación vía EmailJS usando el template `template_i88nezb`.
- **QR_Storage_URL**: La URL pública `https://` de Firebase Storage que apunta al archivo PNG del código QR del asistente.
- **QR_Base64**: La representación Data URL en base64 del código QR generada por QRCode en el cliente (formato `data:image/png;base64,...`).
- **Registration_Record**: El documento guardado en Firestore con los datos del asistente, incluyendo la referencia al QR.
- **Error_Handler**: El bloque `catch` en `handleConfirmRegistration` dentro de `App.tsx` que gestiona los errores del Registration_Flow.

---

## Requirements

### Requirement 1: Subir QR a Firebase Storage

**User Story:** Como organizador del evento, quiero que los códigos QR se almacenen en Firebase Storage con URLs públicas, para que los emails lleguen con el QR visible en todos los clientes de correo.

#### Acceptance Criteria

1. WHEN el QR_Generator produce un QR_Base64 válido, THE Storage_Service SHALL subir el archivo a Firebase Storage bajo la ruta `qr-codes/{email}.png`.
2. WHEN la subida a Firebase Storage se completa exitosamente, THE Storage_Service SHALL retornar la QR_Storage_URL pública con esquema `https://`.
3. IF la subida a Firebase Storage falla, THEN THE Storage_Service SHALL lanzar un error con el mensaje `"Could not upload QR code to storage."`.
4. THE Storage_Service SHALL subir el QR como archivo de tipo `image/png`.
5. WHEN se sube un QR para un email que ya tiene un archivo previo en la misma ruta, THE Storage_Service SHALL sobreescribir el archivo existente.

---

### Requirement 2: Guardar URL en Firestore en lugar de base64

**User Story:** Como desarrollador, quiero que Firestore almacene la URL del QR en lugar del base64, para reducir el tamaño de los documentos y mantener consistencia con el nuevo flujo.

#### Acceptance Criteria

1. WHEN el Registration_Flow guarda un Registration_Record, THE Firestore_Service SHALL persistir el campo `qrCodeUrl` con la QR_Storage_URL.
2. THE Firestore_Service SHALL omitir el campo `qrCodeDataUrl` (base64) del Registration_Record guardado en Firestore.
3. THE Registration_Record guardado en Firestore SHALL contener los campos: `firstName`, `lastName`, `name`, `email`, `qrCodeUrl`, `registeredAt`.

---

### Requirement 3: Enviar URL del QR a EmailJS en lugar de base64

**User Story:** Como asistente al evento, quiero recibir un email con el código QR visible, para poder presentarlo en la puerta el día del evento.

#### Acceptance Criteria

1. WHEN el Email_Service envía el email de confirmación, THE Email_Service SHALL incluir la QR_Storage_URL en el parámetro `qr_code_image_url` del template de EmailJS.
2. THE Email_Service SHALL enviar la QR_Storage_URL como una cadena de texto con esquema `https://` y no como un QR_Base64.
3. WHEN el Email_Service envía el email con la QR_Storage_URL, THE Email_Service SHALL producir un payload cuyo tamaño total sea menor a 50 KB.
4. IF el envío del email falla, THEN THE Email_Service SHALL lanzar un error con el mensaje `"Could not send confirmation email."`.

---

### Requirement 4: Orquestar el nuevo flujo en el Registration_Flow

**User Story:** Como desarrollador, quiero que el flujo de registro ejecute los pasos en el orden correcto (generar QR → subir a Storage → guardar en Firestore → enviar email), para garantizar que cada paso dependa del resultado del anterior.

#### Acceptance Criteria

1. WHEN el usuario confirma su registro, THE Registration_Flow SHALL ejecutar los pasos en este orden: (1) generar QR_Base64, (2) subir a Storage y obtener QR_Storage_URL, (3) guardar Registration_Record en Firestore con QR_Storage_URL, (4) enviar email con QR_Storage_URL.
2. IF cualquier paso del Registration_Flow falla, THEN THE Registration_Flow SHALL detener la ejecución de los pasos siguientes.
3. IF cualquier paso del Registration_Flow falla, THEN THE Registration_Flow SHALL mostrar al usuario el mensaje de error en la pantalla del formulario.
4. WHILE el Registration_Flow está ejecutando, THE Registration_Flow SHALL mantener el estado `isSubmitting` en `true` para deshabilitar el botón de confirmación.
5. WHEN el Registration_Flow completa todos los pasos exitosamente, THE Registration_Flow SHALL transicionar el estado de la app a `'success'`.

---

### Requirement 5: Mejorar el manejo de errores del Registration_Flow

**User Story:** Como desarrollador, quiero que los errores del flujo de registro sean visibles en todos los entornos, para poder diagnosticar y corregir fallos en producción.

#### Acceptance Criteria

1. WHEN el Error_Handler captura un error durante el Registration_Flow, THE Error_Handler SHALL registrar el error con `console.error` independientemente del valor de `process.env.NODE_ENV`.
2. WHEN el Error_Handler captura un error durante el Registration_Flow, THE Error_Handler SHALL mostrar al usuario un mensaje de error descriptivo en la UI.
3. IF el error capturado proviene del Email_Service, THEN THE Error_Handler SHALL mostrar el mensaje `"No se pudo enviar el email de confirmación. Inténtalo de nuevo."`.
4. IF el error capturado proviene del Storage_Service, THEN THE Error_Handler SHALL mostrar el mensaje `"No se pudo procesar el código QR. Inténtalo de nuevo."`.
5. IF el error capturado proviene del Firestore_Service, THEN THE Error_Handler SHALL mostrar el mensaje `"No se pudo guardar el registro. Inténtalo de nuevo."`.

---

### Requirement 6: Actualizar el tipo RegistrationData

**User Story:** Como desarrollador, quiero que el tipo `RegistrationData` en `types.ts` refleje el nuevo esquema con URL en lugar de base64, para mantener la consistencia de tipos en toda la aplicación.

#### Acceptance Criteria

1. THE `RegistrationData` type SHALL incluir el campo `qrCodeUrl: string` en lugar del campo `qrCodeDataUrl: string`.
2. WHEN el compilador de TypeScript procesa los archivos modificados, THE compilador SHALL producir cero errores de tipo relacionados con `RegistrationData`.
