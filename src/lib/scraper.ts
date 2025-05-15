import puppeteer from 'puppeteer'
import { deviceViewPort } from './devices'
import { parse } from 'node-html-parser'
import { $ } from 'bun'

type ScrapeOptions = {
	screenshot?: 'visible' | 'fullpage'
}

export const scraper = async ({
	url,
	options = {},
}: {
	url: string
	options?: ScrapeOptions
}) => {
	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: deviceViewPort['desktop'],
		args: ['--no-sandbox'],
	})

	const page = await browser.newPage()

	await page.goto(url, { waitUntil: 'networkidle2' })

	let html
	let markdown
	let screenshot
	let links: string[] = []
	if (options.screenshot) {
		const pageScreenshot = await page.screenshot({
			fullPage: options.screenshot === 'fullpage',
			type: 'png',
		})
		screenshot = {
			mimeType: 'image/png',
			base64: pageScreenshot.toBase64(),
		}
	}

	html = await page.content()
	html = parse(html)
	html.querySelectorAll('script').forEach((x) => x.remove())
	html.querySelectorAll('head').forEach((x) => x.remove())

	const domain = new URL(url).hostname

	html.querySelectorAll('a').forEach((x) => {
		if (
			!x.attributes.href ||
			x.attributes.href.startsWith('mailto:') ||
			x.attributes.href.startsWith('tel:')
		) {
			return
		}
		if (x.attributes.href.startsWith('/')) {
			const link = 'https://' + domain + x.attributes.href
			x.setAttribute('href', link)
			links.push(link)
		} else if (
			!x.attributes.href.startsWith('https://') &&
			!x.attributes.href.startsWith('http://')
		) {
			const link = 'https://' + domain + '/' + x.attributes.href
			x.setAttribute('href', link)
			links.push(link)
		}
	})
	html.querySelectorAll('img').forEach((x) => {
		if (!x.attributes.src || x.attributes.src.startsWith('data:')) {
			return
		}
		if (x.attributes.src.startsWith('/')) {
			x.setAttribute('src', 'https://' + domain + x.attributes.src)
		} else if (
			!x.attributes.src.startsWith('https://') &&
			!x.attributes.src.startsWith('http://')
		) {
			x.setAttribute(
				'src',
				'https://' + domain + '/' + x.attributes.src,
			)
		}
	})

	html = html.toString()

	// markdown = await $`echo "${html}" | ./html2markdown`.text()

	await browser.close()

	return {
		html,
		markdown,
		screenshot,
		links,
	}
}
