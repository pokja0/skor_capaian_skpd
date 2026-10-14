<script>
	import { cn } from '#lib/utils.js';
	let { class: className = '', children, ...rest } = $props();
</script>

<thead data-slot="table-header" class={cn('[&_tr]:border-b', className)} {...rest}>
	{@render children?.()}
</thead>
