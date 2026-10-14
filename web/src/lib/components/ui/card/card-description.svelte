<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<p data-slot="card-description" class={cn('text-muted-foreground text-sm', className)} {...rest}>
	{@render children?.()}
</p>
