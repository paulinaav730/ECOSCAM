# EcoScan Colombia 🌱
> **Escanea hoy, transforma el mañana.**  
> Asistente inteligente para la identificación, preparación, clasificación normativa (Resolución 2184 de 2019), economía circular y gestión posconsumo de residuos en Colombia.

---

## 1. Propósito y Arquitectura

**EcoScan** ayuda a las personas en Colombia (comenzando por Medellín y el Valle de Aburrá, y preparado para todo el país) a tomar decisiones informadas sobre sus residuos:
- **Más allá de tres colores**: Aplica la **Resolución 2184 de 2019** (Blanco: Aprovechables; Verde: Orgánicos aprovechables; Negro: No aprovechables) e integra una cuarta ruta prioritaria para **Programas Posconsumo y Gestión Diferenciada** (Pilas con el Ambiente, Punto Azul, EcoCómputo, Lúmina, Cierra el Ciclo, Rueda Verde y gestores de Aceite de Cocina Usado - ACU).
- **Motor determinístico de reglas ambientales**: La inteligencia artificial visual (`gemini-3.8-flash` mediante `@google/genai` Interactions API) identifica características observables del objeto, pero **nunca inventa la normativa**. La ruta final siempre se contrasta con las reglas almacenadas y verificadas.
- **Enfoque biomimético**: Inspirado como analogía funcional en la organización descentralizada de las colonias de hormigas (reglas locales sencillas en origen que evalúan estado, limpieza y riesgo para evitar contaminación cruzada en el sistema colectivo).
- **Transparencia ambiental**:
  - Si falta `GEMINI_API_KEY`, el sistema informa claramente que el reconocimiento visual no está configurado y mantiene 100% operativos el clasificador por reglas y el catálogo.
  - Distingue tres estados en *Mi Impacto*: **1. Residuo consultado**, **2. Acción declarada por el usuario** y **3. Entrega verificada por entidad**. Nunca presenta una consulta como si fueran kilogramos reciclados.
  - No muestra ubicaciones ni coordenadas ficticias en el mapa de recolección.

---

## 2. Tecnologías Utilizadas

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS (`#0E1227` Azul Noche), Lucide React, diálogos nativos accesibles `<dialog closedby="any">`.
- **Backend**: Next.js Route Handlers (`/api/scanner`, `/api/classify`, `/api/catalog`, `/api/feedback`, `/api/admin`), validación con Zod en cliente y servidor, control de tasa (rate limiting) y verificación de roles en servidor.
- **Base de Datos y Autenticación**: PostgreSQL en **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`), Supabase Auth y políticas Row Level Security (RLS).
- **Inteligencia Artificial**: SDK oficial `@google/genai` con el modelo `gemini-3.8-flash` (`client.interactions.create` con salida estructurada JSON).
- **Pruebas**: Vitest (`npm test`).

---

## 3. Estructura del Proyecto

```text
├── app/
│   ├── api/
│   │   ├── admin/route.ts         # Endpoint protegido (verifica rol 'admin' en servidor/BD)
│   │   ├── catalog/route.ts       # Búsqueda y filtrado del catálogo
│   │   ├── classify/route.ts      # Evaluación determinística del motor de reglas
│   │   ├── feedback/route.ts      # Registro validado de reportes y sugerencias
│   │   └── scanner/route.ts       # Análisis con Gemini Vision + contraste con reglas
│   ├── admin/page.tsx             # Panel de administración y gobernanza
│   ├── aprende/page.tsx           # Módulo educativo Aprende y Descubre
│   ├── economia-circular/page.tsx # Módulo de prevención y reutilización segura
│   ├── escaner/page.tsx           # Escáner inteligente + Clasificador asistido por texto
│   ├── explorador/
│   │   ├── [slug]/page.tsx        # Ficha técnica interactiva con simulador de estado
│   │   └── page.tsx               # Buscador por sinónimos y filtros multicriterio
│   ├── guia/page.tsx              # Guía Resolución 2184 de 2019, Posconsumo y Reglas
│   ├── historial/page.tsx         # Historial de consultas y acciones
│   ├── mi-impacto/page.tsx        # Panel de 3 estados de trazabilidad, retos y EcoPuntos
│   ├── perfil/page.tsx            # Registro, login, recuperación y privacidad (Supabase Auth)
│   ├── puntos/page.tsx            # Directorio y visor de puntos de recolección
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Página de inicio
├── components/
│   ├── layout/navigation-shell.tsx
│   ├── providers/ecoscan-provider.tsx
│   ├── ui/modal-dialog.tsx
│   └── waste/classification-result-card.tsx
├── lib/
│   ├── data/verified-environmental-data.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── validations/schemas.ts
├── services/
│   ├── ai-vision-service.ts
│   ├── classification-engine.ts
│   ├── collection-points-service.ts
│   └── waste-catalog-service.ts
├── supabase/
│   ├── migrations/20261022000001_initial_ecoscan_schema.sql
│   └── seed.sql
└── tests/
    └── ecoscan.test.ts
```

---

## 4. Instalación y Ejecución Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Completa los valores en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública `anon` de Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: (Opcional) Clave privada de servidor. Nunca uses el prefijo `NEXT_PUBLIC_`.
   - `GEMINI_API_KEY`: Clave privada de Google AI Studio para el modelo `gemini-3.8-flash`.

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre `http://localhost:3000` en tu navegador.

4. **Ejecutar pruebas, verificación de tipos y compilación**:
   ```bash
   npm test
   npm run typecheck
   npm run build
   ```

---

## 5. Configuración de Supabase y Migraciones SQL

1. Crea un proyecto nuevo en [Supabase](https://supabase.com/).
2. En el panel de Supabase, abre **SQL Editor** y ejecuta en orden:
   - `supabase/migrations/20261022000001_initial_ecoscan_schema.sql` (crea las 12 tablas normalizadas, índices, triggers y políticas RLS).
   - `supabase/seed.sql` (inserta las fuentes oficiales verificadas, reglas determinísticas, retos, canales de recolección y las 17+ fichas iniciales de residuos).
3. Para asignar el rol de administrador a un usuario registrado, ejecuta en el **SQL Editor** de Supabase:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = 'UUID_DEL_USUARIO_EN_AUTH_USERS';
   ```

---

## 6. Despliegue en GitHub y Vercel

1. **Subir el repositorio a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: implementación completa de EcoScan Colombia"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/ecoscan-colombia.git
   git push -u origin main
   ```
   *(El archivo `.gitignore` protege automáticamente `.env.local` para que nunca se suban secretos).*

2. **Conectar con Vercel**:
   - Ingresa a [Vercel](https://vercel.com/) y selecciona **Add New Project**.
   - Importa tu repositorio de GitHub `ecoscan-colombia`.
   - En la sección **Environment Variables**, registra:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GEMINI_API_KEY`
     - `NEXT_PUBLIC_DEFAULT_MUNICIPALITY=Medellín`
   - Haz clic en **Deploy**. Cada `git push` a la rama `main` desplegará automáticamente la versión de producción, y cada Pull Request generará una URL de vista previa (Preview Deployment).
