<script>
	import { Card } from '#lib/components/ui/card';
	import { KATEGORI_WARNA } from '#lib/skoring.js';
	import { num } from '#lib/utils.js';

	let { tiga } = $props();

	// Urutan podium: peringkat 2 (kiri), 1 (tengah), 3 (kanan)
	const susun = $derived(
		[ tiga[1], tiga[0], tiga[2] ]
			.filter(Boolean)
			.map((h) => h)
	);

	const medal = ['🥇', '🥈', '🥉'];
	function emoji(h) {
		return medal[Math.round(h.peringkat) - 1] || '🏅';
	}
	const tinggi = { 1: 'pt-2', 2: 'pt-8', 3: 'pt-12' };
</script>

<Card class="break-inside-avoid">
	<div class="flex flex-wrap items-baseline justify-between gap-2 px-5">
		<h3 class="text-base font-semibold text-[color:var(--primary)]">Tiga Terbaik</h3>
		<span class="text-xs text-muted-foreground">Skor tertinggi periode ini</span>
	</div>
	<div class="mt-3 grid grid-cols-3 items-end gap-3 px-5">
		{#each susun as h (h.no)}
			<div class={tinggi[Math.round(h.peringkat)]}>
				<div
					class="rounded-xl border-t-4 px-3 py-3 text-center shadow-sm"
					style="border-top-color:{KATEGORI_WARNA[h.kategori]}"
				>
					<div class="text-2xl leading-none">{emoji(h)}</div>
					<div class="tnum mt-1 text-[11px] font-bold text-muted-foreground">
						#{Math.round(h.peringkat)}
					</div>
					<div class="mt-0.5 line-clamp-2 text-[12.5px] font-semibold leading-tight" title={h.skpd}>
						{h.namaPendek}
					</div>
					<div class="tnum mt-1.5 text-xl font-extrabold text-[color:var(--primary)]">
						{num(h.skor, 2)}
					</div>
					<span
						class="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
						style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span
					>
				</div>
			</div>
		{/each}
	</div>
</Card>
