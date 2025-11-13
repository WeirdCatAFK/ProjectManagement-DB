# API SQLite

## Stack de tecnologias

- Bun
- Hono
- SQLite

## Endpoints de Proyectos

### Crear Proyecto

Crea un nuevo proyecto con su base de datos SQLite

**Endpoint:** `POST /project/:id`

**Argumentos:**

- `id` (path parameter): Id del proyecto

### Select \* de un Proyecto

Obtiene todos los datos del proyecto: equipos, miembros del equipo y tareas

**Endpoint:** `GET /project/:id`

**Argumentos:**

- `id` (path parameter): Id del proyecto

### Eliminar Proyecto

Elimina un proyecto y toda su carpeta con la base de datos

**Endpoint:** `DELETE /project/:id`

**Argumentos:**

- `id` (path parameter): Id del proyecto

## Endpoints de Tasks

### Crear Task

Crea una nueva task en un proyecto especifico

**Endpoint:** `POST /task`

**Body (JSON):**

- `project_id` (requerido): Id del proyecto
- `title` (requerido): Titulo de la tarea
- `description` (requerido): Descripcion de la tarea
- `priority` (requerido): Prioridad de la tarea
- `estimated_hours` (requerido): Horas estimadas (numero)
- `status` (requerido): Estado de la tarea
- `teammember_id` (requerido): id del miembro del equipo asignado

### Actualizar Tarea

Actualiza una tarea existente. Solo se actualizan los campos proporcionados

**Endpoint:** `PUT /task`

**Body (JSON):**

- `project_id` (requerido): id del proyecto
- `id` (requerido): id de la tarea a actualizar
- `title` (opcional): Nuevo titulo
- `description` (opcional): Nueva descripcion
- `priority` (opcional): Nueva prioridad
- `estimated_hours` (opcional): Nuevas horas estimadas
- `status` (opcional): Nuevo estado
- `teammember_id` (opcional): Nuevo id del miembro asignado

### Obtener Tarea

Obtiene los datos de una tarea especifica

**Endpoint:** `GET /task/:id`

**Argumentos:**

- `id` (path parameter): id de la tarea

**Body (JSON):**

- `project_id` (requerido): Id del proyecto

### Eliminar Tarea

Elimina una tarea de un proyecto

**Endpoint:** `DELETE /task`

**Body (JSON):**

- `project_id` (requerido): Id del proyecto
- `id` (requerido): id de la tarea a eliminar

## Endpoints de Teams

### Crear Team

Crea un nuevo team en un proyecto especifico

**Endpoint:** `POST /team`

**Body (JSON):**

- `project_id` (requerido): Id del proyecto
- `name` (requerido): Nombre del team
- `description` (requerido): Descripcion del team

### Actualizar Team

Actualiza un team existente. Solo se actualizan los campos proporcionados

**Endpoint:** `PUT /team`

**Body (JSON):**

- `project_id` (requerido): id del proyecto
- `id` (requerido): id del team a actualizar
- `name` (opcional): Nuevo nombre
- `description` (opcional): Nueva descripcion

### Obtener Team

Obtiene los datos de un team especifico

**Endpoint:** `GET /team/:id`

**Argumentos:**

- `id` (path parameter): id del team

**Body (JSON):**

- `project_id` (requerido): Id del proyecto

### Eliminar Team

Elimina un team de un proyecto. No se puede eliminar si tiene miembros asignados

**Endpoint:** `DELETE /team`

**Body (JSON):**

- `project_id` (requerido): Id del proyecto
- `id` (requerido): id del team a eliminar

## Endpoints de Teammembers

### Crear Teammember

Crea un nuevo teammember en un proyecto especifico

**Endpoint:** `POST /teammember`

**Body (JSON):**

- `project_id` (requerido): Id del proyecto
- `team_id` (requerido): id del team al que pertenece
- `name` (requerido): Nombre del teammember
- `role` (requerido): Rol del teammember
- `email` (requerido): Email del teammember

### Actualizar Teammember

Actualiza un teammember existente. Solo se actualizan los campos proporcionados

**Endpoint:** `PUT /teammember`

**Body (JSON):**

- `project_id` (requerido): id del proyecto
- `id` (requerido): id del teammember a actualizar
- `team_id` (opcional): Nuevo id del team
- `name` (opcional): Nuevo nombre
- `role` (opcional): Nuevo rol
- `email` (opcional): Nuevo email

### Obtener Teammember

Obtiene los datos de un teammember especifico

**Endpoint:** `GET /teammember/:id`

**Argumentos:**

- `id` (path parameter): id del teammember

**Body (JSON):**

- `project_id` (requerido): Id del proyecto

### Eliminar Teammember

Elimina un teammember de un proyecto. No se puede eliminar si tiene tareas asignadas

**Endpoint:** `DELETE /teammember`

**Body (JSON):**

- `project_id` (requerido): Id del proyecto
- `id` (requerido): id del teammember a eliminar

## Codigos de HTTP

- `200`: Operacion exitosa
- `201`: Recurso creado exitosamente
- `400`: Error en la solicitud (datos faltantes o invalidos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Notas Importantes

- Todos los endpoints requieren el `project_id` en el body JSON para identificar en que base de datos SQLite realizar la operacion
- Cada proyecto tiene su propia base de datos SQLite almacenada en `projects/{project_id}/db.sqlite`
- Al crear un proyecto, se inicializa automaticamente la base de datos con el esquema definido en `schema.sql`
- Al eliminar un proyecto, se elimina completamente la carpeta y todo su contenido, incluyendo la base de datos
- El campo `updated_at` se actualiza automaticamente cuando se modifica un registro
- Todas las columnas en la base de datos tienen la restriccion NOT NULL, por lo que todos los campos son requeridos al crear registros
- Las foreign keys se respetan: no se puede eliminar un team si tiene teammembers, ni un teammember si tiene tareas asignadas
- Al crear un teammember, el `team_id` debe existir en la tabla teams
- Al crear una task, el `teammember_id` debe existir en la tabla teammembers
