---
trigger: always_on
---

Construye un sistema SaaS web de gestión de condominios para República Dominicana, inspirado funcionalmente en plataformas como NHO, pero desarrollado desde cero, con arquitectura propia y listo para escalar.

IMPORTANTE:
- implementar todo en una sola ejecución
- no trabajar por fases separadas
- no pedir confirmación
- hablar lo menos posible
- no explicar teoría
- hacer cambios concretos
- dejar el sistema consistente
- si algo no puede quedar 100% terminado, dejarlo funcional con estructura real, no placeholders vacíos

STACK BASE:
- Frontend: Next.js + TypeScript + Tailwind
- Backend: NestJS + Prisma
- DB: PostgreSQL
- Auth: JWT + roles + tenant isolation
- Arquitectura SaaS multi-tenant

REGLAS GENERALES:
- no romper lo ya construido
- revisar primero la estructura existente
- reutilizar módulos, servicios y patrones ya creados
- mantener código limpio, seguro y mantenible
- validar toda entrada
- aplicar aislamiento multi-tenant en toda consulta y mutación
- aplicar permisos por rol en endpoints y servicios
- no mezclar datos entre condominios
- dejar DTOs, enums, servicios y controladores consistentes
- compilar sin errores
- corregir imports no usados, tipos rotos y código muerto

ROLES OBLIGATORIOS:
- SUPER_ADMIN
- CONDO_ADMIN
- OWNER
- TENANT
- SECURITY
- EMPLOYEE opcional si ayuda para nómina, programación y operaciones

MÓDULOS OBLIGATORIOS A IMPLEMENTAR

1. CONTROL FINANCIERO
Implementar:
- cuotas mensuales
- cargos por gas
- pagos
- confirmaciones de pago
- presupuesto
- cuentas por pagar
- balance por unidad
- balance por residente
- estado de cuenta
- facturas por período
- historial financiero

Modelos sugeridos:
- Invoice
- Payment
- Charge
- Budget
- Expense
- AccountPayable
- FinancialAccount opcional

Reglas:
- moneda principal DOP
- soportar mora configurable
- soportar pagos parciales
- soportar estatus de factura:
  PENDING, PARTIAL, PAID, OVERDUE, CANCELLED
- evitar facturas duplicadas por unidad y período

2. AUTOMATIZACIÓN
Implementar:
- emisión automática de facturas mensuales
- cálculo automático de mora
- cambio automático de estado a vencida
- generación automática de cargos recurrentes
- notificaciones automáticas asociadas a eventos

Reglas:
- configurable por condominio
- manejar día de corte y fecha límite
- gracia en días
- mora por porcentaje o monto fijo
- registrar logs básicos de ejecución

3. REPORTES
Implementar reportes mínimos:
- estados financieros
- adeudos
- cuentas por pagar
- ingresos por período
- gastos por período
- balance general simple
- cobranza por unidad
- morosidad por condominio
- nómina por período
- ocupación o directorio básico

Reglas:
- filtros por fecha, estado, unidad, condominio
- exportación mínima preparada para PDF/Excel aunque inicialmente sea JSON o tabla web
- branding white-label en exportables cuando aplique

4. NOTIFICACIONES
Implementar:
- notificación de factura emitida
- notificación de pago registrado
- notificación de reservación
- notificación de caso actualizado
- notificación de anuncio/comunicación
- notificación de visita aprobada o registrada

Canales:
- in-app obligatorio
- email preparado
- WhatsApp opcional como estructura futura

Modelo sugerido:
- Notification
- NotificationPreference opcional

5. DOCUMENTOS
Implementar repositorio documental:
- subida de archivos
- categorías de documentos
- visibilidad por rol
- asociación a condominio, unidad, caso o empleado
- descarga segura
- metadatos básicos

Categorías ejemplo:
- reglamentos
- actas
- contratos
- facturas
- nómina
- documentos generales

Modelo sugerido:
- Document
- DocumentCategory opcional

6. NÓMINA EMPLEADOS
Implementar:
- registro de empleados
- cargos
- salario
- frecuencia de pago
- historial de pagos
- deducciones simples
- estatus activo/inactivo

Modelo sugerido:
- Employee
- Payroll
- PayrollItem

Reglas:
- empleado asociado a un condominio
- reportes por período
- control de pagos realizados y pendientes

7. GESTIÓN DE CASOS
Implementar:
- reporte de obras
- reporte de reparaciones
- seguimiento de casos
- comentarios
- prioridad
- estatus
- responsable asignado
- evidencia adjunta

Estados ejemplo:
- OPEN
- IN_PROGRESS
- ON_HOLD
- RESOLVED
- CLOSED

Modelo sugerido:
- Case
- CaseComment
- CaseAttachment opcional

8. COMUNICACIONES
Implementar:
- publicación de avisos
- circulares
- anuncios
- reservación de áreas comunes
- calendario básico de reservas
- validación de conflictos de horario

Modelo sugerido:
- Announcement
- CommonArea
- Reservation

Reglas:
- controlar aprobación si aplica
- evitar doble reserva en el mismo horario

