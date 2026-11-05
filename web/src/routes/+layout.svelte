<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { dataSkor, muatData } from '#lib/data-skor.svelte.js';
	import { unduhXlsx, unduhPdf } from '#lib/ekspor.js';
	import { Button } from '#lib/components/ui/button';

	let { children } = $props();

	onMount(muatData);

	const ringkas = $derived(dataSkor.ringkas);
	const waktu = $derived(
		new Date(dataSkor.diambil).toLocaleString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	);
	const jalur = $derived(page.url.pathname);
	const diRingkasan = $derived(!jalur.startsWith('/peringkat'));

	let proses = $state(null);

	async function onXlsx() {
		if (proses) return;
		proses = 'xlsx';
		try {
			await unduhXlsx(dataSkor.hasil);
		} finally {
			proses = null;
		}
	}

	async function onPdf() {
		if (proses) return;
		proses = 'pdf';
		try {
			const k = dataSkor.kuadran;
			await unduhPdf({ hasil: k.hasil, ringkas: dataSkor.ringkas, xBar: k.xBar, yBar: k.yBar });
		} finally {
			proses = null;
		}
	}
</script>

<svelte:head>
	<title>Penilaian Kinerja SKPD — Pemprov Sulawesi Barat</title>
	<meta name="description" content="Penilaian kinerja SKPD — Pemerintah Provinsi Sulawesi Barat" />
</svelte:head>

<!-- Navigasi utama (sticky) -->
<div class="topbar no-print">
	<div class="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-2.5 sm:px-6">
		<a href="/" class="flex min-w-0 items-center gap-2.5">
			<img src="/lambang-sulbar.svg" alt="" class="h-8 w-auto shrink-0" />
			<span class="hidden min-w-0 flex-col leading-tight sm:flex">
				<span class="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Pemprov Sulawesi Barat</span>
				<span class="truncate text-[13px] font-extrabold text-[color:var(--primary)]">Penilaian Kinerja SKPD</span>
			</span>
		</a>

		<nav class="ml-1 flex items-center gap-1 sm:ml-4" aria-label="Halaman">
			<a href="/" class="nav-tab {diRingkasan ? 'aktif' : ''}" aria-current={diRingkasan ? 'page' : undefined}>
				<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="3" y="3" width="7" height="9" rx="1" />
					<rect x="14" y="3" width="7" height="5" rx="1" />
					<rect x="14" y="12" width="7" height="9" rx="1" />
					<rect x="3" y="16" width="7" height="5" rx="1" />
				</svg>
				Ringkasan
			</a>
			<a href="/peringkat/" class="nav-tab {!diRingkasan ? 'aktif' : ''}" aria-current={!diRingkasan ? 'page' : undefined}>
				<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
				</svg>
				Peringkat
			</a>
		</nav>

	</div>
</div>

<div class="mx-auto max-w-[1240px] px-4 py-5 sm:px-6" data-laporan>
	<header class="hero">
		<div class="relative z-10 grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-center">
			<div>
				<p class="eyebrow terang">Pemerintah Provinsi Sulawesi Barat</p>
				<h1 class="hero-judul">Penilaian Kinerja SKPD</h1>
				<p class="hero-sub">Capaian Kinerja Triwulan III · indeks komposit non-kompensatoris</p>
				<div class="mt-3 flex flex-wrap gap-1.5">
					<span class="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold">10 indikator · 3 dimensi</span>
					<span class="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold">Skala 0–100</span>
					<span class="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold">{ringkas.jumlah} SKPD</span>
				</div>
			</div>

			<div class="flex flex-col items-start gap-3 lg:items-end">
				<div class="flex items-center gap-3">
					<img src="/lambang-sulbar.svg" alt="Lambang Provinsi Sulawesi Barat" class="h-14 w-auto shrink-0 drop-shadow-md sm:h-16" />
					<div>
						<p class="text-sm font-semibold italic">“Sulbar Maju dan Sejahtera”</p>
						<p class="mt-0.5 text-[11px] text-white/70">Data per {waktu} WITA</p>
					</div>
				</div>
				<div class="no-print flex flex-wrap gap-2">
					<Button
						class="border-transparent bg-[#1f7a41] text-white shadow-sm hover:bg-[#186634] disabled:opacity-60"
						onclick={onXlsx}
						disabled={proses !== null}
						title="Unduh seluruh data sebagai berkas Excel"
					>
						{#if proses === 'xlsx'}
							<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="4" />
								<path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
							</svg>
							Menyiapkan…
						{:else}
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
							</svg>
							Unduh XLSX
						{/if}
					</Button>
					<Button
						class="border-transparent bg-[#c0392b] text-white shadow-sm hover:bg-[#a93226] disabled:opacity-60"
						onclick={onPdf}
						disabled={proses !== null}
						title="Unduh laporan sebagai PDF"
					>
						{#if proses === 'pdf'}
							<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="4" />
								<path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
							</svg>
							Menyiapkan…
						{:else}
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<path d="M14 2v6h6" />
								<path d="M8 13h8M8 17h5" />
							</svg>
							Unduh PDF
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</header>

	{@render children?.()}

	<footer class="mt-8 text-center text-xs text-muted-foreground">
		Pemerintah Provinsi Sulawesi Barat — Sulbar Maju dan Sejahtera
	</footer>
</div>
