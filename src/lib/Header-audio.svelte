<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	// @ts-ignore
	import foot from '$lib/pics/logo.webp?w=500;700;900;1200&as=srcset';
	// @ts-ignore
	import lqip from '$lib/pics/logo.webp?lqip';
	let isOpen = false;
	import { SquarePlay } from 'lucide-svelte';
	import { HardDrive } from 'lucide-svelte';
	import { TriangleAlert } from 'lucide-svelte';

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

<nav class="sticky top-0 z-[100] bg-blue-50 shadow rounded-b-xl">
	<!-- <nav class="sticky top-0 z-[100] bg-[#FAEEF4] shadow"> -->
	<div class=" mx-auto px-6 py-4">
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
				<div class="ml-3 flex flex-col justify-center ">
				<div class="">	
					HG Savyasachi Prabhu
				</div>
				<div class="text-sm font-light">
					Audio Archives
				</div>
				
				</div>
			</a>

			<!-- Mobile menu button -->
			<div class="flex">
				<button on:click={toggleMenu} type="button" class="text-[#322037]" aria-label="toggle menu">
					{#if !isOpen}
						<div class=" flex items-center">
							<div class=" mr-2 text-sm">Help</div>
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
						</div>
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
				class="absolute inset-x-0 z-20 mt-4 w-full rounded-b-lg bg-white px-6 py-6 shadow transition-all duration-300 ease-in-out"
			>
				<b>Search Help:</b>
				<div class="mb-4">
					Type &lt;30 for lectures less than 30 min long; ct:Bg7. for scripture/chapter/verse;
					yr:2009 for year; You can also input multiple partial words separated by space, e.g. type
					bhaktivi &lt;40 indi to get all lectures on Bhaktivinoda less than 40 min long and given
					in India.
				</div>
				<b class="">Categories: </b>
				<div class="">Bg, SB, CC, AL, VAD, SEM, NoI, Youth, FEST.</div>
				<div class="my-6 flex">
					<a
						href="https://drive.google.com/drive/folders/10mOlseGvPAT-9LO0Akd0w7QCQvKiYCmM"
						target="_blank"
						class=" mr-4 flex items-center underline md:mx-4"
					>
						<HardDrive />
						<div class="ml-1 text-lg">Google Drive</div>
					</a>
					<a
						href="https://docs.google.com/forms/d/e/1FAIpQLSfu-SFSafOxC0jZeqlSsFh9OVRSZU04fnKxrijO63o9Q8eOqA/viewform?usp=sf_link"
						target="_blank"
						class=" mr-4 flex items-center underline md:mx-4"
					>
						<TriangleAlert />
						<div class="ml-1 text-lg">Feedback</div>
					</a>
					<a
						href="https://savyasachidas.neocities.org/help.html"
						target="_blank"
						class="flex items-center underline md:mx-4"
					>
						<SquarePlay />
						<div class="ml-1 text-lg">Help</div>
					</a>
				</div>
				<div class="flex">
					<a
						class="my-2 mr-4 transform text-[#322037] underline transition-colors duration-300 md:mx-4 md:my-0"
						href="/">Home</a
					>
					<a
						class="my-2 mr-4 transform text-[#322037] underline transition-colors duration-300 md:mx-4 md:my-0"
						target="_blank"
						href="/audio">Lectures</a
					>
					<a
						class="my-2 transform text-[#322037] underline transition-colors duration-300 md:mx-4 md:my-0"
						href="/">Contact</a
					>
				</div>
			</div>
		{/if}

		<!-- Desktop Menu -->
		<!-- <div class="hidden md:flex md:w-auto md:items-center">
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
		</div> -->
	</div>
</nav>
