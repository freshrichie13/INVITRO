# Requerimientos: Flujo de Pago Multi-Opción

## Contexto
Actualmente la aplicación obliga al usuario a pasar por Mercado Pago para completar su registro. Se requiere flexibilizar esto para capturar asistentes que prefieren pagar físicamente.

## Requerimientos Funcionales
1. **RF-01: Selección de Método de Pago:** El usuario debe poder elegir entre "Pago Online" y "Pago en Puerta" tras confirmar sus datos.
2. **RF-02: Registro Persistente en Puerta:** Al elegir "Pago en Puerta", el sistema debe guardar el registro en Firestore con estatus `pay_at_door`.
3. **RF-03: Pantalla de Éxito Diferenciada:** El flujo de "Pago en Puerta" no debe redirigir a Mercado Pago, sino mostrar una confirmación local.
4. **RF-04: Trazabilidad de Intenciones:** Mantener el estatus `pending_payment` para aquellos que eligieron "Pago Online" pero no completaron la transacción (Caso de abandono).

## Reglas de Negocio
- Los registros `pay_at_door` no disparan el envío automático de QR (el QR se entrega tras el pago físico o se valida manualmente).
- El email sigue siendo obligatorio para todos los casos.
