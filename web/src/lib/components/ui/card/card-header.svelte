<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<div data-slot="card-header" class={cn('flex flex-col gap-1 px-5', className)} {...rest}>
	{@render children?.()}
</div>
