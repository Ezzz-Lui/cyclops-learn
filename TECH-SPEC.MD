# TECH SPECS — App de Aprendizaje Multi-Dominio (Arquitectura / Mecánica / Computación)

## 1. Stack obligatorio

| Capa | Tecnología | Obligatoriedad |
|---|---|---|
| Frontend framework | **Next.js** | Obligatorio |
| Estilos | **Tailwind CSS** | Obligatorio |
| Componentes UI | **shadcn/ui** | Obligatorio |
| Backend / datos en tiempo real | **Convex** | Obligatorio |

Estas cuatro piezas son fijas para el proyecto y son **agnósticas al dominio**: el mismo stack sirve para renderizar y gestionar objetos de arquitectura, mecánica o computación sin cambios estructurales. El resto de las decisiones técnicas (motor 3D, proveedor de IA, estrategia de RAG, hosting de assets) quedan abiertas y se detallan abajo con recomendaciones, no como obligación cerrada.

## 2. Frontend

### 2.1 Next.js
- Usar **App Router** (no Pages Router) para alinearse con el ecosistema actual de Next.js y con la forma en que Convex se integra en apps modernas de React.
- Client Components para todo lo relacionado al visor 3D (WebGL no corre en Server Components).
- Server Components donde tenga sentido: páginas de catálogo de objetos/dominios, landing, contenido estático de documentación.
- Estructura de rutas sugerida para reflejar el modelo multi-dominio, por ejemplo `/[dominio]/[objeto]`, de forma que arquitectura, mecánica y computación compartan las mismas plantillas de UI.

### 2.2 Tailwind + shadcn/ui
- shadcn/ui para los elementos de interfaz de control: panel de capas, selector de dominio/objeto, chat del agente, tarjetas de componente seleccionado.
- El diseño de estos componentes debe ser **agnóstico al dominio**: el mismo panel de "layers" sirve tanto para mostrar instalaciones de un edificio como subsistemas de un motor o componentes de una PC — solo cambia el contenido (nombres, iconos, descripciones), no la estructura visual.
- Tailwind como sistema de estilos base; evitar CSS-in-JS adicional para no duplicar sistemas de estilo.

### 2.3 Motor de renderizado 3D (recomendación, no obligatorio)
- **Three.js**, idealmente a través de **React Three Fiber (R3F)** + **drei**, para integrarse de forma idiomática con componentes de React/Next.js.
- Formato de modelos recomendado: **glTF/GLB** (estándar de facto para assets 3D en web, buen soporte de materiales, animaciones y jerarquía de nodos — útil para organizar capas en cualquier dominio).
- Para el sistema de "layers peelables": modelar la jerarquía **objeto → layers → componentes** como grupos/nodos dentro del glTF, sin importar el dominio, y controlar visibilidad/posición por grupo desde React (mostrar/ocultar, "explode view" moviendo nodos en el eje correspondiente).
- Fuentes de assets gratuitos a evaluar por dominio: Sketchfab (filtro de licencia CC/gratuita), Poly Haven, Quaternius (mecánica/genérico), bibliotecas de modelos arquitectónicos (ej. modelos BIM simplificados o assets genéricos de edificios) y modelos de hardware de PC de librerías 3D gratuitas. Se debe validar licencia de uso comercial/educativo antes de integrar cualquier asset, en cada dominio.

## 3. Backend

### 3.1 Convex
- Convex como backend principal: base de datos en tiempo real, funciones serverless (queries/mutations/actions) y sincronización automática con el frontend de Next.js.
- El modelo de datos se diseña para ser **agnóstico al dominio**, usando un campo `domain` (arquitectura | mecánica | computación) como dimensión transversal, en lugar de tablas separadas por dominio.
- Uso previsto:
  - Almacenar catálogo de dominios y objetos, con su jerarquía de layers/componentes y metadata asociada (nombre, descripción, función de cada parte).
  - Guardar progreso del estudiante (qué capas ha explorado, qué casos de uso ha completado, en qué dominio).
  - Orquestar llamadas al agente de IA vía **Convex Actions** (las Actions permiten llamadas a APIs externas, a diferencia de queries/mutations).
  - Guardar historial de conversación con el agente por sesión/estudiante, con referencia al dominio/objeto activo.

