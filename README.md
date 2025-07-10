# Gimnasio App - Frontend

Aplicación web para la gestión de un gimnasio, desarrollada con React, TypeScript y Vite.

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Backend Spring Boot en ejecución (puerto 8080 por defecto)

## Configuración del Proyecto

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Previsualiza la versión de producción
- `npm run seed` - Ejecuta el script para poblar la base de datos con datos de ejemplo

## Población de Datos Iniciales

Para cargar datos de ejemplo en la base de datos:

1. Asegúrate de que el backend Spring Boot esté en ejecución
2. Ejecuta el siguiente comando:
   ```bash
   npx ts-node scripts/seed-db.ts
   ```

Este script creará:
- Usuarios de ejemplo (admin, entrenador, cliente)
- Membresías
- Productos

## Estructura del Proyecto

- `/src` - Código fuente de la aplicación
  - `/components` - Componentes reutilizables
  - `/pages` - Componentes de página
  - `/services` - Lógica de servicios y API
  - `/types` - Definiciones de tipos TypeScript
  - `/utils` - Utilidades varias
- `/public` - Archivos estáticos

## Tecnologías Utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- React Icons

## Licencia

MIT
