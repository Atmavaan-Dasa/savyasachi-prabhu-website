<script>
	import { onMount } from 'svelte';

	onMount(() => {
		// Replace 'https://example.com' with the URL you want to redirect to
		window.location.href = 'https://savyasachidas.neocities.org/audio';
	});
</script>

<section class="flex max-h-[100px] justify-center py-10">
	<!-- Optionally, you can add content here that will be shown briefly before the redirect occurs -->
	<div
		class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
		role="status"
	>
		<span
			class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
			>Loading...</span
		>
	</div>
	<div class="">Redirecting ...</div>
</section>
