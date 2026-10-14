<script>
	import { cn } from '#lib/utils.js';
	import { tv } from 'tailwind-variants';

	let { class: className = '', variant = 'default', children, ...rest } = $props();

	const badgeVariants = tv({
		base: 'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				destructive: 'border-transparent bg-destructive text-destructive-foreground',
				outline: 'text-foreground',
				outlineBiru: 'border-[color:var(--primary)]/25 bg-white text-[color:var(--primary)]'
			}
		},
		defaultVariants: { variant: 'default' }
	});
</script>

<span data-slot="badge" class={cn(badgeVariants({ variant }), className)} {...rest}>
	{@render children?.()}
</span>
