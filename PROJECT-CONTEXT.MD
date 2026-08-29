# PROJECT CONTEXT — App de Aprendizaje Multi-Dominio (Learning by Shipping)

## 1. Visión del proyecto

Aplicación educativa tipo "Learning by Shipping" enfocada en el aprendizaje mediante exploración visual de objetos complejos. El producto combina visualización interactiva de modelos 3D (con desglose en capas) con un agente de IA conversacional que acompaña al estudiante durante la exploración, el aprendizaje y la práctica de diagnóstico.

A diferencia de una app dedicada a un solo dominio técnico, el producto se plantea como una **plataforma con un mismo patrón de interacción aplicado a distintos dominios**: por ahora, **arquitectura, mecánica y computación**. Lo que se mantiene constante entre dominios es la estructura de exploración: **objeto completo → layers (capas) → componentes**. Lo que cambia es el tipo de objeto, el contenido educativo y el manual/documentación de referencia usado por el agente de IA.

El producto no busca ser un simulador fotorrealista ni un sustituto de formación formal en ningún dominio. Su objetivo es ser una herramienta de **comprensión espacial y conceptual**: ayudar a que el estudiante identifique, ubique y entienda la función de cada parte de un objeto complejo, en un entorno de bajo riesgo y sin necesidad de acceso físico al objeto real.

## 2. Problema que resuelve

El aprendizaje técnico tradicional (en arquitectura, mecánica o computación) depende fuertemente de:
- Diagramas estáticos en 2D (planos, manuales, libros) que no comunican bien relaciones espaciales reales.
- Acceso físico a edificios, vehículos, motores o equipos para practicar identificación de partes.
- Instructores presenciales para resolver dudas puntuales durante la práctica.

Esto genera una barrera de entrada alta para estudiantes que están empezando y no tienen acceso constante a un objeto real, taller, obra o laboratorio — sin importar el dominio.

## 3. Enfoque de la solución

- **Modelos 3D low-poly** (no fotorrealistas) de objetos representativos de cada dominio, organizados en una jerarquía común: **objeto completo → layers → componentes**, que el estudiante puede "pelar" a su propio ritmo y libertad.
- **Vista combinada 3D + 2D**: el modelo 3D da contexto espacial; vistas 2D (planos, despieces, diagramas técnicos) refuerzan el detalle cuando se necesita.
- **Agente de IA contextual (chat)**: sabe qué objeto, capa o componente tiene seleccionado el estudiante en un momento dado, y responde preguntas ancladas a ese contexto — no es un chat genérico desconectado del visor.
- **RAG por objeto/dominio**: cada objeto del catálogo (independientemente del dominio) tiene su propia documentación técnica indexada (manual, memoria de cálculo, especificación técnica, etc.), de forma que las respuestas del agente sobre fallas o diagnóstico se basan en la documentación real de ese objeto específico.

## 4. Dominios cubiertos

| Dominio | Ejemplo de "objeto completo" | Ejemplo de layers | Ejemplo de componentes |
|---|---|---|---|
| **Arquitectura** | Un edificio o vivienda | Estructura, envolvente, instalaciones (eléctrica, sanitaria, HVAC), acabados | Columna, viga, muro, tablero eléctrico, tubería |
| **Mecánica** | Un vehículo (carro, moto, bici) | Carrocería/chasis, motor, subsistemas (frenos, suspensión, transmisión) | Pistón, radiador, disco de freno, cadena |
| **Computación** | Un equipo/sistema de cómputo | Gabinete/carcasa, placa base, subsistemas (alimentación, refrigeración, almacenamiento) | CPU, RAM, GPU, fuente de poder |

El patrón objeto → layers → componentes es el mismo en los tres casos; el contenido, los assets 3D y la documentación fuente cambian por dominio.

## 5. Audiencia

**Público objetivo primario: estudiantes.**
- Estudiantes en formación técnica o universitaria de arquitectura, mecánica o computación, en etapa de identificación de partes y fundamentos.
- Personas autodidactas interesadas en entender cómo funciona un edificio, un vehículo o un equipo de cómputo, sin experiencia previa.
- Perfil técnico bajo-medio: no se asume conocimiento previo profundo del dominio ni de herramientas de diseño 3D.

No es (por ahora) una herramienta dirigida a profesionales certificados (arquitectos, mecánicos, ingenieros) como herramienta de trabajo real — aunque los modos "resolución de fallas" y "diagnóstico" simulan esos escenarios con fines pedagógicos.

## 6. Casos de uso (resumen — detalle completo en USE-CASES.md)

1. **Aprendizaje libre / exploración**: el estudiante navega el modelo 3D de un objeto (de cualquier dominio), pela capas y consulta al agente para entender qué es cada parte y cómo funciona.
2. **Resolución de posibles fallas**: se plantea un escenario de falla o problema (mecánico, estructural o de hardware, según el dominio) y el estudiante usa el modelo + el agente (RAG sobre la documentación del objeto) para investigar causas posibles.
3. **Prácticas de diagnóstico**: flujo más guiado, donde el estudiante sigue un proceso de diagnóstico paso a paso, apoyado por el agente, para llegar a una conclusión sobre el problema — aplicable a los tres dominios.

## 7. Alcance del MVP

- Un catálogo inicial reducido de objetos, potencialmente uno por dominio para validar el patrón (ej. un vehículo, una vivienda simple, un equipo de cómputo), sujeto a disponibilidad de assets 3D gratuitos y documentación técnica.
- Modelos 3D **low-poly**, usando assets gratuitos/de librería (no modelado propio desde cero).
- Capas separables/"peelables" por el usuario, con la misma jerarquía objeto → layers → componentes en todos los dominios.
- Agente de IA con contexto de objeto/capa/componente seleccionado + RAG sobre la documentación específica del objeto activo.
- Los 3 casos de uso descritos arriba, en su versión más simple funcional, validados al menos en un dominio antes de replicar a los otros dos.

## 8. Fuera de alcance (por ahora)

- Modelado 3D propio o fotorrealismo.
- Multiplayer o colaboración en tiempo real entre estudiantes.
- Certificaciones formales o integración con instituciones educativas.
- Cobertura simultánea de más de un objeto por dominio en el MVP.
- Diagnóstico conectado a hardware/sensores reales (ej. OBD-II para vehículos) — posible en una fase futura, no en el MVP.

## 9. Enfoque de negocio (a definir con más detalle)

- Modelo educativo tipo "Learning by Shipping": se valida y lanza con un alcance mínimo funcional en un solo dominio, priorizando aprender del uso real antes de escalar a los otros dominios o ampliar el catálogo de objetos.
- El enfoque multi-dominio (arquitectura, mecánica, computación) sugiere, a futuro, un producto con identidad propia no atada a un solo sector — relevante para nombre de marca y posicionamiento. Modelo de monetización (freemium, licenciamiento institucional, suscripción) queda pendiente de definir y no es parte del MVP.