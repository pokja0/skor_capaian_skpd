<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<caption data-slot="table-caption" class={cn('text-muted-foreground mt-4 text-sm', className)} {...rest}>
	{@render children?.()}
</caption>
