<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<tr
	data-slot="table-row"
	class={cn('border-b transition-colors hover:bg-[color:var(--accent)]/60', className)}
	{...rest}
>
	{@render children?.()}
</tr>
