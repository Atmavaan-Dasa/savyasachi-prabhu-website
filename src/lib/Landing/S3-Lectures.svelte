<script lang="ts">
	const videoLinks = [
		'https://www.youtube.com/embed/UVigglyCmoE?si=I46THsADoVoiRubG',
		'https://www.youtube.com/embed/QKQBRWKclD8?si=9KLcj_YQTJbkiP_F',
		'https://www.youtube.com/embed/0yc1qZqmn8U?si=qHukspr3j1l_000L',
		'https://www.youtube.com/embed/Ipn4rRFFwE8?si=AgoOjDLtut3oWl_V',
		'https://www.youtube.com/embed/yikbaBS9tCU?si=PNpCzC8jVciUo-uy',
		'https://www.youtube.com/embed/R0dOVxX6DyA?si=9id53z1y2-MVZvJG'
	];

	$: loaded = Array(videoLinks.length).fill(false);

	function handleLoaded(index: any) {
		loaded[index] = true;
	}
</script>

<main class="flex min-h-[70%] flex-col items-center bg-white py-10">
	<header class="mb-4 mt-8 py-10 text-center">
		<h1 class="text-lg">Prominent</h1>
		<h2 class="text-4xl font-bold">Lectures from H.G. Savyasachi Prabhu Ji</h2>
	</header>
	<section class="grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
		{#each videoLinks as videoLink, index}
			<div class="relative rounded bg-white shadow">
				{#if !loaded[index]}
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="h-[250px] w-full animate-pulse rounded bg-gray-300"></div>
					</div>
				{/if}

				<div>
					<iframe
						width="350"
						height="250"
						loading="lazy"
						on:load={() => handleLoaded(index)}
						src={videoLink}
						class="rounded-md"
						title="YouTube video player"
						frameborder="0"
						allowfullscreen
					></iframe>
				</div>
			</div>
		{/each}
	</section>
</main>
