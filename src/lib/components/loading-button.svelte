<script lang="ts">
	import { Loader2Icon } from 'lucide-svelte'
	import { type ButtonProps, Button } from './ui/button'

	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		children,
		onclick,
		...restProps
	}: ButtonProps = $props()

	let isLoading = $state(false)
</script>

<Button
	class={className}
	{variant}
	{size}
	{ref}
	{href}
	{type}
	onclick={async (event) => {
		isLoading = true
		if (onclick) {
			await onclick(event)
		}
		isLoading = false
	}}
	{...restProps}>
	{#if isLoading}
		<Loader2Icon class="animate-spin" />
	{/if}
	{@render children?.()}
</Button>
