<script>
	import { cn } from '#lib/utils.js';

	let { tone = 'info', judul, children } = $props();

	const gaya = {
		prioritas: 'border-l-[color:var(--kat-kurang)] bg-[color:var(--kat-kurang)]/8',
		perhatian: 'border-l-[color:var(--kat-cukup)] bg-[color:var(--kat-cukup)]/10',
		info: 'border-l-[color:var(--dim-hasil)] bg-[color:var(--dim-hasil)]/8'
	};
	const warnaJudul = {
		prioritas: 'text-[color:var(--kat-kurang)]',
		perhatian: 'text-[#b97e00]',
		info: 'text-[color:var(--dim-hasil)]'
	};
</script>

<div class={cn('rounded-lg border-l-4 p-3.5', gaya[tone])}>
	<div class={cn('mb-1 text-[11px] font-bold uppercase tracking-wide', warnaJudul[tone])}>{judul}</div>
	<div class="text-[13.5px] leading-relaxed text-[#33475b]">
		{@render children?.()}
	</div>
</div>
