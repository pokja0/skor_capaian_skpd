<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { Input } from '#lib/components/ui/input';
	import {
		Table,
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell
	} from '#lib/components/ui/table';
	import {
		KATEGORI_URUT,
		KATEGORI_WARNA,
		DIMENSI,
		INDIKATOR,
		rataIndikator,
		rataDimensi
	} from '#lib/skoring.js';
	import { num } from '#lib/utils.js';

	let { hasil, ringkas } = $props();

	let q = $state('');
	let aktif = $state(KATEGORI_URUT);
	let buka = $state([]);
	let urut = $state({ kolom: 'peringkat', arah: 'naik' });

	const RATA = $derived(rataIndikator(hasil));
	const RATA_DIM = $derived(rataDimensi(hasil));

	const nilai = {
		peringkat: (h) => h.peringkat,
		skpd: (h) => h.skpd,
		skor: (h) => h.skor,
		kategori: (h) => KATEGORI_URUT.indexOf(h.kategori),
		hasil: (h) => h.d1,
		eksekusi: (h) => h.d2,
		kapasitas: (h) => h.d3
	};
	const arahAwal = { peringkat: 'naik', skpd: 'naik', kategori: 'naik', skor: 'turun', hasil: 'turun', eksekusi: 'turun', kapasitas: 'turun' };

	function urutkan(kolom) {
		if (urut.kolom === kolom) urut = { kolom, arah: urut.arah === 'naik' ? 'turun' : 'naik' };
		else urut = { kolom, arah: arahAwal[kolom] };
	}
	const arrow = (kolom) => (urut.kolom === kolom ? (urut.arah === 'naik' ? '▲' : '▼') : '');
	const kelasTh = 'cursor-pointer select-none whitespace-nowrap hover:text-[color:var(--primary)]';

	let baris = $derived.by(() => {
		const kata = q.trim().toLowerCase();
		const r = hasil.filter(
			(h) =>
				aktif.includes(h.kategori) &&
				(!kata || h.skpd.toLowerCase().includes(kata))
		);
		const f = nilai[urut.kolom];
		const faktor = urut.arah === 'naik' ? 1 : -1;
		return [...r].sort((a, b) => {
			const va = f(a);
			const vb = f(b);
			if (typeof va === 'string') return va.localeCompare(vb, 'id') * faktor;
			return (va - vb) * faktor || a.peringkat - b.peringkat;
		});
	});

	function toggle(k) {
		aktif = aktif.includes(k) ? aktif.filter((x) => x !== k) : [...aktif, k];
	}
	function reset() {
		aktif = KATEGORI_URUT;
	}
	function toggleBuka(no) {
		const akanBuka = !buka.includes(no);
		buka = akanBuka ? [...buka, no] : buka.filter((x) => x !== no);
		if (akanBuka) {
			// Pastikan rincian yang dibuka langsung terlihat (tidak terpotong)
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					const el = document.querySelector(`[data-detail="${no}"]`);
					el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
				})
			);
		}
	}
	const lebar = (v, maks) => Math.max(6, Math.min(100, (v / maks) * 100));

	const warnaDim = { D1: 'var(--dim-hasil)', D2: 'var(--dim-eksekusi)', D3: 'var(--dim-kapasitas)' };
	const indInfo = (key) => INDIKATOR.find((i) => i.key === key);
	const skorDim = (h, kode) => (kode === 'D1' ? h.d1 : kode === 'D2' ? h.d2 : h.d3);
	const rataDim = (kode) => (kode === 'D1' ? RATA_DIM.d1 : kode === 'D2' ? RATA_DIM.d2 : RATA_DIM.d3);

	// Nilai dianggap di bawah rata-rata → merah
	const merah = (v, r) => v !== null && v !== undefined && r !== null && v < r;
</script>

