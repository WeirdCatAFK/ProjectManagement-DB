import { Hono } from 'hono'
import { Database } from 'bun:sqlite'
import { existsSync, rmSync } from 'fs'
import { mkdirSync } from 'fs'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getBasePath, getProjectPath, getDatabasePath, projectExists } from './utils'

const projects = new Hono()

function initializeProjectDatabase(projectId: string): void {
  const projectPath = getProjectPath(projectId)
  const dbPath = getDatabasePath(projectId)

  mkdirSync(projectPath, { recursive: true })

  const schemaPath = join(getBasePath(), 'schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')

  const db = new Database(dbPath, { create: true })
  db.exec(schema)
  db.close()
}

function getProjectData(projectId: string): any {
  const dbPath = getDatabasePath(projectId)

  if (!existsSync(dbPath)) {
    throw new Error('sqlite del proyecto no encontrado')
  }

  const db = new Database(dbPath, { readonly: true })

  try {
    const teams = db.query('select * from teams').all()
    const teammembers = db.query('select * from teammembers').all()
    const tasks = db.query('select * from tasks').all()

    return {
      teams,
      teammembers,
      tasks
    }
  } finally {
    db.close()
  }
}

function deleteProject(projectId: string): void {
  const projectPath = getProjectPath(projectId)

  if (!existsSync(projectPath)) {
    throw new Error('Proyecto no encontrado')
  }

  rmSync(projectPath, { recursive: true, force: true })
}

projects.post('/:id', (c) => {
  const projectId = c.req.param('id')

  if (projectExists(projectId)) {
    return c.json({ error: 'id del proyecto ya existe' }, 400)
  }

  try {
    initializeProjectDatabase(projectId)
    return c.json({ message: 'Proyecto creado correctamente', id: projectId }, 201)
  } catch (error) {
    return c.json({ error: 'Error al crear el proyecto', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

projects.get('/:id', (c) => {
  const projectId = c.req.param('id')

  if (!projectExists(projectId)) {
    return c.json({ error: `Proyecto con id ${projectId} no encontrado` }, 404)
  }

  try {
    const data = getProjectData(projectId)
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Error al obtener los datos del proyecto', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

projects.delete('/:id', (c) => {
  const projectId = c.req.param('id')

  if (!projectExists(projectId)) {
    return c.json({ error: `Proyecto con id ${projectId} no encontrado` }, 404)
  }

  try {
    deleteProject(projectId)
    return c.json({ message: 'Proyecto eliminado correctamente', id: projectId })
  } catch (error) {
    return c.json({ error: 'Error al eliminar el proyecto', details: error instanceof Error ? error.message : String(error) }, 500)
  }
})

export default projects

