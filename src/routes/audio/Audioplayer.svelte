<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import VirtualList from 'svelte-tiny-virtual-list';
	import HeaderAudio from '$lib/Header-audio.svelte';
	import {
		Share2Icon,
		Download,
		Filter,
		ArrowDownNarrowWide,
		ArrowUpFromLine,
		ArrowDownFromLine
	} from 'lucide-svelte';
	import { data } from '$lib/utils/output.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import DropdownMenuItem from '$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte';
	import DropdownMenuSeparator from '$lib/components/ui/dropdown-menu/dropdown-menu-separator.svelte';
	// export let data;
	// data = data.data;
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	let sortOption = 'date'; // Default sort option
	let sortOrder = 'asc1'; //Default sort order (ascending)

	$: heards = {} as any;

	function exportHeardData() {
		const data = Object.entries(heards)
			.map(([id, heard]) => `${id},${heard ? 'heard' : 'unheard'}`)
			.join('\n');
		const blob = new Blob([data], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'heard_data.txt';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	function importHeardData() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'text/plain';
		input.onchange = async (e: any) => {
			const file = e.target.files[0];
			const text = await file.text();
			const data = text.split('\n');

			const imports: any = {};

			data.forEach((row: any) => {
				const [id, heard] = row.split(',');
				imports[id] = heard === 'heard';
			});

			heards = imports;
			localStorage.setItem('heards', JSON.stringify(heards));
		};
		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	}

	let itemSize = 70;
	let audio: HTMLAudioElement;
	let currentIndex = 0;
	let playbackRate = 1;
	let isPlaying = false;
	let currentTime = 0;
	let currentTitle = '';
	let duration = 0;
	let isLoading = false;
	$: lastPlayedPosition = 0;

	onMount(() => {
		const savedHeards = localStorage.getItem('heards');
		if (savedHeards) {
			heards = JSON.parse(savedHeards);
		}

		audio = new Audio();
		audio.addEventListener('timeupdate', () => {
			currentTime = audio.currentTime;
		});
		audio.addEventListener('loadedmetadata', () => {
			duration = audio.duration;
			isLoading = false;
		});
		audio.addEventListener('ended', nextAudio);
	});

	$: searchTerm = '';

	$: filters = {
		year: {} as Record<string, boolean>,
		location: {} as Record<string, boolean>,
		language: {} as Record<string, boolean>,
		shastra: {} as Record<string, boolean>
	};

	function updateFilter(e: any, filterType: string, filterValue: string) {
		const isChecked = e.target.checked;
		if (!filters[filterType]) {
			filters[filterType] = {};
		}
		filters[filterType][filterValue] = isChecked;
		// Save filters to local storage
	}

	$: filteredData = data
		.filter((item: any) => {
			const term = searchTerm.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').filter(Boolean);
			const matchesSearchTerm = term.every(
				(t) =>
					item.title.toLowerCase().includes(t) ||
					item.details.some((detail: any) => detail.toLowerCase().includes(t))
			);
			const matchesFilters = Object.keys(filters).every((key) => {
				const filter = filters[key];
				return Object.keys(filter).every((filterKey) =>
					filter[filterKey] ? item[key]?.includes(filterKey) : true
				);
			});
			return matchesSearchTerm && matchesFilters;
		})
		.sort((a: any, b: any) => {
			let aValue, bValue;
			switch (sortOption) {
				case 'date':
					aValue = new Date(a.date);
					bValue = new Date(b.date);
					break;
				case 'duration':
					aValue = a.duration;
					bValue = b.duration;
					break;
				case 'heard':
					aValue = heards[a.Id] ? 1 : 0;
					bValue = heards[b.Id] ? 1 : 0;
					break;
				case 'scripture':
					aValue = a.sortId;
					bValue = b.sortId;
					break;
				default:
					return 0;
			}
			if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

	let downloadStates: Record<
		string,
		{
			progress: number;
			totalSize: number;
			downloadedSize: number;
			loading: boolean;
		}
	> = {};

	// Main download function to handle downloading multiple files simultaneously
	async function downloadFile(url: string, filename: string, id: string) {
		try {
			// Initialize state for the download
			downloadStates[id] = {
				progress: 0,
				totalSize: 0,
				downloadedSize: 0,
				loading: true
			};

			const response = await fetch(url);
			if (!response.ok) throw new Error('Download failed');

			const contentLength = response.headers.get('content-length');
			downloadStates[id].totalSize = contentLength ? parseInt(contentLength, 10) : 0;

			const reader = response.body?.getReader();
			const stream = new ReadableStream({
				async start(controller) {
					if (reader) {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							downloadStates[id].downloadedSize += value.byteLength;
							downloadStates[id].progress =
								(downloadStates[id].downloadedSize / downloadStates[id].totalSize) * 100;
							controller.enqueue(value);
						}
					}
					controller.close();
				}
			});

			const blob = await new Response(stream).blob();
			const objectUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = objectUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(objectUrl);

			downloadStates[id].loading = false;
		} catch (error) {
			console.error('Download failed:', error);
			downloadStates[id].loading = false;
		}
	}

	// Trigger download function
	async function handleDownload(fileUrl: string, filename: string, id: string) {
		await downloadFile(fileUrl, filename, id);
	}

	// Example: Usage within a component
	function downloadButtonHandler(itemId: string, fileUrl: string, fileName: string) {
		if (!downloadStates[itemId]?.loading) {
			handleDownload(fileUrl, fileName, itemId);
		}
	}

	function toggleHeard(index: any) {
		const item = filteredData[index];
		heards[item.Id] = !heards[item.Id] || !heards[item.Id];
		localStorage.setItem(`heards`, JSON.stringify(heards));
	}

	function updateSearchTerm(e: any) {
		searchTerm = e.target.value.toLowerCase();
	}

	function updateSortOption(e: any) {
		sortOption = e.target.value;
	}

	function toggleSortOrder() {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
	}

	function playAudio(index: number) {
		const currentData = filteredData.length ? filteredData : data;
		if (!audio.paused || !audio.src) {
			audio.src = currentData[index].audioLink;
			// audio.src = 'https://drive.usercontent.google.com/download?id=1ts1YGFn92OyPkVTYiLx-LOB8FAvq0SkJ&export=open&authuser=0';
			currentTitle = currentData[index].title;
			console.log(audio.src);
		}

		if (!isPlaying && audio.currentTime > 0 && audio.paused) {
			audio.currentTime = lastPlayedPosition;
			audio.play();
			isPlaying = true;
		} else {
			audio.play();
			isPlaying = true;
			isLoading = true;
		}
	}

	function pauseAudio() {
		audio.pause();
		isPlaying = false;
		lastPlayedPosition = audio.currentTime;
	}

	function togglePlayPause() {
		if (isPlaying) {
			pauseAudio();
		} else {
			playAudio(currentIndex);
		}
	}

	function nextAudio() {
		const currentData = filteredData.length ? filteredData : data;
		currentIndex = (currentIndex + 1) % currentData.length;

		playAudio(currentIndex);
	}

	function previousAudio() {
		const currentData = filteredData.length ? filteredData : data;
		currentIndex = (currentIndex - 1 + currentData.length) % currentData.length;

		playAudio(currentIndex);
	}

	function changePlaybackRate(rate: number) {
		audio.playbackRate = rate;
		playbackRate = rate;
	}

	function seekAudio(seconds: number) {
		audio.currentTime += seconds;
	}

	function jumpToTimestamp(e: any) {
		audio.currentTime = e.target.value;
	}

	function updateCurrentTime(e: any) {
		audio.currentTime = e.target.value;
	}
</script>

<HeaderAudio />

<div class="gg flex flex-1 border-b bg-white px-2 py-2 pt-3 shadow-xl">
	<input
		type="text"
		class=" h-[40px] rounded-lg pl-4"
		placeholder="Search items..."
		on:keyup={updateSearchTerm}
	/>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="border-0 p-0" builders={[builder]}>
				<ArrowDownNarrowWide class="mx-2 h-[40px]" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Label>Sort By</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<Button class="ml-2 py-0 font-medium" variant="outline" on:click={toggleSortOrder}>
				{sortOrder === 'asc' ? 'Ascending' : 'Descending'}
			</Button>
			<DropdownMenu.Separator />
			<DropdownMenu.RadioGroup bind:value={sortOption}>
				<DropdownMenu.RadioItem value="date">Date</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="duration">Duration</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="heard">Heard</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="scripture">Scripture</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="border-0 p-0" builders={[builder]}>
				<Filter class="h-[40px]" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="h-[60%] w-56 overflow-y-scroll">
			<ScrollArea>
				<DropdownMenu.Label>Languages</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<div class="grid grid-cols-3">
					{#each Array.from(new Set(data.map((item) => item.language))).filter(Boolean) as language}
						<div>
							<input
								type="checkbox"
								id="language-{language}"
								checked={filters.language[language] || false}
								on:change={(e) => updateFilter(e, 'language', language)}
							/>
							<label for="language-{language}">{language}</label>
						</div>
					{/each}
				</div>

				<DropdownMenu.Label>Category</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<div class="grid grid-cols-3">
					{#each Array.from(new Set(data.map((item) => item.shastra))).filter(Boolean) as shastra}
						<div>
							<input
								type="checkbox"
								id="shastra-{shastra}"
								checked={filters.shastra[shastra] || false}
								on:change={(e) => updateFilter(e, 'shastra', shastra)}
							/>
							<label for="shastra-{shastra}">{shastra}</label>
						</div>
					{/each}
				</div>

				<DropdownMenu.Label>Year</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<div class="grid grid-cols-3">
					{#each Array.from(new Set(data.map((item) => item.year))).filter(Boolean) as year}
						<div>
							<input
								type="checkbox"
								id="year-{year}"
								checked={filters.year[year] || false}
								on:change={(e) => updateFilter(e, 'year', year)}
							/>
							<label for="year-{year}">{year}</label>
						</div>
					{/each}
				</div>

				<DropdownMenu.Label>Location</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<div class="grid grid-cols-1">
					{#each Array.from(new Set(data.map((item) => item.location))).filter(Boolean) as location}
						<div>
							<input
								type="checkbox"
								id="location-{location}"
								checked={filters.location[location] || false}
								on:change={(e) => updateFilter(e, 'location', location)}
							/>
							<label for="location-{location}">{location}</label>
						</div>
					{/each}
				</div>
			</ScrollArea>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<!-- {#if data.length > 0} -->
<div class="list">
	<VirtualList height={660} width="auto" itemCount={filteredData.length} {itemSize}>
		<div
			slot="item"
			let:index
			let:style
			{style}
			class="flex w-full items-center rounded-b-lg border-b-2 bg-[#fbfbfb]  border-blue-50"
		>
			<div class="flex w-[70%] flex-col justify-center md:w-[90%] 2xl:w-[95%]">
				<div class=" relative flex items-center">
					<div class=" ml-3 overflow-x-auto">
						<button
							class=" w-full text-lg font-medium"
							on:click={() => {
								currentIndex = index;
								playAudio(index);
							}}
						>
							<div class=" whitespace-nowrap font-medium text-gray-800">
								{filteredData[index].title}
							</div>
						</button>
					</div>
				</div>
				<div class="top-4 ml-3 text-xs">
					<div class="flex space-x-1">
						<div class=" whitespace-nowrap">
							<!-- <Clock class="w-4 h-4"/>	 -->
							{filteredData[index].duration} min
						</div>

						<!-- <div class="flex">
					
						&middot;
					
						<div class="font-bold ml-1 text-gray-500">{filteredData[index].language}</div>
					</div>
					 -->

						<div class=" whitespace-nowrap font-semibold text-gray-600">
							&middot; {filteredData[index].shastra}
						</div>

						<div class=" whitespace-nowrap">
							{#if filteredData[index].chapter && filteredData[index].shloka && filteredData[index].canto}
								{`${filteredData[index].canto}.${filteredData[index].chapter}.${filteredData[index].shloka}`}
							{:else if filteredData[index].chapter && filteredData[index].shloka}
								{`${filteredData[index].chapter}.${filteredData[index].shloka}`}
							{/if}
						</div>

						<div class=" whitespace-nowrap">
							{#if filteredData[index].location}
								<div class="">
									&middot; {filteredData[index].location}
								</div>
							{/if}
						</div>

						<div class=" whitespace-nowrap">
							{#if filteredData[index].date}
								<div class="">
									&middot; {filteredData[index].dateStr}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
			<div class="mx-3">
				{#if filteredData[index].youtubeLinkExists}
					<a href={filteredData[index].youtubeLink} target="_blank">
						<svg
							role="img"
							class="h-5 w-5 fill-current text-blue-500"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><title>YouTube</title><path
								d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
							/></svg
						>
					</a>
				{:else}
					<button
						on:click={() => {
							currentIndex = index;
							playAudio(index);
						}}
						class="mt-1"
					>
						<svg
							role="img"
							class="h-5 w-5 fill-current text-gray-500"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><title>YouTube</title><path
								d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
							/></svg
						>
					</button>
				{/if}
			</div>
			<div class="flex items-center justify-center">
				<div class="mr-2">
					{#if heards[filteredData[index].Id]}
						<button
							class="rounded-md border border-blue-100 bg-blue-600 px-1 py-1 text-[10px] text-blue-100 shadow-lg shadow-blue-300"
							on:click={() => toggleHeard(index)}>Heard</button
						>
					{:else}
						<button
							class="bg-red-blue rounded-md border border-blue-400 px-1 py-1 text-[10px] text-blue-400 shadow-lg"
							on:click={() => toggleHeard(index)}>Heard</button
						>
					{/if}
				</div>

				<div class=" ml-auto mr-2 md:mr-4">
					{#if downloadStates[filteredData[index].sortId]?.loading}
						<div class="relative inline-block">
							<div class="flex items-center space-x-2">
								<div class=" text-sm">
									{Math.round(downloadStates[filteredData[index].sortId].progress)}%
								</div>
								<svg class="h-5 w-5" viewBox="0 0 36 36">
									<circle
										class="stroke-current text-gray-200"
										stroke-width="4"
										fill="none"
										cx="18"
										cy="18"
										r="15.9155"
									/>
									<path
										class="stroke-current text-blue-300"
										stroke-width="4"
										stroke-dasharray={`${downloadStates[filteredData[index].sortId].progress}, 100`}
										fill="none"
										d="M18 2.0845
							 a 15.9155 15.9155 0 0 1 0 31.831
							 a 15.9155 15.9155 0 0 1 0 -31.831"
									/>
								</svg>
							</div>
						</div>
						<div class="whitespace-nowrap text-xs text-gray-600">
							{Math.round(
								downloadStates[filteredData[index].sortId].downloadedSize / (1024 * 1024)
							)} / {Math.round(
								downloadStates[filteredData[index].sortId].totalSize / (1024 * 1024)
							)} MB
						</div>
					{:else}
						<button
							type="button"
							class="flex items-center rounded-full border border-blue-100 px-2 py-2 text-center shadow-xl"
							on:click={() =>
								downloadButtonHandler(
									filteredData[index].sortId,
									filteredData[index].audioLink,
									`${filteredData[index].title}.mp3`
								)}
							tabIndex={0}
							aria-label={`Download ${filteredData[index].title}.mp3`}
						>
							<Download class="h-4 w-4 text-black" />
						</button>
					{/if}
				</div>
			</div>
		</div>
	</VirtualList>
</div>
<!-- {:else}
	<div
		class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
		role="status"
	>
		<span
			class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
			>Loading...</span
		>
	</div>1]
{/if} -->

<!-- <div class="audio-controls">


	<input type="number" min="0" on:change={jumpToTimestamp} placeholder="Jump to (s)" />
</div> -->

<div class=" fixed bottom-2 left-0 right-0 w-full border-t">
	<div
		class="items-center space-y-2 rounded-t-xl border-y border-gray-300 bg-slate-50 p-2 pb-3 dark:border-slate-500 dark:bg-slate-800 sm:space-y-8 sm:p-10 sm:pb-8 lg:space-y-6 lg:p-6"
	>
		<div class="flex items-center space-x-4">
			<div class="min-w-0 flex-auto space-y-1 font-semibold">
				<p class="overflow-x-auto whitespace-nowrap text-lg text-slate-900">
					<span>{currentTitle}</span>
				</p>
			</div>
		</div>

		<div class=" flex justify-end space-x-2">
			<Button
				on:click={exportHeardData}
				variant="outline"
				size="sm"
				class="lil flex rounded-lg border px-2 pr-3 shadow-lg"
			>
				<ArrowUpFromLine class="h-4 w-4" />
				<div class="ml-2">Export</div>
			</Button>
			<Button
				on:click={importHeardData}
				variant="outline"
				size="sm"
				class="lil  flex rounded-lg border px-2 pr-3 shadow-lg"
			>
				<ArrowDownFromLine class="h-4 w-4" />
				<div class="ml-2">Import</div>
			</Button>
		</div>

		<div class="seekbar w-full">
			<input
				type="range"
				class=" w-full text-purple-400"
				min="0"
				max={duration}
				value={currentTime}
				on:input={updateCurrentTime}
			/>
		</div>

		<div class="flex justify-between text-sm font-medium tabular-nums leading-6">
			<div class="text-cyan-500 dark:text-slate-100">
				{(() => {
					const date = new Date(currentTime * 1000);
					const hours = date.getUTCHours();
					const minutes = String(date.getUTCMinutes()).padStart(2, '0');
					const seconds = String(date.getUTCSeconds()).padStart(2, '0');
					return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
				})()}
			</div>
			<div class="text-slate-500 dark:text-slate-400">
				{(() => {
					const date = new Date(duration * 1000);
					const hours = date.getUTCHours();
					const minutes = String(date.getUTCMinutes()).padStart(2, '0');
					const seconds = String(date.getUTCSeconds()).padStart(2, '0');
					return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
				})()}
			</div>
		</div>
	</div>

	<div class="lol flex items-center rounded-b-xl bg-slate-50 text-slate-500">
		<div class="flex flex-auto items-center justify-evenly">
			<!-- <button type="button" aria-label="Add to favorites">
				<svg width="24" height="24">
					<path
						d="M7 6.931C7 5.865 7.853 5 8.905 5h6.19C16.147 5 17 5.865 17 6.931V19l-5-4-5 4V6.931Z"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button> -->
			<button
				type="button"
				class=" sm:block xl:block"
				on:click={previousAudio}
				aria-label="Previous"
			>
				<svg width="24" height="24" fill="none">
					<path
						d="m10 12 8-6v12l-8-6Z"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M6 6v12"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button type="button" aria-label="Rewind 10 seconds" on:click={() => seekAudio(-10)}>
				<svg width="24" height="24" fill="none">
					<path
						d="M6.492 16.95c2.861 2.733 7.5 2.733 10.362 0 2.861-2.734 2.861-7.166 0-9.9-2.862-2.733-7.501-2.733-10.362 0A7.096 7.096 0 0 0 5.5 8.226"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M5 5v3.111c0 .491.398.889.889.889H9"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
		<button
			type="button"
			class="-my-2 mx-auto flex h-20 w-20 flex-none items-center justify-center rounded-full bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5 dark:bg-slate-100 dark:text-slate-700"
			aria-label="Pause"
			on:click={togglePlayPause}
		>
			{#if isLoading}
				<div
					class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
					role="status"
				>
					<span
						class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
						>Loading...</span
					>
				</div>
			{:else if isPlaying}
				<svg width="30" height="32" fill="currentColor">
					<rect x="6" y="4" width="4" height="24" rx="2" />
					<rect x="20" y="4" width="4" height="24" rx="2" />
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						fill-rule="evenodd"
						d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
		<!-- <button >+10s</button> -->
		<div class="flex flex-auto items-center justify-evenly">
			<button type="button" aria-label="Skip 10 seconds" on:click={() => seekAudio(10)}>
				<svg width="24" height="24" fill="none">
					<path
						d="M17.509 16.95c-2.862 2.733-7.501 2.733-10.363 0-2.861-2.734-2.861-7.166 0-9.9 2.862-2.733 7.501-2.733 10.363 0 .38.365.711.759.991 1.176"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M19 5v3.111c0 .491-.398.889-.889.889H15"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button type="button" class="sm:block xl:block" on:click={nextAudio} aria-label="Next">
				<svg width="24" height="24" fill="none">
					<path
						d="M14 12 6 6v12l8-6Z"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M18 6v12"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			<select
				class="text-md rounded-lg bg-blue-50 px-2 py-1 font-semibold leading-6 text-blue-400 ring-2 ring-inset ring-blue-200"
				on:change={(e) => changePlaybackRate(parseFloat(e.target.value))}
			>
				<option value="0.5">0.5x</option>
				<option value="0.75">0.75x</option>
				<option value="1" selected>1x</option>
				<option value="1.25">1.25x</option>
				<option value="1.5">1.5x</option>
				<option value="2">2x</option>
			</select>

			<Share2Icon />
		</div>
	</div>
</div>

<style>
	.seekbar {
		margin-top: 20px;
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.list {
		margin-bottom: 20px;
	}

	:global(body),
	:global(html) {
		height: 100%;
		margin: 0;
		background-color: rgb(249, 249, 249);
	}

	:global(.virtual-list-wrapper) {
		/* margin: 20px; */
		background: #fff;
		/* border-top: 1px solid black; */
		border-radius: 5px;
		/* box-shadow:
			0 2px 2px 0 rgba(0, 0, 0, 0.14),
			0 3px 1px -2px rgba(0, 0, 0, 0.2),
			0 1px 5px 0 rgba(0, 0, 0, 0.12);
		background: #fafafa; */
		font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
		color: #333;
		-webkit-font-smoothing: antialiased;
	}

	input[type='text'] {
		/* height: 50px; */
		/* max-width: 1900px; */
		width: 100%;
		/* padding: 5px;
		margin: 20px; */
		border: 1px solid #ccc;
		/* border-radius: 10px; */
	}

	:global(input::-moz-focus-inner),
	:global(input::-moz-focus-outer) {
		border: 0;
	}
</style>
