<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<div data-slot="card-content" class={cn('px-5', className)} {...rest}>
	{@render children?.()}
</div>
