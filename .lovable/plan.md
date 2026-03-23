## Plan: Efectos terminales para Nostromo y Matrix

### Cambios

**1. `src/components/effects/ThemeEffects.tsx**`

- Eliminar el componente `Scanlines` por completo
- Quitar su renderizado de ambos temas (Nostromo y Matrix)

**2. `src/index.css**`

- Agregar animación `blink` con `step-end` y clase `.animate-blink`
- Hacer el CRT flicker más notorio: bajar opacidad a `0.6` en el parpadeo (era `0.85`) y acelerar el ciclo a `4s` (era `8s`)
- Quitar `@keyframes matrix-scanline` 

**3. `src/components/AlignmentSemana.tsx**`

- Importar `useVisualTheme`
- Calcular `todayIndex` comparando `weekDates` con la fecha actual
- En línea 207, después de `dayAbbrs[i]`, mostrar `█` parpadeante si el tema es Nostromo y es el día actual:

```tsx
<p className="text-[10px] text-muted-foreground">
  {dayAbbrs[i]}
  {(visualTheme === "nostromo" || visualTheme === "matrix") && todayIndex === i && (
    <span className="animate-blink ml-0.5">█</span>
  )}
</p>
```

### Resumen

- **Quitar**: scanlines de ambos temas
- **Mantener y amplificar**: CRT flicker en Nostromo
- **Agregar**: cursor `█` parpadeante en día actual para ambos temas

### Archivos: 3