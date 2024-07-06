<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	// @ts-ignore
	import foot from '$lib/pics/logo.webp?w=500;700;900;1200&as=srcset';
	// @ts-ignore
	import lqip from '$lib/pics/logo.webp?lqip';
	let isOpen = false;

	const toggleMenu = () => {
		isOpen = !isOpen;
	};

	const closeMenu = () => {
		isOpen = false;
	};

	onMount(() => {
		// Attach a listener to close the menu when clicking a link
		const links = document.querySelectorAll('nav a');
		links.forEach((link) => {
			link.addEventListener('click', closeMenu);
		});
	});
</script>

<nav class="sticky top-0 z-[100] bg-[#FAEEF4] shadow">
	<div class="container mx-auto px-6 py-4 md:flex md:items-center md:justify-between">
		<div class="flex items-center justify-between">
			<a
				href="/"
				class={isOpen
					? 'flex  items-center text-xl font-bold md:pb-0'
					: 'flex items-center text-xl font-bold'}
			>
				<picture>
					<source srcset={foot} type="image/webp" />
					<img
						src={lqip.src}
						width={lqip.width}
						height={lqip.height}
						style="background-image: url('{lqip.lqip}'); background-size: cover;"
						class="h-[3rem] w-auto"
						loading="lazy"
						alt=""
					/>
				</picture>
				<div class="ml-3 flex flex-col justify-center">
					<div class="">HG Savyasachi Prabhu</div>
					<div class="text-sm font-light">ISKCON Bhopal</div>
				</div>
			</a>

			<!-- Mobile menu button -->
			<div class="flex lg:hidden">
				<button on:click={toggleMenu} type="button" class="text-[#322037]" aria-label="toggle menu">
					{#if !isOpen}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Menu -->
		{#if isOpen}
			<div
				transition:slide
				class="absolute inset-x-0 z-20 w-full bg-white px-6 py-4 transition-all duration-300 ease-in-out md:hidden"
			>
				<div class="flex flex-col md:mx-6 md:flex-row">
					<a
						class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
						href="/">Home</a
					>
					<a
						class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
						target="_blank"
						href="/audio">Lectures</a
					>
					<a
						class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
						href="/">Contact</a
					>
				</div>
			</div>
		{/if}

		<!-- Desktop Menu -->
		<div class="hidden md:flex md:w-auto md:items-center">
			<div class="flex flex-col md:mx-6 md:flex-row">
				<a
					class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
					href="/">Home</a
				>
				<a
					class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
					target="_blank"
					href="/audio">Lectures</a
				>
				<a
					class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
					href="/">Contact</a
				>
			</div>
		</div>
	</div>
</nav>
