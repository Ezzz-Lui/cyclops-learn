# USE CASES — App de Aprendizaje Multi-Dominio (Arquitectura / Mecánica / Computación)

Todos los casos de uso comparten el mismo entorno base: un visor 3D con la jerarquía **objeto completo → layers → componentes**, y un agente de IA en chat con contexto de la pieza/capa/componente activo. Lo que cambia entre casos de uso es el **objetivo pedagógico** y el **modo de conversación** del agente; lo que cambia entre dominios es el **tipo de objeto y su documentación de referencia**, no la estructura del caso de uso.

Cada caso de uso a continuación se describe de forma genérica y luego se ilustra con un ejemplo por dominio.

---

## UC-1: Aprendizaje libre / Exploración

**Objetivo:** que el estudiante identifique y comprenda las partes de un objeto a su propio ritmo, sin un objetivo de resolución específico.

**Actor:** Estudiante (cualquier nivel), en cualquiera de los tres dominios.

**Flujo principal:**
1. El estudiante selecciona un dominio (arquitectura, mecánica o computación) y un objeto del catálogo dentro de ese dominio.
2. Se carga el modelo 3D en su capa más externa (ej. fachada de un edificio, carrocería de un vehículo, gabinete de un equipo de cómputo).
3. El estudiante "pela" capas a su propia libertad (envolvente → estructura → instalaciones; carrocería → chasis → motor; gabinete → placa base → componentes).
4. Al seleccionar una capa o componente específico, la interfaz muestra su nombre y una descripción breve.
5. El estudiante puede abrir el chat y preguntar libremente sobre la pieza seleccionada ("¿qué hace esta pieza?", "¿por qué está conectada a esto otro?").
6. El agente responde usando el contexto de la pieza/capa activa y el dominio correspondiente, en modo informativo/educativo.

**Ejemplos por dominio:**
- **Arquitectura**: el estudiante pela la envolvente de una vivienda y descubre la instalación eléctrica embebida en el muro; pregunta al agente por qué el tablero eléctrico está ubicado en esa posición.
- **Mecánica**: el estudiante pela el capó de un vehículo y llega al motor; pregunta al agente qué función cumple el radiador.
- **Computación**: el estudiante abre el gabinete de un equipo y llega a la placa base; pregunta al agente por qué la GPU necesita un slot PCIe específico.

**Flujo alterno:**
- El estudiante cambia de capa o componente mientras conversa con el agente → el contexto del chat se actualiza y las siguientes respuestas reflejan la nueva selección.
- El estudiante cambia de objeto o de dominio → se reinicia el contexto 3D; el historial de chat puede mantenerse o segmentarse por objeto/dominio (a definir en diseño de producto).

**Criterio de éxito:** el estudiante puede navegar libremente el modelo y obtener explicaciones correctas y contextualizadas de cualquier pieza que seleccione, sin importar el dominio.

---

## UC-2: Resolución de posibles fallas

**Objetivo:** que el estudiante practique razonamiento diagnóstico frente a un síntoma o problema planteado, usando el modelo 3D y el agente como apoyo (no como solucionador automático).

**Actor:** Estudiante, en cualquiera de los tres dominios.

**Flujo principal:**
1. El estudiante selecciona un objeto y elige el modo "Resolución de fallas".
2. La app plantea un escenario/síntoma relevante al dominio del objeto.
3. El estudiante explora el modelo 3D, pelando capas relevantes al síntoma, para identificar posibles zonas involucradas.
4. El estudiante consulta al agente sobre posibles causas del síntoma, apoyado en el componente que tiene seleccionado en ese momento.
5. El agente responde en modo "guía de razonamiento": ayuda a acotar posibilidades y remite a información de la documentación del objeto (vía RAG), sin simplemente dar la respuesta final de inmediato.
6. El estudiante llega a una o varias hipótesis sobre la causa del problema.

