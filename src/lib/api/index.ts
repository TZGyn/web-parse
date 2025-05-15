import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

// For extending the Zod schema with OpenAPI properties
import 'zod-openapi/extend'
import { openAPISpecs } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference'

// routes
import { ScrapeRoutes } from './routes/scrape'
import { CrawlRoutes } from './routes/crawl'

const app = new Hono()

app.use(cors())
app.use(logger())

app.get(
	'/openapi',
	openAPISpecs(app, {
		documentation: {
			info: {
				title: 'Hono',
				version: '1.0.0',
				description: 'API for greeting users',
			},
			servers: [
				{
					url: Bun.env.APP_URL
						? Bun.env.APP_URL + '/api'
						: 'http://localhost:5173/api',
					description: 'Server',
				},
			],
		},
	}),
)

app.get(
	'/docs',
	Scalar({
		theme: 'saturn',
		url: '/api/openapi',
	}),
)

const routes = app
	.route('/scrape', ScrapeRoutes)
	.route('/crawl', CrawlRoutes)

export const api = new Hono().route('/api', routes)

export type Router = typeof routes
