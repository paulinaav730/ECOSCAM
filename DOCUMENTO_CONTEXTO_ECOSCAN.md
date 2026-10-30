# Documento Maestro de Contexto — EcoScan Colombia

**Identidad del Proyecto**
- **Nombre del producto:** EcoScan *(repositorio: `ECOSCAM`)*
- **Eslogan:** *«Escanea hoy, transforma el mañana»*
- **Definición:** Asistente inteligente web para la identificación, preparación, clasificación normativa, economía circular y gestión posconsumo de residuos en Colombia.

---

## 1. ¿Qué es EcoScan y qué problema resuelve?

En Colombia, uno de los mayores obstáculos para el aprovechamiento real de los residuos sólidos no es únicamente la falta de contenedores, sino la **incertidumbre ciudadana en el momento de descartar un objeto**:
1. **Confusión más allá de los colores:** Muchas personas conocen que existen bolsas o canecas blancas, verdes y negras, pero desconocen qué hacer cuando un material está engrasado (como una caja de pizza), cuando es un empaque compuesto (como un Tetra Pak o un blíster de medicamentos) o cuando se trata de un residuo peligroso o especial (como una pila, un bombillo ahorrador o aceite de cocina usado).
2. **Contaminación cruzada en la fuente:** Cuando un ciudadano deposita de buena fe un residuo húmedo, engrasado o químico dentro de la bolsa blanca (*«reciclaje aspiracional»*), contamina lotes enteros de papel, cartón y plástico, dificultando la labor de los recicladores de oficio y reduciendo la tasa efectiva de reciclaje.
3. **Desconocimiento de las rutas posconsumo:** Residuos como medicamentos vencidos, baterías, luminarias o aparatos electrónicos dañados terminan con frecuencia en el camión de basura ordinaria o en el alcantarillado por falta de orientación clara sobre los programas posconsumo oficiales.

**EcoScan** nace para resolver este vacío: no es un simple diccionario de canecas de colores, sino un **sistema de soporte a la decisión ambiental** que acompaña a la persona desde antes de desechar el objeto (prevención, reparación y reutilización segura) hasta su preparación física paso a paso y su entrega en la ruta correcta.

---

## 2. Enfoque de Biomimética: Analogía Funcional Inspirada en las Hormigas

EcoScan incorpora un fundamento de diseño basado en **biomimética**, tomando como referencia la organización descentralizada de las colonias de hormigas.

> **Rigor conceptual:** EcoScan no afirma que las hormigas reciclen basura industrial humana. La relación se plantea estrictamente como una **analogía funcional de diseño de sistemas**.

En una colonia de hormigas no existe un director central que vigile cada partícula; sin embargo, la colonia mantiene su espacio limpio, clasifica recursos útiles y aísla elementos patógenos con altísima eficiencia. Esto ocurre porque cada individuo aplica **reglas locales sencillas** basadas en señales químicas y físicas inmediatas del objeto.

EcoScan traduce ese principio biológico a un flujo algorítmico de cuatro reglas locales en el hogar o la universidad:
1. **Filtro de riesgo posconsumo:** Si el objeto es peligroso o especial (pila, medicamento, bombilla, electrónico, aceite usado), se aísla inmediatamente fuera de las canecas domésticas hacia una ruta posconsumo.
2. **Prioridad de prevención circular:** Antes de descartar, evalúa si el objeto puede repararse, donarse, compostarse o reutilizarse de forma higiénica y segura.
3. **Evaluación de estado físico:** Verifica si el material está limpio y seco o si presenta contaminación por grasa, comida o químicos.
4. **Asignación de ruta verificada:** Contrasta la decisión final con la Resolución 2184 de 2019 y el municipio del usuario (comenzando por Medellín y el Valle de Aburrá).

---

## 3. Marco Normativo Colombiano y Motor de Reglas

### 3.1. Resolución 2184 de 2019 (Ministerio de Ambiente y Desarrollo Sostenible)
- **BLANCO (Residuos Aprovechables):** Plástico, vidrio de envase, metales (aluminio y hojalata), papel, cartón y envases multicapa (Tetra Pak), siempre que se entreguen **limpios, vacíos y secos**.
- **VERDE (Residuos Orgánicos Aprovechables):** Restos de frutas y verduras crudos, cáscaras de huevo trituradas, borra de café y restos de jardinería.
- **NEGRO (Residuos No Aprovechables):** Servilletas usadas, papel higiénico, papeles y cartones contaminados con comida o grasa.

### 3.2. Gestión Diferenciada y Programas Posconsumo (ANLA / MinAmbiente)
- **Pilas y acumuladores domésticos:** Corporación Pilas con el Ambiente (Resolución 1297 de 2010 / Res. 851 de 2022).
- **Medicamentos vencidos humanos o veterinarios:** Corporación Punto Azul (Resolución 0371 de 2009).
- **Computadores, celulares, cargadores y periféricos (RAEE):** Corporación EcoCómputo (Ley 1672 de 2013 / Res. 1512 de 2010).
- **Bombillas ahorradoras, tubos fluorescentes y LED:** Corporación Lúmina (Resolución 1511 de 2010).
- **Aceite de Cocina Usado (ACU):** Gestores autorizados ACU (Resolución 0316 de 2018).
- **Envases domésticos de plaguicidas e insecticidas:** Corporación Cierra el Ciclo (Resolución 1675 de 2013).
- **Llantas usadas:** Corporación Rueda Verde (Resolución 1326 de 2017).

---

## 4. Arquitectura Tecnológica

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS (identidad visual Azul Noche `#0E1227`), Lucide React.
- **Backend y Reglas:** Route Handlers de Next.js (`/api/scanner`, `/api/classify`, `/api/catalog`, `/api/feedback`, `/api/admin`), validación con Zod y motor determinístico de reglas (`services/classification-engine.ts`).
- **Base de Datos y Autenticación:** PostgreSQL en Supabase (12 tablas normalizadas con Row Level Security - RLS, Supabase Auth y datos semilla verificados).
- **Inteligencia Artificial:** Google Gemini (`gemini-3.8-flash`) mediante `@google/genai` en el servidor para reconocimiento visual estructurado, contrastado siempre contra las reglas normativas almacenadas.
