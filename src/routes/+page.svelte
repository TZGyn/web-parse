<script lang="ts">
	import { makeClient } from '$lib/api-client'
	import LoadingButton from '$lib/components/loading-button.svelte'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input/index.js'
	import { toast } from 'svelte-sonner'
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte'

	const client = makeClient(fetch)

	let url = $state('https://fly.io')
	let screenshot = $state('')

	const clipboard = new UseClipboard()
</script>

<div
	class="flex h-screen w-screen flex-col items-center justify-center gap-4 p-4">
	<h1 class="text-4xl font-bold">Web Parse</h1>

	<div class="w-full max-w-[600px]">
		<Input bind:value={url} placeholder="Enter url here..." />
	</div>

	<LoadingButton
		variant="secondary"
		onclick={async () => {
			const response = await client.scrape.$post({
				json: { url, screenshot: 'visible' },
			})

			const data = await response.json()
			if (!data.success) {
				toast.error(JSON.stringify(data))
				return
			}

			if (data.data.screenshot) {
				screenshot = data.data.screenshot.base64
			}

			console.log(data.data)
			// clipboard.copy(data.data.html)
			toast.success('Copied')
		}}>
		Scrape
	</LoadingButton>

	{#if screenshot}
		<img
			src={`data:image/png;base64,${screenshot}`}
			alt="screenshot" />
	{/if}
</div>
