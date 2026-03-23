

# Easter Eggs: Mover al Header, Restaurar Footer

## Problema
El footer muestra el easter egg de cada tema (ej: "WEYLAND-YUTANI CORP") para todos, cuando debería siempre decir "Built with focus ✦". Los easter eggs deberían estar junto al título "Marea Timer" en el header.

## Cambios

### 1. `src/lib/themeContent.ts`
- Cambiar `footerText` por `subtitle` (el easter egg que va al lado del título)
- El footer siempre será "Built with focus ✦" (hardcoded, no en el map)
- Claude no tiene subtitle (string vacío)
- Nostromo: `"WEYLAND-YUTANI CORP"`
- Macintosh: `"© 1984 Marea Systems Inc."`
- Vaporwave: `"～ トラッカー"`
- Matrix: `"Free your mind, Cris."`

### 2. `src/pages/Index.tsx`
- **Header (línea 32):** Mostrar `content.appTitle` + si hay `content.subtitle`, un `<span>` pequeño al lado con texto muted (ej: `text-[10px] text-muted-foreground ml-2`)
- **Footer (línea 122):** Cambiar `{content.footerText}` por el string fijo `"Built with focus ✦"`

## Archivos: 2
- `src/lib/themeContent.ts`
- `src/pages/Index.tsx`

