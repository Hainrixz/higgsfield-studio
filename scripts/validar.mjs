#!/usr/bin/env node
// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-ad5e0917
// Valida el plugin: manifiestos, frontmatter de cada skill y del agente,
// y que toda herramienta de Higgsfield citada exista en scripts/herramientas.txt.
// Uso: node scripts/validar.mjs
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const errores = []
const avisos = []
const falla = (m) => errores.push(m)

const leer = (r) => readFileSync(join(raiz, r), 'utf8')
const json = (r) => {
  try { return JSON.parse(leer(r)) } catch (e) { falla(`${r}: JSON inválido (${e.message})`); return {} }
}

// 1. Manifiestos
const plugin = json('.claude-plugin/plugin.json')
const market = json('.claude-plugin/marketplace.json')
for (const campo of ['name', 'version', 'description', 'license']) {
  if (!plugin[campo]) falla(`plugin.json: falta "${campo}"`)
}
if (market.name !== plugin.name) falla('marketplace.json: "name" no coincide con plugin.json')
if (!market.plugins?.some((p) => p.name === plugin.name)) falla('marketplace.json: no lista el plugin')

// 2. Herramientas válidas
const validas = new Set(leer('scripts/herramientas.txt').split('\n').map((l) => l.trim()).filter(Boolean))

// Nombres que ya no existen en el MCP: si aparecen, es un error seguro.
const muertas = [
  'presets_show', 'marketing_studio_v2_create', 'marketing_studio_v2_costs', 'shorts_studio_create',
  'personal_clipper_create', 'tiktok_publish', 'job_status', 'reveal_generation', 'confirm_trial_cancel',
  'relight_image', 'workspace_list', 'soul_list', 'show_marketing_studio',
]

// Prefijos que solo usan las herramientas (no los modelos ni los parámetros).
const prefijos = /^(ads_studio_|ai_influencer_|scene_builder_3d_|tiktok_|video_analysis_|website_|media_|apps_|show_|register_)/

// Nombres con forma de parámetro (media_id, website_id, media_type...) no son herramientas.
const parametro = /_(id|ids|type|types|url|urls|key|seconds|name|count|language)$/

// Valores y campos del MCP que empiezan como una herramienta pero no lo son.
const noSonHerramientas = new Set(['media_input', 'show_prompts', 'show_canvas'])

function frontmatter(texto, ruta) {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) { falla(`${ruta}: sin frontmatter`); return {} }
  const fm = {}
  for (const linea of m[1].split('\n')) {
    const i = linea.indexOf(':')
    if (i > 0) fm[linea.slice(0, i).trim()] = linea.slice(i + 1).trim()
  }
  return fm
}

function archivosMd(dir) {
  const out = []
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) out.push(...archivosMd(p))
    else if (n.endsWith('.md')) out.push(p)
  }
  return out
}

function revisarHerramientas(texto, ruta) {
  for (const m of texto.matchAll(/`([a-z0-9_]+)`/g)) {
    const nombre = m[1]
    if (muertas.includes(nombre)) falla(`${ruta}: herramienta que ya no existe: ${nombre}`)
    else if (prefijos.test(nombre) && !parametro.test(nombre) && !noSonHerramientas.has(nombre) && !validas.has(nombre)) falla(`${ruta}: herramienta desconocida: ${nombre}`)
  }
  for (const m of texto.matchAll(/mcp__[A-Za-z_]*?[Hh]iggsfield[A-Za-z_]*?__([a-z0-9_]+)/g)) {
    if (!validas.has(m[1])) falla(`${ruta}: herramienta desconocida: ${m[1]}`)
  }
  if (/marketing-base|\/marketing-base:|higgsfield-estudio/.test(texto)) {
    falla(`${ruta}: menciona otro plugin (marketing-base / higgsfield-estudio)`)
  }
}

// 3. Skills
const dirSkills = join(raiz, 'skills')
const skills = readdirSync(dirSkills).filter((n) => statSync(join(dirSkills, n)).isDirectory())
for (const s of skills) {
  const ruta = `skills/${s}/SKILL.md`
  if (!existsSync(join(raiz, ruta))) { falla(`${ruta}: no existe`); continue }
  const texto = leer(ruta)
  const fm = frontmatter(texto, ruta)
  if (fm.name !== s) falla(`${ruta}: name "${fm.name}" no coincide con la carpeta`)
  if (!fm.description || fm.description.length < 80) falla(`${ruta}: description corta o ausente`)
  if (fm.description && fm.description.length > 1024) falla(`${ruta}: description supera 1024 caracteres`)
  const lineas = texto.split('\n').length
  if (lineas > 200) avisos.push(`${ruta}: ${lineas} líneas (conviene mover material a references/)`)
  for (const m of texto.matchAll(/`?references\/([A-Za-z0-9._-]+\.md)`?/g)) {
    // Puede ser un archivo del paquete de un flujo del servidor (get_workflow_bundle_file), por eso es aviso.
    if (!existsSync(join(dirSkills, s, 'references', m[1]))) avisos.push(`${ruta}: cita references/${m[1]}, que no está en la skill (¿archivo de un flujo del servidor?)`)
  }
  for (const p of archivosMd(join(dirSkills, s))) revisarHerramientas(readFileSync(p, 'utf8'), relative(raiz, p))
}

// 4. Agentes
const dirAgentes = join(raiz, 'agents')
for (const n of readdirSync(dirAgentes).filter((x) => x.endsWith('.md'))) {
  const ruta = `agents/${n}`
  const texto = leer(ruta)
  const fm = frontmatter(texto, ruta)
  if (!fm.name || !fm.description) falla(`${ruta}: falta name o description`)
  revisarHerramientas(texto, ruta)
  for (const m of texto.matchAll(/skill `([a-z-]+)`/g)) {
    if (!skills.includes(m[1])) falla(`${ruta}: nombra la skill "${m[1]}" y no existe`)
  }
}

// 5. Mapa de herramientas completo
if (existsSync(join(raiz, 'docs/herramientas.md'))) {
  const mapa = leer('docs/herramientas.md')
  for (const h of validas) if (!mapa.includes('`' + h + '`')) falla(`docs/herramientas.md: falta ${h}`)
  revisarHerramientas(mapa, 'docs/herramientas.md')
} else avisos.push('docs/herramientas.md: no existe todavía')

// 6. Sin hooks: este plugin no intercepta llamadas.
if (existsSync(join(raiz, 'hooks'))) falla('hooks/: este plugin no debe traer hooks')

for (const a of avisos) console.log(`aviso  ${a}`)
for (const e of errores) console.log(`ERROR  ${e}`)
console.log(`\n${skills.length} skills · ${validas.size} herramientas · ${errores.length} errores · ${avisos.length} avisos`)
process.exit(errores.length ? 1 : 0)
