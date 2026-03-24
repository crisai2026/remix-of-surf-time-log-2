

## Plan: Mejorar la página de Auth con branding y diseño atractivo

La página de login/registro actualmente es muy básica — solo un formulario blanco sin identidad. Vamos a hacerla más acogedora con el nombre de la app, una animación sutil y mejor diseño visual.

### Cambios en `src/pages/Auth.tsx`

1. **Header con branding**: Agregar el nombre "Marea" grande con un ícono de ola (🌊) animado y un subtítulo descriptivo ("Tu tiempo, tu ritmo")

2. **Gradiente de fondo**: Un fondo con gradiente sutil usando los colores del tema (tonos azul/teal que evocan "marea")

3. **Animación de entrada**: El card del formulario aparece con una animación fade-in + slide-up suave usando CSS

4. **Footer decorativo**: Un texto pequeño al pie ("Built with focus ✦") consistente con el footer de la app principal

5. **Visual polish**: Bordes más suaves en el card, sombra más pronunciada, mejor espaciado

### Archivo a modificar
- `src/pages/Auth.tsx` — rediseño completo del layout
- `src/index.css` — agregar keyframe para animación de entrada (si no existe)

