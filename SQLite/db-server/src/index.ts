import { Hono } from 'hono'
import projects from './projects'
import tasks from './tasks'
import teams from './teams'
import teammembers from './teammembers'

const app = new Hono()

app.get('/', (c) => {
  return c.text('https://github.com/WeirdCatAFK/ProjectManagement-DB/tree/main')
})

app.route('/project', projects)
app.route('/task', tasks)
app.route('/team', teams)
app.route('/teammember', teammembers)

export default app
