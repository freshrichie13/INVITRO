# MEMORY - Registro de Decisiones

## Formato
- **Contexto:** Problema o necesidad.
- **Decisión:** Qué solución se implementó.
- **Impacto:** Consecuencias en el sistema.

---

## Histórico de Decisiones

### [2026-04-12] Inicialización del Sistema
- **Contexto:** Se requiere un sistema de registro rápido y visualmente impactante.
- **Decisión:** Uso de React 19 como base y Firebase para persistencia serverless. Se opta por una estética "Matrix" para diferenciar el evento.
- **Impacto:** Alta velocidad de desarrollo y facilidad de escalado para el día del evento.

### [2026-04-12] Generación de QR del lado del Cliente
- **Contexto:** Evitar sobrecarga en el backend y latencia en la UI.
- **Decisión:** Usar la librería `QRCode` vía CDN en el cliente.
- **Impacto:** Generación instantánea del código que se guarda directamente como DataURL en Firebase.
