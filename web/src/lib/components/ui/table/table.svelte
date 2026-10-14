<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<table data-slot="table" class={cn('w-full caption-bottom border-collapse text-sm', className)} {...rest}>
	{@render children?.()}
</table>
