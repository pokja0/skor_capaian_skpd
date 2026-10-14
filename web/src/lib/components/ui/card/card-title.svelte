<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<h3 data-slot="card-title" class={cn('font-semibold leading-none', className)} {...rest}>
	{@render children?.()}
</h3>
