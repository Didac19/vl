# 🟢 TranSix — Plataforma de Movilidad Colombiana

Sistema centralizado de transporte urbano e intermunicipal para Colombia (TransMilenio, SITP, Cooperativas y Microbuses).

## 🚀 Stack Tecnológico

- **Backend:** NestJS (Monolito Modular), PostgreSQL, Redis.
- **Frontend:** React Native Expo (Expo Router v3).
- **Monorepo:** pnpm workspaces.
- **Diseño:** Identidad Visual "TranSix" (Esmeraldas y Terracotas).

---

## 🛠️ Requisitos Desarrollador

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

---

## 🏃 Cómo empezar

### 1. Instalación de dependencias
```bash
pnpm install
```

### 2. Infraestructura (BD y Redis)
```bash
# Iniciar Postgres y Redis locales
npm run docker:up
```

### 3. Iniciar Backend (API)
```bash
# Desde la raíz del monorepo
npm run dev:api

# O accede a la documentación: http://localhost:3000/api/docs
```

### 4. Iniciar App Móvil
```bash
# Desde la raíz del monorepo
npm run dev:mobile
```

---

## 📁 Estructura del Proyecto

- `apps/api`: Microservicio NestJS con los dominios de Ticketing, Wallet y Transport.
- `apps/mobile`: Aplicación Expo con sistema de diseño personalizado.
- `packages/shared-types`: DTOs e interfaces compartidas entre frontend y backend.
- `packages/ui-tokens`: Tokens de diseño (colores, tipografía, espaciado).

---

## 🔐 Características Clave

1. **JWS Offline Ticketing:** Los pasajes QR se firman digitalmente permitiendo validación en estaciones sin conexión a internet.
2. **Modular Monolith:** Arquitectura escalable lista para convertirse en microservicios si es necesario.
3. **Identidad Local:** UI diseñada pensando en el contexto colombiano, con tipografía Plus Jakarta Sans y paleta de colores Esmeralda/Terracota.
# transix
