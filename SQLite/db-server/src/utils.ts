import { existsSync } from 'fs'
import { join } from 'path'

export function getBasePath(): string {
  const currentDir = process.cwd()
  if (currentDir.endsWith('db-server')) {
    return join(currentDir, '..')
  }
  return currentDir
}

export function projectExists(projectId: string): boolean {
  const projectPath = join(getBasePath(), 'projects', projectId)
  return existsSync(projectPath)
}

export function getProjectPath(projectId: string): string {
  return join(getBasePath(), 'projects', projectId)
}

export function getDatabasePath(projectId: string): string {
  return join(getProjectPath(projectId), 'db.sqlite')
}