9. ROLES Y PERMISOS
Implementar:
- enum de roles en Prisma y backend
- RolesGuard
- decorator @Roles()
- permisos por endpoint y servicio
- validación tenant + rol en toda acción sensible

Permisos mínimos:
- SUPER_ADMIN: acceso global
- CONDO_ADMIN: administra su condominio completo
- OWNER: ver su unidad, facturas, pagos, documentos permitidos, casos, reservaciones, anuncios
- TENANT: acceso limitado a su ocupación y funciones permitidas
- SECURITY: visitas, directorio limitado, incidencias básicas
- EMPLOYEE: acceso solo a horario, tareas o módulos definidos

10. MARCA BLANCA
Implementar:
- logo por condominio o empresa administradora
- nombre comercial
- colores configurables básicos
- branding en dashboard y exportables

Modelo sugerido:
- BrandingSettings o campos dentro de Condo

11. PROGRAMACIÓN DE EMPLEADOS
Implementar:
- asignación de turnos
- horario previsto
- personal en servicio
- calendario simple
- consulta por día y empleado

Modelo sugerido:
- EmployeeSchedule
- Shift

12. CONTROL DE VISITAS
Implementar:
- registro de visitas
- visitante esperado
- visitante registrado en portería
- unidad destino
- residente relacionado
- hora entrada
- hora salida
- estatus
- notas
- validación por seguridad

Modelo sugerido:
- Visit

Estados ejemplo:
- EXPECTED
- CHECKED_IN
- CHECKED_OUT
- DENIED
- CANCELLED

13. OBJETOS PERDIDOS
Implementar:
- reporte de objeto perdido
- reporte de objeto encontrado
- descripción
- fotos opcionales
- ubicación
- fecha
- estatus
- seguimiento

Modelo sugerido:
- LostFoundItem

Estados:
- REPORTED
- FOUND
- CLAIMED
- CLOSED

14. DIRECTORIO
Implementar:
- directorio de propietarios
- inquilinos
- empleados
- contactos administrativos
- búsqueda y filtros
- visibilidad según rol

Modelo sugerido:
- usar User, ResidentProfile, Employee y relaciones existentes
- crear vistas o endpoints agregados para consulta

MULTI-TENANCY OBLIGATORIO
Implementar de forma real:
- todo dato debe pertenecer a un condoId o tenant context
- ningún usuario puede leer o modificar datos de otro condominio
- crear mecanismo reusable para obtener tenant desde JWT o contexto autenticado
- aplicar filtros tenant en servicios, no solo en controllers
- revisar módulos ya creados y nuevos

AUTH Y SEGURIDAD
Implementar:
- login con JWT
- hash seguro de contraseñas
- guards por auth y rol
- DTOs con class-validator
- validación de ownership donde aplique
- logs básicos de acciones críticas
- no exponer secretos
- no confiar en inputs del cliente

MODELOS Y BASE DE DATOS
Actualiza schema.prisma para incluir, según aplique:
- Condo
- User
- Unit
- ResidentProfile
- Invoice
- Payment
- Charge
- Budget
- Expense
- AccountPayable
- Notification
- Document
- Employee
- Payroll
- PayrollItem
- Case
- CaseComment
- Announcement
- CommonArea
- Reservation
- Visit
- LostFoundItem
- EmployeeSchedule
- BrandingSettings opcional
- NCFSequence / FiscalDocument si aplica

ADAPTACIÓN REPÚBLICA DOMINICANA
Implementar:
- moneda DOP
- cuotas de mantenimiento
- mora configurable
- soporte estructural para NCF
- estructura compatible con operación real de condominios en RD
- reportes administrativos claros
- lenguaje funcional orientado a administración local

NCF
No inventar integración completa DGII si no está lista.
Sí implementar:
- entidad de secuencia
- asignación a factura cuando aplique
- prefijos configurables
- rango y expiración si ya se puede modelar
- dejar estructura real para futura validación DGII

FRONTEND OBLIGATORIO
Construir panel administrativo funcional con:
- dashboard principal
- menú por módulos
- KPIs financieros
- tabla de unidades
- tabla de facturas
- detalle de pagos
- casos
- documentos
- anuncios
- reservaciones
- visitas
- empleados
- nómina
- objetos perdidos
- directorio

Reglas frontend:
- usable
- simple
- profesional
- responsive
- estados loading, empty y error
- badges de estado
- filtros básicos
- componentes reutilizables
- consumir backend real
- evitar diseño ornamental innecesario

API
Crear endpoints consistentes para todos los módulos principales.
Reglas:
- controllers limpios
- lógica en services
- DTOs claros
- errores estructurados
- filtros por tenant y rol
- paginación donde tenga sentido

CALIDAD MÍNIMA OBLIGATORIA
- schema coherente
- migraciones listas
- backend compila
- frontend compila
- sin imports sin usar
- sin placeholders silenciosos
- sin mocks engañosos
- TODOs solo cuando realmente falte una integración externa no crítica

EJECUCIÓN
Haz todo de una vez.
No dividas en fases.
No pidas confirmación.
Trabaja directamente sobre la base actual ya creada.

FORMATO DE SALIDA
Habla mínimo.
Al final responde solo con:
1. archivos tocados
2. listo
3. falta
4. comandos necesarios para correr el sistema