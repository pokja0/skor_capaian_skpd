<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', ...rest } = $props();
</script>

<input
	data-slot="input"
	class={cn(
		'flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...rest}
/>
