import { Hono } from 'hono'
import { Database } from 'bun:sqlite'
import { existsSync } from 'fs'
import { getDatabasePath, projectExists } from './utils'

const teams = new Hono()

function getTeam(projectId: string, teamId: number): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath, { readonly: true })

  try {
    const team = db.query('select * from teams where id = ?').get(teamId)
    if (!team) {
      throw new Error('Team no encontrado')
    }
    return team
  } finally {
    db.close()
  }
}

function createTeam(projectId: string, teamData: any): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const insertQuery = db.query(`
      insert into teams (name, description)
      values (?, ?)
    `)

    const result = insertQuery.run(
      teamData.name,
      teamData.description
    )

    const team = db.query('select * from teams where id = ?').get(result.lastInsertRowid)
    return team
  } finally {
    db.close()
  }
}

function updateTeam(projectId: string, teamId: number, teamData: any): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    const updates: string[] = []
    const values: any[] = []

    if (teamData.name !== undefined) {
      updates.push('name = ?')
      values.push(teamData.name)
    }
    if (teamData.description !== undefined) {
      updates.push('description = ?')
      values.push(teamData.description)
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar')
    }

    updates.push('updated_at = current_timestamp')
    values.push(teamId)

    const updateQuery = db.query(`
      update teams
      set ${updates.join(', ')}
      where id = ?
    `)

    updateQuery.run(...values)

    const updatedTeam = db.query('select * from teams where id = ?').get(teamId)
    if (!updatedTeam) {
      throw new Error('Team no encontrado')
    }
    return updatedTeam
  } finally {
    db.close()
  }
}

function deleteTeam(projectId: string, teamId: number): void {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath)

  try {
    // Check if team has members (foreign key constraint)
    const members = db.query('select * from teammembers where team_id = ?').all(teamId)
    if (members.length > 0) {
      throw new Error('No se puede eliminar el team porque tiene miembros asignados')
    }

    const deleteQuery = db.query('delete from teams where id = ?')
    const result = deleteQuery.run(teamId)

    if (result.changes === 0) {
      throw new Error('Team no encontrado')
    }
  } finally {
    db.close()
  }
}

teams.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, name, description } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (!name) {
      return c.json({ error: 'Parametro faltante: name' }, 400)
    }

    if (!description) {
      return c.json({ error: 'Parametro faltante: description' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const team = createTeam(projectIdStr, {
      name,
      description
    })

    return c.json(team, 201)
  } catch (error) {
    return c.json({ error: 'Error al crear el team', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

teams.put('/', async (c) => {
  try {
    const body = await c.req.json()
    const { project_id, id, name, description } = body

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

    const team = updateTeam(projectIdStr, id, {
      name,
      description
    })

    return c.json(team)
  } catch (error) {
    return c.json({ error: 'Error al actualizar el team', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

teams.get('/:id', async (c) => {
  try {
    const teamId = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { project_id } = body

    if (project_id === undefined || project_id === null) {
      return c.json({ error: 'Parametro faltante: project_id' }, 400)
    }

    const projectIdStr = String(project_id)

    if (isNaN(teamId)) {
      return c.json({ error: 'id debe ser un numero valido' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    const team = getTeam(projectIdStr, teamId)
    return c.json(team)
  } catch (error) {
    return c.json({ error: 'Error al obtener el team', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

teams.delete('/', async (c) => {
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
    const teamId = parseInt(String(id))

    if (isNaN(teamId)) {
      return c.json({ error: 'id debe ser un numero valido' }, 400)
    }

    if (!projectExists(projectIdStr)) {
      return c.json({ error: `Proyecto con id ${project_id} no encontrado` }, 404)
    }

    deleteTeam(projectIdStr, teamId)
    return c.json({ message: 'Team eliminado correctamente', id: teamId })
  } catch (error) {
    return c.json({ error: 'Error al eliminar el team', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

export default teams

