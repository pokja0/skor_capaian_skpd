<script>
	import { Card } from '#lib/components/ui/card';
	import { KATEGORI_WARNA } from '#lib/skoring.js';
	import { num } from '#lib/utils.js';

	let { tiga } = $props();

	// Urutan podium: peringkat 2 (kiri), 1 (tengah), 3 (kanan)
	const susun = $derived([tiga[1], tiga[0], tiga[2]].filter(Boolean));

	const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };
	// Tinggi balok berbeda, tetapi bagian bawah rata (garis dasar sama)
	const tinggiBlok = { 1: 'h-28 sm:h-44', 2: 'h-20 sm:h-36', 3: 'h-16 sm:h-32' };
	// Warna khas podium: emas, perak, perunggu
	const warnaBlok = { 1: '#eeb63a', 2: '#c3cbd6', 3: '#cf8b52' };
	const warnaTeks = { 1: '#4a3608', 2: '#2f3540', 3: '#472a12' };
</script>

<Card class="break-inside-avoid">
	<div class="flex flex-wrap items-baseline justify-between gap-2 px-5">
		<h3 class="judul-kartu">Tiga Terbaik</h3>
		<span class="text-xs text-muted-foreground">Skor tertinggi periode ini</span>
	</div>

	<div class="mt-4 grid grid-cols-3 items-end gap-2 px-4 sm:gap-4 sm:px-5">
		{#each susun as h (h.no)}
			{@const r = Math.round(h.peringkat)}
			<div class="flex min-w-0 flex-col items-center">
				<!-- identitas di atas balok -->
				<div class="flex w-full flex-col items-center px-1 text-center">
					<div class="text-lg leading-none sm:text-2xl">{medal[r] || '🏅'}</div>
					<div class="mt-1 line-clamp-3 text-[11px] font-semibold leading-tight sm:text-[12.5px]" title={h.skpd}>
						{h.skpd}
					</div>
					<span
						class="mt-1.5 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
						style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span
					>
				</div>

				<!-- balok podium (bawah rata) -->
				<div
					class="mt-2 flex w-full flex-col items-center justify-center rounded-t-lg shadow-sm {tinggiBlok[r]}"
					style="background:{warnaBlok[r]}"
				>
					<div class="tnum text-lg font-extrabold leading-none sm:text-2xl" style="color:{warnaTeks[r]}">
						{num(h.skor, 2)}
					</div>
					<div
						class="mt-1 text-[9px] font-bold uppercase tracking-wide sm:text-[10px]"
						style="color:{warnaTeks[r]};opacity:.75"
					>
						Peringkat {r}
					</div>
				</div>
			</div>
		{/each}
	</div>
</Card>
