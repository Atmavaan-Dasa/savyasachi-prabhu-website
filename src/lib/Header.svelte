<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

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
			<a href="/" class="text-2xl font-bold"> H.G. Savyasaci Prabhu </a>

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
						href="/audio">Lectures</a
					>
					<a
						class="my-2 transform text-[#322037] transition-colors duration-300 md:mx-4 md:my-0"
						href="/">Contact</a
					>
				</div>

				<div class="flex justify-center md:block">
					<a
						class="relative transform text-gray-700 transition-colors duration-300 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-300"
						href="/"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span class="absolute left-0 top-0 rounded-full bg-blue-500 p-1 text-xs text-white"
						></span>
					</a>
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

<style>
	/* Add your CSS here if needed */
</style>
