## Plan: Actualizar tagline y agregar texto de espíritu en Auth

### Cambios en `src/pages/Auth.tsx`

1. **Tagline**: "Tu tiempo, tu ritmo" → **"Mide lo que importa"**
2. **Párrafo de espíritu** debajo del tagline, algo como:

> *Hecha por mentes neurodivergentes para todo el mundo. Marea te ayuda a visualizar y elimina la fricción entre lo que haces y lo que quieres hacer — para que cambiar de tarea no sea una batalla, sino una ola.*

3. Estilizado sutil: `text-muted-foreground text-xs max-w-xs text-center mx-auto` con un poco de margen inferior, para que no compita con el formulario.

### Archivo

- `src/pages/Auth.tsx` — sección de branding (líneas ~62-68)