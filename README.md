# CondoRD - Sistema de Gestión de Condominios (SaaS)

Sistema completo diseñado para la realidad de República Dominicana, optimizado para administradores, propietarios e inquilinos.

## Estructura
- `/backend`: API construida con NestJS y Prisma (PostgreSQL).
- `/frontend`: Interface premium construida con Next.js 14+, Tailwind CSS y Framer Motion.

## Características Principales
- **Multi-tenant**: Aislamiento de datos por condominio.
- **NCF**: Secuencias de Comprobantes Fiscales automáticas.
- **Facturación**: Generación mensual automática de cuotas.
- **Control de Mora**: Cálculo automático de recargos.
- **Premium UX**: Interfaz intuitiva y moderna (Dashboard, KPIs, Mobile Ready).

## Requisitos
- Node.js 18+
- Docker & Docker Compose

## Instalación Rápida
1. Levantar DB: `docker-compose up -d`
2. Backend:
   - `cd backend`
   - `npm install`
   - `cp .env.example .env` (Ajustar credenciales)
   - `npx prisma migrate dev`
   - `npm run start:dev`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Roles del Sistema
- **Super Admin**: Gestión de múltiples residenciales.
- **Admin**: Control total del condominio activo.
- **Propietario**: Consulta de facturas, pagos y comunicados.
- **Inquilino**: Tickets de soporte y pagos.
- **Seguridad**: Registro de visitas (Módulo opcional).
