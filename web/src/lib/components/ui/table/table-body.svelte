<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<tbody data-slot="table-body" class={cn('[&_tr:last-child]:border-0', className)} {...rest}>
	{@render children?.()}
</tbody>
