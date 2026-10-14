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
	import { KATEGORI_URUT, KATEGORI_WARNA } from '#lib/skoring.js';
	import { num } from '#lib/utils.js';

	let { hasil, ringkas } = $props();

	let q = $state('');
	let aktif = $state(KATEGORI_URUT);
	let buka = $state([]);
	let urut = $state({ kolom: 'peringkat', arah: 'naik' });

	// Nilai yang dipakai untuk pengurutan tiap kolom
	const nilai = {
		peringkat: (h) => h.peringkat,
		skpd: (h) => h.namaPendek,
		skor: (h) => h.skor,
		kategori: (h) => KATEGORI_URUT.indexOf(h.kategori),
		hasil: (h) => h.d1,
		eksekusi: (h) => h.d2,
		kapasitas: (h) => h.d3
	};
	// Arah pertama saat kolom diklik
	const arahAwal = { peringkat: 'naik', skpd: 'naik', kategori: 'naik', skor: 'turun', hasil: 'turun', eksekusi: 'turun', kapasitas: 'turun' };

	function urutkan(kolom) {
		if (urut.kolom === kolom) {
			urut = { kolom, arah: urut.arah === 'naik' ? 'turun' : 'naik' };
		} else {
			urut = { kolom, arah: arahAwal[kolom] };
		}
	}
	function arrow(kolom) {
		return urut.kolom === kolom ? (urut.arah === 'naik' ? '▲' : '▼') : '';
	}
	const kelasTh = 'cursor-pointer select-none whitespace-nowrap hover:text-[color:var(--primary)]';

	let baris = $derived.by(() => {
		const kata = q.trim().toLowerCase();
		const r = hasil.filter(
			(h) =>
				aktif.includes(h.kategori) &&
				(!kata ||
					h.skpd.toLowerCase().includes(kata) ||
					h.namaPendek.toLowerCase().includes(kata))
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
		buka = buka.includes(no) ? buka.filter((x) => x !== no) : [...buka, no];
	}
	function lebar(v, maks) {
		return Math.max(6, Math.min(100, (v / maks) * 100));
	}

	const warnaDim = { D1: 'var(--dim-hasil)', D2: 'var(--dim-eksekusi)', D3: 'var(--dim-kapasitas)' };

	const PENDEK = {
		capaian: 'Capaian Kinerja',
		keuangan: 'Realisasi Keuangan',
		E: 'Indeks Inovasi',
		F: 'Kematangan PD',
		G: 'Indeks SPBE',
		H: 'Nilai SAKIP'
	};
	const UNIT = { capaian: '%', keuangan: '%', E: 'poin', F: 'poin', G: 'skala 0–5', H: '0–100' };

	function grupDetail(h) {
		return [
			{ kode: 'D1', nama: 'Hasil Kinerja', warna: warnaDim.D1, skor: h.d1, maks: 110, keys: ['capaian'] },
			{ kode: 'D2', nama: 'Eksekusi Anggaran', warna: warnaDim.D2, skor: h.d2, maks: 100, keys: ['keuangan'] },
			{ kode: 'D3', nama: 'Kapasitas & Tata Kelola', warna: warnaDim.D3, skor: h.d3, maks: 100, keys: ['E', 'F', 'G', 'H'] }
		];
	}
	const nilaiAsli = (h, key) => h[key];
	const nilaiSkor = (h, key) => h.s[key];
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="text-base text-[color:var(--primary)]">Peringkat &amp; Skor Kinerja SKPD</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="no-print mb-3 flex flex-wrap items-center gap-2">
			<Input class="h-9 min-w-[200px] flex-1" placeholder="Cari SKPD..." bind:value={q} />
			{#each KATEGORI_URUT as k (k)}
				<button
					type="button"
					onclick={() => toggle(k)}
					class="cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors {aktif.includes(k)
						? 'border-transparent bg-[color:var(--primary)] text-white'
						: 'bg-white text-muted-foreground hover:bg-[color:var(--accent)]'}"
				>
					<span class="mr-1.5 inline-block h-2 w-2 rounded-sm" style="background:{KATEGORI_WARNA[k]}"
					></span>
					{k} ({ringkas.kategori[k]})
				</button>
			{/each}
			<button
				type="button"
				onclick={reset}
				class="cursor-pointer rounded-full border bg-white px-3 py-1 text-xs text-muted-foreground hover:bg-[color:var(--accent)]"
			>
				Tampilkan semua
			</button>
		</div>

		<div class="print-full max-h-[470px] min-w-0 overflow-auto rounded-md border">
			<Table class="text-[13px]">
				<TableHeader class="sticky top-0 z-10 bg-white">
					<TableRow class="hover:bg-white">
						<TableHead rowspan="2" class="w-[74px] align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('peringkat')}>
								Peringkat {arrow('peringkat')}
							</button>
						</TableHead>
						<TableHead rowspan="2" class="align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('skpd')}>
								SKPD {arrow('skpd')}
							</button>
						</TableHead>
						<TableHead rowspan="2" class="text-right align-middle">
							<button type="button" class={kelasTh} onclick={() => urutkan('skor')}>
								Skor {arrow('skor')}
							</button>
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
							<button type="button" class={kelasTh} onclick={() => urutkan('hasil')}>
								Hasil {arrow('hasil')}
							</button>
						</TableHead>
						<TableHead class="text-center">
							<button type="button" class={kelasTh} onclick={() => urutkan('eksekusi')}>
								Eksekusi {arrow('eksekusi')}
							</button>
						</TableHead>
						<TableHead class="text-center">
							<button type="button" class={kelasTh} onclick={() => urutkan('kapasitas')}>
								Kapasitas {arrow('kapasitas')}
							</button>
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
							<TableCell class="tnum font-bold text-[color:var(--primary)]"
								>{Math.round(h.peringkat)}{#if h.seri}<span
										class="ml-0.5 align-super text-[9px] font-normal text-muted-foreground"
										>seri</span
									>{/if}</TableCell
							>
							<TableCell class="max-w-[210px]">
								<div class="flex items-center gap-1.5">
									<svg
										class="h-3 w-3 shrink-0 text-muted-foreground transition-transform {terbuka
											? 'rotate-90'
											: ''}"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M9 6l6 6-6 6" />
									</svg>
									<div class="truncate" title={h.skpd}>{h.namaPendek}</div>
								</div>
							</TableCell>
							<TableCell class="tnum text-right font-bold">{num(h.skor, 2)}</TableCell>
							<TableCell>
								<span
									class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
									style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span
								>
							</TableCell>
							{#each grupDetail(h) as d (d.kode)}
								<TableCell>
									<div class="flex items-center justify-center gap-1.5">
										<span class="tnum w-8 text-right text-[12.5px] font-semibold">{num(d.skor, 2)}</span>
										<span class="h-1.5 w-7 shrink-0 overflow-hidden rounded-full bg-[#e6edf6]">
											<span
												class="block h-full rounded-full"
												style="width:{lebar(d.skor, d.maks)}%;background:{d.warna}"
											></span>
										</span>
									</div>
								</TableCell>
							{/each}
						</TableRow>

						{#if terbuka}
							<TableRow class="hover:bg-transparent">
								<TableCell colspan="7" class="p-0">
									<div class="border-l-4 bg-[color:var(--muted)]/70 p-4" style="border-color:var(--primary)">
										<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
											<div>
												<div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
													Rincian nilai indikator — sebelum normalisasi
												</div>
												<div class="text-sm font-semibold text-foreground">{h.skpd}</div>
											</div>
											<div class="flex items-center gap-3">
												<div class="text-right">
													<div class="text-[10px] uppercase tracking-wide text-muted-foreground">Skor akhir</div>
													<div class="tnum text-lg font-extrabold leading-none text-[color:var(--primary)]">
														{num(h.skor, 2)}
													</div>
												</div>
												<span
													class="rounded-full px-3 py-1 text-xs font-semibold text-white"
													style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span
												>
											</div>
										</div>

										<div class="grid gap-3 md:grid-cols-3">
											{#each grupDetail(h) as d (d.kode)}
												<div class="flex flex-col rounded-lg border bg-white p-3">
													<div class="mb-2 flex items-center gap-2 border-b pb-2">
														<span class="h-2.5 w-2.5 shrink-0 rounded-sm" style="background:{d.warna}"></span>
														<span class="text-[12.5px] font-semibold">{d.nama}</span>
														<span class="tnum ml-auto text-[12.5px] font-bold" style="color:{d.warna}"
															>{num(d.skor, 2)}</span
														>
													</div>
													<div
														class="grid flex-1 content-center gap-2 {d.keys.length > 2
															? 'grid-cols-2'
															: 'grid-cols-1'}"
													>
														{#each d.keys as key (key)}
															<div class="rounded-md bg-[color:var(--muted)]/70 px-2.5 py-2">
																<div class="truncate text-[10.5px] leading-tight text-muted-foreground">
																	{PENDEK[key]}
																</div>
																<div class="mt-1 flex items-baseline gap-1">
																	<span class="tnum text-[15px] font-bold text-foreground"
																		>{nilaiAsli(h, key).toLocaleString('id-ID')}</span
																	>
																	<span class="whitespace-nowrap text-[10px] text-muted-foreground"
																		>{UNIT[key]}</span
																	>
																</div>
																<div class="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground">
																	skor <span class="tnum">{num(nilaiSkor(h, key), 2)}</span>{key === 'G'
																		? ' · TW II'
																		: ''}
																</div>
															</div>
														{/each}
													</div>
												</div>
											{/each}
										</div>
									</div>
								</TableCell>
							</TableRow>
						{/if}
					{:else}
						<TableRow class="hover:bg-white"
							><TableCell colspan="7" class="py-6 text-center text-muted-foreground"
								>Tidak ada SKPD yang cocok dengan filter.</TableCell
							></TableRow
						>
					{/each}
				</TableBody>
			</Table>
		</div>

		<div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
			<span class="flex items-center gap-1.5"
				><i class="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--dim-hasil)]"></i>Hasil (capaian kinerja)</span
			>
			<span class="flex items-center gap-1.5"
				><i class="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--dim-eksekusi)]"></i>Eksekusi (realisasi keuangan)</span
			>
			<span class="flex items-center gap-1.5"
				><i class="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--dim-kapasitas)]"></i>Kapasitas</span
			>
			<span class="no-print">· klik judul kolom untuk mengurutkan · klik baris untuk rincian</span>
		</div>
	</CardContent>
</Card>
