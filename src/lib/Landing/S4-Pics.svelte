<script>
	// @ts-nocheck

	import lqip from '../pics/lectures/1.jpg?lqip';
	import lqip2 from '../pics/lectures/2.jpg?lqip';
	import lqip3 from '../pics/lectures/3.jpg?lqip';
	import lqip4 from '../pics/lectures/4.jpg?lqip';
	import lqip5 from '../pics/lectures/5.jpg?lqip';
	import lqip6 from '../pics/lectures/6.jpg?lqip';

	const lectures = [lqip, lqip2, lqip3, lqip4, lqip5, lqip6];
</script>

<main class="flex min-h-[60%] flex-col items-center bg-[#f7f3f7] pb-10">
	<header class="mb-4 mt-8 py-5 text-center">
		<h1 class="text-lg">DIVINITY IN HIS SMILE</h1>
		<h2 class="text-4xl font-bold">H.G. Savyasachi Prabhu Ji in Lectures</h2>
	</header>
	<section class="grid max-w-7xl grid-cols-1 gap-10 p-10 sm:grid-cols-2 lg:grid-cols-3">
		{#each lectures as lqip}
			<div class="inline-block h-[200px] w-[350px] overflow-hidden rounded-md bg-white shadow">
				<img
					src={lqip.src}
					width={lqip.width}
					height={lqip.height}
					style="background-image: url('{lqip.lqip}'); background-size: cover;"
					alt="Lecture"
					class="rounded transition duration-700 hover:scale-125"
					loading="lazy"
				/>
			</div>
		{/each}
	</section>
</main>

<!-- <style>
    main {
      background-image: url('/path/to/background-pattern.png');
      background-size: cover;
    }
  </style> -->