**Ejemplos por dominio:**
- **Arquitectura**: escenario "aparece una filtración de humedad en el techo"; el estudiante explora la capa de impermeabilización/cubierta y consulta al agente sobre posibles puntos de falla.
- **Mecánica**: escenario "el motor no enciende"; el estudiante explora el sistema eléctrico/de encendido y consulta al agente sobre causas posibles.
- **Computación**: escenario "el equipo no enciende / se reinicia solo"; el estudiante explora la fuente de poder y las conexiones de la placa base, y consulta al agente sobre posibles causas.

**Flujo alterno:**
- El estudiante pide directamente "la respuesta" → el agente puede ofrecer una pista adicional o, si el estudiante insiste, revelar la causa esperada del escenario, marcando el intento como completado con asistencia.
- El escenario no tiene relación con la pieza actualmente seleccionada → el agente puede sugerir hacia qué zona del modelo conviene mirar.

**Criterio de éxito:** el estudiante logra identificar (con o sin asistencia del agente) la zona/componente relacionado con la falla planteada, y entiende el razonamiento detrás, sin importar el dominio.

---

## UC-3: Prácticas de diagnóstico guiado

**Objetivo:** simular un proceso de diagnóstico más estructurado, similar al que seguiría un profesional del dominio correspondiente (arquitecto, mecánico, técnico en computación), con pasos secuenciales apoyados por el agente.

**Actor:** Estudiante (nivel intermedio, ya familiarizado con UC-1 y UC-2), en cualquiera de los tres dominios.

**Flujo principal:**
1. El estudiante selecciona un objeto y elige el modo "Diagnóstico guiado".
2. La app presenta un caso de diagnóstico con un punto de partida (ej. reporte de un síntoma o problema reportado por un "cliente" ficticio).
3. El agente guía al estudiante paso a paso: qué revisar primero, qué capa/componente inspeccionar, qué preguntas hacerse.
4. En cada paso, el estudiante interactúa con el modelo 3D (selecciona la capa/componente indicado) y puede pedirle al agente más detalle sobre ese paso específico, apoyado en la documentación del objeto (RAG).
5. El estudiante avanza por los pasos hasta llegar a una conclusión diagnóstica.
6. Al finalizar, se muestra un resumen del proceso seguido (pasos completados, componentes revisados).

**Ejemplos por dominio:**
- **Arquitectura**: diagnóstico de una fisura estructural — el agente guía al estudiante a revisar primero la cimentación, luego elementos estructurales cercanos a la fisura.
- **Mecánica**: diagnóstico de una vibración anormal — el agente guía al estudiante a revisar primero suspensión, luego balanceo de ruedas y transmisión.
- **Computación**: diagnóstico de bajo rendimiento — el agente guía al estudiante a revisar primero temperaturas/refrigeración, luego uso de RAM y almacenamiento.

**Flujo alterno:**
- El estudiante se salta pasos o explora fuera de la secuencia sugerida → el agente puede reencauzar sugiriendo volver al flujo, sin bloquear la exploración libre.
- El estudiante no logra avanzar → el agente ofrece pistas progresivas antes de revelar el siguiente paso directamente.

**Criterio de éxito:** el estudiante completa el proceso de diagnóstico guiado y puede explicar, al final, la secuencia de razonamiento que siguió, sin importar el dominio.

---

## Notas transversales a los 3 casos de uso y los 3 dominios

- El **contexto activo** (dominio, objeto, layer, componente, caso de uso) siempre debe viajar junto a cada mensaje enviado al agente, para que las respuestas sean relevantes y no genéricas.
- El **RAG** debe estar acotado a la documentación del objeto actualmente seleccionado; no debe mezclar información de otros objetos ni de otros dominios.
- La estructura **objeto → layers → componentes** y los tres casos de uso (aprendizaje, resolución de fallas, diagnóstico) son **idénticos en su lógica** entre arquitectura, mecánica y computación — lo único que cambia es el contenido: los modelos 3D, la documentación fuente del RAG, y el vocabulario/escenarios específicos de cada dominio.
- Para el MVP, se recomienda validar el patrón completo (los 3 casos de uso) en un solo dominio antes de replicarlo a los otros dos, para confirmar que la estructura genérica funciona bien en la práctica antes de escalar contenido.