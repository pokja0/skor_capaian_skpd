<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<td data-slot="table-cell" class={cn('px-2 py-2 align-middle', className)} {...rest}>
	{@render children?.()}
</td>
