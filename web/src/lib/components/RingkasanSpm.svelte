<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';

	let { baris } = $props();

	const fmt = (v) => {
		if (v === null || v === undefined || v === '') return '–';
		return String(v);
	};

	const kepala = $derived(baris?.[0] ?? []);
	const isi = $derived((baris ?? []).slice(1));
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="judul-kartu">Rincian Perbandingan Nilai SPM</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="overflow-x-auto">
			<table class="w-full min-w-[560px] text-sm">
				<thead>
					<tr class="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
						{#each kepala as h, i (i)}
							<th class="px-2 py-2 {i === 0 ? 'text-left' : 'text-right'} font-semibold">{fmt(h)}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each isi as r, i (i)}
						{@const total = String(r[0] ?? '').toUpperCase().startsWith('TOTAL')}
						<tr class="border-b last:border-0 {total ? 'bg-[color:var(--muted)]/50 font-bold' : ''}">
							<td class="px-2 py-2 text-left">{fmt(r[0])}</td>
							<td class="tnum px-2 py-2 text-right text-muted-foreground">{fmt(r[1])}</td>
							<td class="tnum px-2 py-2 text-right">{fmt(r[2])}</td>
							<td
								class="tnum px-2 py-2 text-right font-semibold"
								style="color:{String(r[3] ?? '').trim().startsWith('-') ? 'var(--kat-kurang)' : 'var(--kat-sangat-baik)'}"
							>
								{fmt(r[3])}
							</td>
							<td class="px-2 py-2 text-right text-[11px] text-muted-foreground">{fmt(r[4])}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</CardContent>
</Card>
