<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<select
	data-slot="select"
	class={cn(
		'flex h-9 w-full min-w-[9rem] cursor-pointer rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
		className
	)}
	{...rest}
>
	{@render children?.()}
</select>
