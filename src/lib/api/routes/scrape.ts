import { Hono } from 'hono'

// For extending the Zod schema with OpenAPI properties
import 'zod-openapi/extend'
import { resolver, validator as zValidator } from 'hono-openapi/zod'
import { z } from 'zod'

import { chromium, devices } from 'playwright'
import puppeteer from 'puppeteer'
import { scraper } from '$lib/scraper'

const app = new Hono().post(
	'/',
	zValidator(
		'json',
		z.object({
			url: z.string().url().openapi({ default: 'https://fly.io' }),
			screenshot: z.enum(['visible', 'fullpage']).optional(),
		}),
	),
	async (c) => {
		const { url, screenshot } = c.req.valid('json')

		const result = await scraper({ url, options: { screenshot } })

		return c.json({ success: true, data: result })
	},
)

export { app as ScrapeRoutes }
