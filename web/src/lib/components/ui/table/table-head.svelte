<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<th
	data-slot="table-head"
	class={cn('text-muted-foreground h-9 whitespace-nowrap px-2 text-left align-middle text-xs font-semibold uppercase tracking-wide', className)}
	{...rest}
>
	{@render children?.()}
</th>
