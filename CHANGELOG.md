# Cambios

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [SemVer](https://semver.org/lang/es/).

## [1.0.0] - 2026-11-10

Primera versión pública.

### Añadido

- Agente `higgsfield-studio`, que parte un encargo en pasos y encadena las skills.
- 17 skills: `estudio`, `imagen`, `video`, `animar`, `audio`, `producto`, `anuncios`, `ugc`, `personajes`, `presets`, `editar`, `tres-d`, `web-y-juegos`, `publicar`, `analizar`, `cuenta` y `direccion-de-arte`.
- `docs/herramientas.md`: mapa de las 150 herramientas del MCP de Higgsfield por área.
- `scripts/validar.mjs`: comprueba manifiestos, frontmatter y que toda herramienta citada exista.
- Hero del README en SVG con CSS y home en `docs/`.

### Respecto a `higgsfield-estudio` 5.x

- Sin hooks: ya nada bloquea las llamadas de generación ni la consulta de precio.
- Sin segundo "sí": pedir la generación es la autorización; el costo se informa.
- Sin dependencia de `marketing-base` ni de `marca.json`.
- Nombres de herramientas y modelos al día, leídos del MCP en vivo.
- Cubre las áreas que faltaban: audio, 3D, Ads Studio, AI Influencer, presets, webs, TikTok, análisis y cuenta.
