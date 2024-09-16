import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { googleImage } from './services'
import favicon from './favicon'

const app = new Hono({ strict: false })

app.route('/favicon.ico', favicon)

app.get('/', async c => {
  try {
    const q = c.req.query('q')
    const safe = c.req.query('safe')

    if (!q) return c.json({ error: 'Insira o termo de pesquisa' }, 404)

    const images = await googleImage(q, { query: { safe: safe === 'off' ? 'off' : 'on' } })

    return c.json({
      images: images.length > 0 ? images : 'Nenhuma imagem encontrada',
    })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
