import { Hono } from 'hono'
import { Database } from 'bun:sqlite'
import { existsSync } from 'fs'
import { getDatabasePath, projectExists } from './utils'

const teammembers = new Hono()

function getTeammember(projectId: string, teammemberId: number): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath, { readonly: true })

  try {
    const teammember = db.query('select * from teammembers where id = ?').get(teammemberId)
    if (!teammember) {
      throw new Error('Teammember no encontrado')
    }
    return teammember
  } finally {
    db.close()
  }
}

function createTeammember(projectId: string, teammemberData: any): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    // Verify team exists (foreign key constraint)
    const team = db.query('select * from teams where id = ?').get(teammemberData.team_id)
    if (!team) {
      throw new Error('Team no encontrado')
    }

    const insertQuery = db.query(`
      insert into teammembers (team_id, name, role, email)
      values (?, ?, ?, ?)
    `)

    const result = insertQuery.run(
      teammemberData.team_id,
      teammemberData.name,
      teammemberData.role,
      teammemberData.email
    )

    const teammember = db.query('select * from teammembers where id = ?').get(result.lastInsertRowid)
    return teammember
  } finally {
    db.close()
  }
}

function updateTeammember(projectId: string, teammemberId: number, teammemberData: any): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const updates: string[] = []
    const values: any[] = []

    if (teammemberData.team_id !== undefined) {
      const team = db.query('select * from teams where id = ?').get(teammemberData.team_id)
      if (!team) {
        throw new Error('Team no encontrado')
      }
      updates.push('team_id = ?')
      values.push(teammemberData.team_id)
    }
    if (teammemberData.name !== undefined) {
      updates.push('name = ?')
      values.push(teammemberData.name)
    }
    if (teammemberData.role !== undefined) {
      updates.push('role = ?')
      values.push(teammemberData.role)
    }
    if (teammemberData.email !== undefined) {
      updates.push('email = ?')
      values.push(teammemberData.email)
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar')
    }

    updates.push('updated_at = current_timestamp')
    values.push(teammemberId)

    const updateQuery = db.query(`
      update teammembers
      set ${updates.join(', ')}
      where id = ?
    `)

    updateQuery.run(...values)

    const updatedTeammember = db.query('select * from teammembers where id = ?').get(teammemberId)
    if (!updatedTeammember) {
      throw new Error('Teammember no encontrado')
    }
    return updatedTeammember
  } finally {
    db.close()
  }
}

function deleteTeammember(projectId: string, teammemberId: number): void {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const tasks = db.query('select * from tasks where teammember_id = ?').all(teammemberId)
    if (tasks.length > 0) {
      throw new Error('No se puede eliminar el teammember porque tiene tareas asignadas')
    }

    const deleteQuery = db.query('delete from teammembers where id = ?')
    const result = deleteQuery.run(teammemberId)

    if (result.changes === 0) {
      throw new Error('Teammember no encontrado')
    }
  } finally {
    db.close()
  }
}

teammembers.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, team_id, name, role, email } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (!team_id) {
      return c.json({ error: 'Parametro faltante: team_id' }, 400)
    }

    if (!name) {
      return c.json({ error: 'Parametro faltante: name' }, 400)
    }

    if (!role) {
      return c.json({ error: 'Parametro faltante: role' }, 400)
    }

    if (!email) {
      return c.json({ error: 'Parametro faltante: email' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const teammember = createTeammember(projectIdStr, {
      team_id,
      name,
      role,
      email
    })

    return c.json(teammember, 201)
  } catch (error) {
    return c.json({ error: 'Error al crear el teammember', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

teammembers.put('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, id, team_id, name, role, email } = body

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

    const teammember = updateTeammember(projectIdStr, id, {
      team_id,
      name,
      role,
      email
    })

    return c.json(teammember)
  } catch (error) {
    return c.json({ error: 'Error al actualizar el teammember', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

teammembers.get('/:id', async (c) => {
  try {
    const teammemberId = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { project_id } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (isNaN(teammemberId)) {
      return c.json({ error: 'id debe ser un numero valido' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const teammember = getTeammember(projectIdStr, teammemberId)
    return c.json(teammember)
  } catch (error) {
    return c.json({ error: 'Error al obtener el teammember', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

teammembers.delete('/', async (c) => {
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
    const teammemberId = parseInt(String(id))

    if (isNaN(teammemberId)) {
      return c.json({ error: 'id debe ser un numero valido' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    deleteTeammember(projectIdStr, teammemberId)
    return c.json({ message: 'Teammember eliminado correctamente', id: teammemberId })
  } catch (error) {
    return c.json({ error: 'Error al eliminar el teammember', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

export default teammembers

