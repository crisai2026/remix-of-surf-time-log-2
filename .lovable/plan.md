

## Cambios

### 1. `src/lib/themeContent.ts`
- Renombrar `footerText` a `easterEgg` (texto que va en el header)
- Agregar campo `footerText` fijo = `"Built with focus ✦"` para todos, o mejor: quitar del map y hardcodearlo en Index
- Claude: easterEgg vacío (no tiene)
- Nostromo: `"WEYLAND-YUTANI CORP"`
- Macintosh: `"© 1984 Marea Systems Inc."`
- Vaporwave: `"～ トラッカー"`
- Matrix: `"Free your mind, Cris."`

### 2. `src/pages/Index.tsx` — Header (línea 31-33)
Reorganizar la línea del header para que sea:

```text
[Marea Timer]     [easter egg text]     [ThemeSelector]
```

- `appTitle` a la izquierda
- Easter egg en texto pequeño/muted, centrado o empujado a la derecha con `flex-1`
- `ThemeSelector` a la derecha
- Usar `items-center` y spacing apropiado

### 3. `src/pages/Index.tsx` — Footer (línea 122)
- Cambiar `{content.footerText}` por `"Built with focus ✦"` hardcoded — mismo texto para todos los temas

### 4. `src/index.css` — Quitar fondos con patrones
- **Eliminar** el bloque de `.theme-macintosh:not(.dark) body` con el checkerboard pattern (líneas ~407-416)
- **Eliminar** el bloque de `.theme-macintosh.dark body` con el checkerboard pattern (líneas ~418-427)
- Dejar que use el `--background` CSS variable plano como todos los demás temas

### Archivos: 3
1. `src/lib/themeContent.ts` — reestructurar con `easterEgg`
2. `src/pages/Index.tsx` — mover easter egg al header, restaurar footer fijo
3. `src/index.css` — eliminar background-image patterns de Macintosh

