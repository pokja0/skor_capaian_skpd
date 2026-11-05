<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { num } from '#lib/utils.js';

	let { baris } = $props();

	const fmt = (v) => {
		if (v === null || v === undefined || v === '') return '';
		if (typeof v === 'number') return num(v, 2);
		return String(v);
	};
	const isHeader = (r) => r.filter((x) => x !== null && x !== undefined && x !== '').length <= 1;
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="judul-kartu">Komponen SAKIP &amp; Reformasi Birokrasi</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="overflow-x-auto">
			<table class="w-full min-w-[560px] text-sm">
				<thead>
					<tr class="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
						<th class="py-2 pr-3 text-left font-semibold">Indikator / Komponen</th>
						<th class="px-2 py-2 text-right font-semibold">2024</th>
						<th class="px-2 py-2 text-right font-semibold">2025</th>
						<th class="px-2 py-2 text-right font-semibold">Perubahan</th>
						<th class="px-2 py-2 text-left font-semibold">Satuan / Bobot</th>
					</tr>
				</thead>
				<tbody>
					{#each baris as r, i (i)}
						{#if isHeader(r)}
							<tr class="border-b bg-[color:var(--muted)]/60">
								<td colspan="5" class="py-2 pr-3 text-[12px] font-bold uppercase tracking-wide text-[color:var(--primary)]">
									{fmt(r[0])}
								</td>
							</tr>
						{:else}
							{@const d = typeof r[3] === 'number' ? r[3] : null}
							<tr class="border-b last:border-0">
								<td class="py-2 pr-3">{fmt(r[0])}</td>
								<td class="tnum px-2 py-2 text-right text-muted-foreground">{fmt(r[1])}</td>
								<td class="tnum px-2 py-2 text-right font-semibold">{fmt(r[2])}</td>
								<td
									class="tnum px-2 py-2 text-right font-semibold"
									style="color:{d === null ? 'var(--muted-foreground)' : d < 0 ? 'var(--kat-kurang)' : d > 0 ? 'var(--kat-sangat-baik)' : 'var(--muted-foreground)'}"
								>
									{d === null ? fmt(r[3]) : (d > 0 ? '+' : '') + num(d, 2)}
								</td>
								<td class="px-2 py-2 text-muted-foreground">{fmt(r[4])}</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</CardContent>
</Card>
