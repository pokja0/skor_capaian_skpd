<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { KATEGORI_WARNA } from '#lib/skoring.js';

	let { data } = $props();
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="judul-kartu">Distribusi Kategori</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="flex flex-wrap items-center gap-5">
			<div class="relative h-[128px] w-[128px] shrink-0">
				<svg viewBox="0 0 42 42" class="h-full w-full">
					<circle cx="21" cy="21" r="15.9" fill="none" stroke="#eef2f7" stroke-width="6"></circle>
					{#each data.segmen as s (s.k)}
						<circle
							cx="21"
							cy="21"
							r="15.9"
							fill="none"
							stroke={s.warna}
							stroke-width="6"
							stroke-dasharray="{s.len} {100 - s.len}"
							stroke-dashoffset={-s.off}
							transform="rotate(-90 21 21)"
						></circle>
					{/each}
				</svg>
				<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
					<span class="tnum text-2xl font-bold text-[color:var(--primary)]">{data.jumlah}</span>
					<span class="text-[11px] text-muted-foreground">SKPD dinilai</span>
				</div>
			</div>
			<div class="min-w-[170px] flex-1">
				{#each data.daftar as d (d.k)}
					<div class="flex items-center gap-2 border-b border-dashed py-1.5 text-sm last:border-0">
						<span class="inline-block h-3 w-3 shrink-0 rounded" style="background:{d.warna}"></span>
						<span class="whitespace-nowrap">{d.k}</span>
						<b class="tnum ml-auto whitespace-nowrap">{d.n} SKPD</b>
					</div>
				{/each}
			</div>
		</div>
	</CardContent>
</Card>
