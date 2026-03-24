

## Plan: Agregar autenticación y aislamiento de datos por usuario

### Qué se logra
Cada persona podrá registrarse con email/contraseña, hacer login, y ver **solo sus propios** proyectos, tareas y registros de tiempo. Los datos de un usuario no serán visibles para otros.

### Cambios necesarios

#### 1. Migración de base de datos
Agregar columna `user_id` (referencia a `auth.users`) a las 4 tablas principales:
- `projects` → `user_id uuid references auth.users(id) on delete cascade`
- `tasks` → `user_id uuid` (heredado del proyecto, pero útil para filtrar directo)
- `time_entries` → `user_id uuid references auth.users(id) on delete cascade`
- `tags` → `user_id uuid references auth.users(id) on delete cascade`
- `time_entry_tags` → (hereda seguridad vía las otras tablas)

Reemplazar todas las políticas RLS públicas por políticas que filtren por `auth.uid()`:
```sql
-- Ejemplo para projects:
DROP POLICY "Public read projects" ON projects;
CREATE POLICY "Users read own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
-- Similar para INSERT, UPDATE, DELETE en cada tabla
```

Hacer que `user_id` se asigne automáticamente con `DEFAULT auth.uid()`.

#### 2. Página de autenticación (Login/Signup)
- Crear `src/pages/Auth.tsx` con formulario de login y registro por email/contraseña
- Agregar ruta `/auth` en `App.tsx`
- Crear contexto de auth o usar hook que escuche `onAuthStateChange`
- Redirigir a `/auth` si no hay sesión activa
- Incluir botón de logout en la interfaz principal

#### 3. Actualizar queries del frontend
- No se necesitan cambios en los hooks (`