{#snippet panel(h, d)}
	{@const sd = skorDim(h, d.kode)}
	{@const rd = rataDim(d.kode)}
	<div class="flex flex-col rounded-lg border bg-white p-3.5">
		<div class="mb-2.5 flex items-center gap-2 border-b pb-2">
			<span class="h-3 w-3 shrink-0 rounded-sm" style="background:{d.warna}"></span>
			<span class="text-[14px] font-semibold">{d.nama}</span>
			<span
				class="tnum ml-auto text-[15px] font-bold"
				style="color:{merah(sd, rd) ? 'var(--kat-kurang)' : d.warna}">{num(sd, 2)}</span
			>
		</div>
		<div
			class="grid flex-1 content-center gap-2 {d.keys.length > 2
				? 'grid-cols-2 xl:grid-cols-4'
				: 'grid-cols-1'}"
		>
			{#each d.keys as key (key)}
				{@const info = indInfo(key)}
				{@const v = h[key]}
				{@const r = RATA[key]}
				<div class="rounded-md bg-[color:var(--muted)]/70 px-3 py-2.5">
					<div class="text-[11.5px] leading-tight text-muted-foreground" title={info.label}>{info.singkat}</div>
					{#if v === null || v === undefined}
						<div class="mt-1 text-[13px] italic text-muted-foreground">tidak dinilai</div>
					{:else}
						<div class="mt-1 flex items-baseline gap-1">
							<span
								class="tnum text-[20px] font-bold leading-none"
								style="color:{merah(v, r) ? 'var(--kat-kurang)' : 'var(--foreground)'}"
								>{v.toLocaleString('id-ID')}</span
							>
							<span class="whitespace-nowrap text-[11px] text-muted-foreground">{info.unit}</span>
						</div>
						<div class="mt-1 whitespace-nowrap text-[11px] text-muted-foreground">rata-rata {num(r, 2)}</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/snippet}


<Card class="break-inside-avoid kartu-hover">
	<CardHeader>
		<CardTitle class="judul-kartu">Peringkat &amp; Skor Kinerja SKPD</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="no-print mb-3 flex flex-wrap items-center gap-2">
			<Input class="h-9 min-w-[200px] flex-1" placeholder="Cari SKPD..." bind:value={q} />
			{#each KATEGORI_URUT as k (k)}
				<button
					type="button"
					onclick={() => toggle(k)}
					class="cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors {aktif.includes(k)
						? 'border-transparent bg-[color:var(--primary)] text-white'
						: 'bg-white text-muted-foreground hover:bg-[color:var(--accent)]'}"
				>
					<span class="mr-1.5 inline-block h-2 w-2 rounded-sm" style="background:{KATEGORI_WARNA[k]}"></span>
					{k} ({ringkas.kategori[k]})
				</button>
			{/each}
			<button
				type="button"
				onclick={reset}
				class="cursor-pointer rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-[color:var(--accent)]"
			>
				Tampilkan semua
			</button>
		</div>

		<div class="mb-2 text-[11px] text-muted-foreground sm:hidden">
			← Geser tabel ke samping untuk melihat kolom lainnya →
		</div>
		<div class="print-full max-h-[700px] min-w-0 overflow-auto rounded-md border">
			<Table class="text-sm">
				<TableHeader class="sticky top-0 z-10 bg-white">
					<TableRow class="hover:bg-white">
						<TableHead rowspan="2" class="w-[74px] align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('peringkat')}>
								Peringkat {arrow('peringkat')}
							</button>
						</TableHead>
						<TableHead rowspan="2" class="align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('skpd')}>SKPD {arrow('skpd')}</button>
						</TableHead>
						<TableHead rowspan="2" class="text-right align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('skor')}>Skor {arrow('skor')}</button>
						</TableHead>
						<TableHead rowspan="2" class="align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('kategori')}>
								Kategori {arrow('kategori')}
							</button>
						</TableHead>
						<TableHead colspan="3" class="border-b text-center">Skor Dimensi (0–100)</TableHead>
					</TableRow>
					<TableRow class="hover:bg-white">
						<TableHead class="text-center">
							<button type="button" class={kelasTh} onclick={() => urutkan('hasil')}>Hasil {arrow('hasil')}</button>
						</TableHead>
						<TableHead class="text-center">
							<button type="button" class={kelasTh} onclick={() => urutkan('eksekusi')}>Eksekusi {arrow('eksekusi')}</button>
						</TableHead>
						<TableHead class="text-center">
							<button type="button" class={kelasTh} onclick={() => urutkan('kapasitas')}>Kapasitas {arrow('kapasitas')}</button>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each baris as h (h.no)}
						{@const terbuka = buka.includes(h.no)}
						<TableRow
							class="cursor-pointer {terbuka ? 'bg-[color:var(--accent)]/50' : ''}"
							onclick={() => toggleBuka(h.no)}
							title="Klik untuk melihat rincian nilai indikator"
						>
							<TableCell class="tnum font-bold text-[color:var(--primary)]">
								{Math.round(h.peringkat)}{#if h.seri}<span class="ml-0.5 align-super text-[9px] font-normal text-muted-foreground">seri</span>{/if}
							</TableCell>
							<TableCell class="min-w-[220px] max-w-[440px]">
								<div class="flex items-center gap-1.5">
									<svg
										class="h-3 w-3 shrink-0 text-muted-foreground transition-transform {terbuka ? 'rotate-90' : ''}"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
										stroke-linecap="round" stroke-linejoin="round"
									>
										<path d="M9 6l6 6-6 6" />
									</svg>
									<div class="leading-snug">{h.skpd}</div>
								</div>
							</TableCell>
							<TableCell class="tnum text-right font-bold">{num(h.skor, 2)}</TableCell>
							<TableCell>
								<span
									class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
									style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span
								>
							</TableCell>
							{#each DIMENSI as d (d.kode)}
								<TableCell>
									<div class="flex items-center justify-center gap-1.5">
										<span class="tnum w-[52px] shrink-0 text-right text-[12.5px] font-semibold">{num(skorDim(h, d.kode), 2)}</span>
										<span class="h-1.5 w-6 shrink-0 overflow-hidden rounded-full bg-[#e6edf6]">
											<span class="bilah block h-full rounded-full" style="width:{lebar(skorDim(h, d.kode), 110)}%;background:{d.warna}"></span>
										</span>
									</div>
								</TableCell>
							{/each}
						</TableRow>

						{#if terbuka}
							<TableRow class="hover:bg-transparent" data-detail={h.no}>
								<TableCell colspan="7" class="p-0">
									<div class="anim-muncul border-l-4 bg-[color:var(--muted)]/60 p-4" style="border-color:var(--primary)">
										<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
											<div class="min-w-0">
												<div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
													Rincian nilai indikator — sebelum normalisasi
												</div>
												<div class="text-base font-semibold text-foreground">{h.skpd}</div>
												<div class="mt-0.5 text-[12px] text-muted-foreground">
													Cakupan data {h.cakupan}/10 indikator
												</div>
											</div>
											<div class="flex items-center gap-3">
												<div class="text-right">
													<div class="text-[11px] uppercase tracking-wide text-muted-foreground">Skor akhir</div>
													<div class="tnum text-2xl font-extrabold leading-none text-[color:var(--primary)]">{num(h.skor, 2)}</div>
												</div>
												<span class="rounded-full px-3 py-1 text-sm font-semibold text-white" style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span>
											</div>
										</div>

										<div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
											<div class="flex flex-col gap-3">
												{@render panel(h, DIMENSI[0])}
												{@render panel(h, DIMENSI[1])}
											</div>
											{@render panel(h, DIMENSI[2])}
										</div>

										<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
											<span class="flex items-center gap-1.5">
												<i class="inline-block h-2 w-2 rounded-full" style="background:var(--kat-kurang)"></i>
												merah = nilai di bawah rata-rata SKPD pada indikator tersebut
											</span>
											<span><i>tidak dinilai</i> = sel kosong pada sumber, tidak diikutkan dalam skor</span>
										</div>
									</div>
								</TableCell>
							</TableRow>
						{/if}
					{:else}
						<TableRow class="hover:bg-white">
							<TableCell colspan="7" class="py-6 text-center text-muted-foreground">Tidak ada SKPD yang cocok dengan filter.</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>

		<div class="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
			<span class="flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--dim-hasil)]"></i>Hasil (capaian kinerja)</span>
			<span class="flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--dim-eksekusi)]"></i>Eksekusi (realisasi keuangan)</span>
			<span class="flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--dim-kapasitas)]"></i>Kapasitas &amp; kepatuhan</span>
			<span class="no-print">· klik judul kolom untuk mengurutkan · klik baris untuk rincian</span>
		</div>
	</CardContent>
</Card>
