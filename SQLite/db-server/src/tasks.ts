import { Hono } from 'hono'
import { Database } from 'bun:sqlite'
import { existsSync } from 'fs'
import { getDatabasePath, projectExists } from './utils'

const tasks = new Hono()

function getTask(projectId: string, taskId: number): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath, { readonly: true })

  try {
    const task = db.query('select * from tasks where id = ?').get(taskId)
    if (!task) {
      throw new Error('Tarea no encontrada')
    }
    return task
  } finally {
    db.close()
  }
}

function createTask(projectId: string, taskData: any): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const insertQuery = db.query(`
      insert into tasks (title, description, priority, estimated_hours, status, teammember_id)
      values (?, ?, ?, ?, ?, ?)
    `)

    const result = insertQuery.run(
      taskData.title,
      taskData.description,
      taskData.priority,
      taskData.estimated_hours,
      taskData.status,
      taskData.teammember_id
    )

    const task = db.query('select * from tasks where id = ?').get(result.lastInsertRowid)
    return task
  } finally {
    db.close()
  }
}

function updateTask(projectId: string, taskId: number, taskData: any): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const updates: string[] = []
    const values: any[] = []

    if (taskData.title !== undefined) {
      updates.push('title = ?')
      values.push(taskData.title)
    }
    if (taskData.description !== undefined) {
      updates.push('description = ?')
      values.push(taskData.description)
    }
    if (taskData.priority !== undefined) {
      updates.push('priority = ?')
      values.push(taskData.priority)
    }
    if (taskData.estimated_hours !== undefined) {
      updates.push('estimated_hours = ?')
      values.push(taskData.estimated_hours)
    }
    if (taskData.status !== undefined) {
      updates.push('status = ?')
      values.push(taskData.status)
    }
    if (taskData.teammember_id !== undefined) {
      updates.push('teammember_id = ?')
      values.push(taskData.teammember_id)
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar')
    }

    updates.push('updated_at = current_timestamp')
    values.push(taskId)

    const updateQuery = db.query(`
      update tasks
      set ${updates.join(', ')}
      where id = ?
    `)

    updateQuery.run(...values)

    const task = db.query('select * from tasks where id = ?').get(taskId)
    if (!task) {
      throw new Error('Tarea no encontrada')
    }
    return task
  } finally {
    db.close()
  }
}

function deleteTask(projectId: string, taskId: number): void {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const deleteQuery = db.query('delete from tasks where id = ?')
    const result = deleteQuery.run(taskId)

    if (result.changes === 0) {
      throw new Error('Tarea no encontrada')
    }
  } finally {
    db.close()
  }
}

tasks.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, title, description, priority, estimated_hours, status, teammember_id } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (!title) {
      return c.json({ error: 'Parametro faltante: title' }, 400)
    }

    if (!description) {
      return c.json({ error: 'Parametro faltante: description' }, 400)
    }

    if (!priority) {
      return c.json({ error: 'Parametro faltante: priority' }, 400)
    }

    if (estimated_hours === undefined || estimated_hours === null) {
      return c.json({ error: 'Parametro faltante: estimated_hours' }, 400)
    }

    if (!status) {
      return c.json({ error: 'Parametro faltante: status' }, 400)
    }

    if (!teammember_id) {
      return c.json({ error: 'Parametro faltante: teammember_id' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const task = createTask(projectIdStr, {
      title,
      description,
      priority,
      estimated_hours,
      status,
      teammember_id
    })

    return c.json(task, 201)
  } catch (error) {
    return c.json({ error: 'Error al crear la tarea', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

tasks.put('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, id, title, description, priority, estimated_hours, status, teammember_id } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (!id) {
      return c.json({ error: 'Parametro faltante: id' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const task = updateTask(projectIdStr, id, {
      title,
      description,
      priority,
      estimated_hours,
      status,
      teammember_id
    })

    return c.json(task)
  } catch (error) {
    return c.json({ error: 'Error al actualizar la tarea', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

tasks.get('/:id', async (c) => {
  try {
    const taskId = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { project_id } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (isNaN(taskId)) {
      return c.json({ error: 'id debe ser un numero valido' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const task = getTask(projectIdStr, taskId)
    return c.json(task)
  } catch (error) {
    return c.json({ error: 'Error al obtener la tarea', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

tasks.delete('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, id } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    if (id === undefined || id === null) {
      return c.json({ error: 'Parametro faltante: id' }, 400)
    }

    const projectIdStr = String(project_id)
    const taskId = parseInt(String(id))

    if (isNaN(taskId)) {
      return c.json({ error: 'id debe ser un numero valido' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    deleteTask(projectIdStr, taskId)
    return c.json({ message: 'Tarea eliminada correctamente', id: taskId })
  } catch (error) {
    return c.json({ error: 'Error al eliminar la tarea', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

export default tasks