### 3.2 Estructura de datos sugerida (alto nivel, a refinar)
- `domains`: tabla simple con los tres dominios (arquitectura, mecánica, computación) y su metadata de presentación (nombre, icono, descripción).
- `objects`: catálogo de objetos, cada uno con referencia a su `domainId` (ej. un vehículo, una vivienda, un equipo de cómputo).
- `layers` / `components`: jerarquía de capas y piezas por objeto, con referencia al nodo correspondiente en el modelo 3D y descripción para uso educativo — misma estructura sin importar el dominio.
- `documents` (manuales/documentación técnica): documentos fuente por objeto, usados para indexar el RAG; el tipo de documento varía por dominio (manual técnico en mecánica, memoria descriptiva/planos en arquitectura, especificación técnica en computación) pero el mecanismo de indexado es el mismo.
- `chatSessions` / `chatMessages`: historial de conversación del agente, con referencia al dominio/objeto/layer/componente activo en el momento de cada mensaje.
- `useCaseProgress`: estado del estudiante en cada caso de uso (aprendizaje libre, resolución de fallas, diagnóstico), por dominio/objeto.

## 4. Agente de IA

### 4.1 Contexto situacional
- El frontend debe enviar al agente, junto con cada mensaje del usuario, el **contexto activo**: dominio, objeto seleccionado, layer activa, componente seleccionado (si aplica) y caso de uso en curso (aprendizaje / falla / diagnóstico).
- Este contexto se usa para condicionar el prompt del agente y para filtrar qué documento/manual debe consultar el RAG — el mismo mecanismo aplica a los tres dominios, cambiando solo la fuente documental.

### 4.2 RAG por objeto
- Cada objeto del catálogo (sin importar el dominio) tiene su propia documentación técnica indexada por separado.
- Recomendación: un índice vectorial por objeto (o un índice único con metadata de filtro por `objectId` y `domain`), de forma que las consultas de diagnóstico/fallas solo recuperen contenido de la documentación correspondiente al objeto activo.
- Convex soporta búsqueda vectorial nativa (vector search en Convex), lo cual permite mantener todo el RAG dentro del mismo backend sin agregar un servicio externo adicional — recomendado para simplificar el MVP y mantener consistencia entre dominios.

### 4.3 Modos de conversación
- **Modo exploración/aprendizaje**: respuestas informativas sobre función y ubicación de la pieza/componente seleccionado, adaptadas al vocabulario del dominio activo.
- **Modo resolución de fallas**: el agente ayuda a razonar sobre causas posibles de un síntoma o problema (mecánico, estructural o de hardware), apoyado en la documentación (RAG), sin dar automáticamente "la respuesta" — el objetivo es guiar el razonamiento del estudiante.
- **Modo diagnóstico guiado**: conversación más estructurada, con pasos sugeridos por el agente, apoyada también en la documentación del objeto activo — la lógica del flujo es la misma en los tres dominios, solo cambia el contenido de cada paso.

## 5. Consideraciones no funcionales

- **Rendimiento 3D**: priorizar modelos low-poly y carga progresiva (lazy loading de objetos/dominios no activos) para mantener buen rendimiento en navegador, incluyendo dispositivos de gama media.
- **Licencias de assets**: documentar la fuente y licencia de cada modelo 3D y documento técnico usado, por dominio, dado que son de terceros.
- **Escalabilidad de catálogo y dominios**: el modelo de datos (domain → object → layers → components, documentos por objeto) debe permitir agregar más objetos dentro de un dominio, o incluso un dominio nuevo en el futuro, sin rediseño mayor de la arquitectura.
- **Consistencia de UX entre dominios**: mantener el mismo patrón de interacción (objeto completo → layers → componentes) en los tres dominios es clave para que el producto se perciba como una plataforma coherente y no como tres apps distintas empaquetadas juntas.