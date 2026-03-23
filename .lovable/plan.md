

## Plan: Motores dinámicos desde la base de datos

**Problema actual:** Los motores están hardcodeados en `MOTOR_MAP` y en `weeklyPlan.ts`. Si agregas un nuevo proyecto con meta semanal, no aparece como motor en el dashboard.

**Solución:** Derivar los motores directamente de los proyectos que tengan `weekly_goal_hours > 0` en la base de datos, y agregar un campo `motor` a la tabla `projects` para asignar número de motor.

### Cambios

**1. Migración: agregar columna `motor_number` a `projects`**
- Columna `motor_number integer nullable` — si tiene valor, es un motor
- Migrar datos existentes: Jobhunt → 1, Aprender AI → 2, Proyectos → 3

**2. `src/components/DashboardCharts.tsx`**
- Eliminar `MOTOR_MAP` hardcodeado
- Cambiar `motorGoalData` para filtrar proyectos donde `motor_number IS NOT NULL` y ordenar por `motor_number`
- Label generado: `"Motor {n}"` desde el campo

**3. `src/components/ProjectManager.tsx`**
- Agregar opción para asignar número de motor al crear/editar proyecto
- Input numérico opcional junto a la meta semanal

**4. `src/components/AlignmentSemana.tsx`**
- Cambiar `MOTOR_GOALS` hardcodeado por query dinámica: proyectos con `motor_number != null`
- Usar `weekly_goal_hours` del proyecto como meta

**5. `src/lib/weeklyPlan.ts`**
- Mantener `CATEGORY_STYLES` para los colores del plan semanal (es visual)
- `MOTOR_GOALS` se puede deprecar ya que viene de la DB

### Archivos: 4 archivos + 1 migración

