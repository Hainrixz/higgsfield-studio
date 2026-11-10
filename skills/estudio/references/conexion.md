# Conectar Higgsfield

Higgsfield Studio no trae su propio servidor: usa el MCP oficial de Higgsfield. Hace falta una cuenta de Higgsfield con créditos (un plan de pago o la prueba que Higgsfield ofrezca en ese momento); el acceso es por inicio de sesión en el navegador (OAuth), sin llaves que copiar.

## En claude.ai o la app de escritorio

1. Ajustes → Conectores → Añadir conector personalizado.
2. Nombre: `Higgsfield`. URL: `https://mcp.higgsfield.ai/mcp`.
3. Conectar e iniciar sesión en la ventana que se abre.

Un conector añadido en claude.ai también aparece en Claude Code con la misma cuenta. Sus herramientas se llaman `mcp__claude_ai_Higgsfield__…`.

## En Claude Code, directo

```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

Luego, dentro de Claude Code, `/mcp` → `higgsfield` → autenticar. Sus herramientas se llaman `mcp__higgsfield__…`.

## Comprobar

Pide el saldo. Si `balance` responde con créditos y plan, está conectado.

## Si falla

| Síntoma | Qué hacer |
|---|---|
| "Authorization with the MCP server failed" | Desconecta el conector y vuelve a conectarlo. |
| No aparece ninguna herramienta de Higgsfield | Revisa `/mcp`; reinicia la sesión de Claude Code tras conectar. |
| Las herramientas aparecen solo por nombre | Son diferidas: se cargan con ToolSearch. Es normal. |
| Responde que no hay créditos | El MCP gasta créditos del plan. Recarga en higgsfield.ai. |

Las generaciones ilimitadas no se activan solas. Si la cuenta tiene y el modelo las admite, el servidor lo pregunta (`unlim_choice`). Si la persona las pide, se manda `use_unlim: true` sin más filtro; si el servidor las rechaza, devuelve el motivo y eso es lo que se le dice.
