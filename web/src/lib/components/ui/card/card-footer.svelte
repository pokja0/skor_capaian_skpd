<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<div data-slot="card-footer" class={cn('flex items-center px-5', className)} {...rest}>
	{@render children?.()}
</div>
