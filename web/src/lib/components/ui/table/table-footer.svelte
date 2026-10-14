<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<tfoot data-slot="table-footer" class={cn('bg-muted/50 font-medium', className)} {...rest}>
	{@render children?.()}
</tfoot>
