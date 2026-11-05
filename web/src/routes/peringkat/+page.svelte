<script>
	import { onMount } from 'svelte';
	import { dataSkor, muatData } from '#lib/data-skor.svelte.js';
	import Podium from '#lib/components/Podium.svelte';
	import PapanPeringkat from '#lib/components/PapanPeringkat.svelte';

	onMount(muatData);

	const hasil = $derived(dataSkor.hasil);
	const ringkas = $derived(dataSkor.ringkas);
	const top3 = $derived([...hasil].sort((a, b) => a.peringkat - b.peringkat).slice(0, 3));
</script>

<svelte:head>
	<title>Peringkat — Penilaian Kinerja SKPD</title>
</svelte:head>

<section class="mt-4">
	<Podium tiga={top3} />
</section>

<section class="mt-4">
	<PapanPeringkat {hasil} {ringkas} />
</section>
