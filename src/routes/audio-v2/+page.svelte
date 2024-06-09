<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import VirtualList from 'svelte-tiny-virtual-list';
	export let data;
	data = data.data;
	// let data1: any = [];
	let sortOption = 'date'; // Default sort option
	let sortOrder = 'asc'; // Default sort order (ascending)

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

	let itemSize = 80;
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

	$: filteredData = data
		.filter((item: any) => {
			const term = searchTerm.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').filter(Boolean);

			return term.every((t) => {
				return (
					item.title.toLowerCase().includes(t) ||
					item.details.some((detail: any) => detail.toLowerCase().includes(t))
				);
			});
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

	async function downloadFile(url: any, filename: any) {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const objectUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = objectUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(objectUrl);
		} catch (error) {
			console.error('Download failed:', error);
		}
	}

	async function handleDownload(fileUrl: any, filename: any, index: any) {
		filteredData[index].loading = true;
		await downloadFile(fileUrl, filename);
		filteredData[index].loading = false;
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

<div class="input-wrap">
	<input type="text" placeholder="Search items..." on:keyup={updateSearchTerm} />
</div>

<div class="sort-options ml-6">
	<select on:change={updateSortOption}>
		<option value="date">Date</option>
		<option value="duration">Duration</option>
		<option value="heard">Heard</option>
		<option value="scripture">Scripture</option>
	</select>
	<button on:click={toggleSortOrder}>
		{sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
	</button>
</div>

{#if data.length > 0}
	<div class="list">
		<VirtualList height={500} width="auto" itemCount={filteredData.length} {itemSize}>
			<div slot="item" let:index let:style {style} class="row">
				<div class="">
					{#if heards[filteredData[index].Id]}
						<button class="text-green-500" on:click={() => toggleHeard(index)}>Heard</button>
					{:else}
						<button class="text-red-500" on:click={() => toggleHeard(index)}>Unheard</button>
					{/if}
				</div>
				<div class="ml-5">
					{#if filteredData[index].loading}
						<svg
							class="h-8 w-8 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{:else}
						<button
							type="button"
							class="flex items-center rounded-md border border-black bg-slate-100 px-2 py-2 text-center text-sm shadow-xl"
							on:click={() =>
								handleDownload(
									filteredData[index].audioLink,
									`${filteredData[index].title}.mp3`,
									index
								)}
							tabIndex={0}
							aria-label={`Download ${filteredData[index].title}.mp3`}
						>
							Download
						</button>
					{/if}
				</div>
				<button
					class=" whitespace-nowrap"
					on:click={() => {
						currentIndex = index;
						playAudio(index);
					}}>{filteredData[index].title}</button
				>
			</div>
		</VirtualList>

		<button on:click={exportHeardData}>Export Heard Data</button>
		<button on:click={importHeardData}>Import Heard Data</button>
	</div>
{:else}
	<div
		class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
		role="status"
	>
		<span
			class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
			>Loading...</span
		>
	</div>
{/if}

<!-- <div class="audio-controls">


	<input type="number" min="0" on:change={jumpToTimestamp} placeholder="Jump to (s)" />
</div> -->

<div class="fixed bottom-0 left-0 right-0 w-full">
	<div
		class="items-center space-y-2 rounded-t-xl border-b border-slate-100 bg-white p-2 pb-3 dark:border-slate-500 dark:bg-slate-800 sm:space-y-8 sm:p-10 sm:pb-8 lg:space-y-6 lg:p-6"
	>
		<div class="flex items-center space-x-4">
			<div class="min-w-0 flex-auto space-y-1 font-semibold">
				<p class="overflow-x-auto whitespace-nowrap text-lg text-slate-900">
					<span>{currentTitle}</span>
				</p>
			</div>
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
	<div
		class="flex items-center rounded-b-xl bg-slate-50 text-slate-500 dark:bg-slate-600 dark:text-slate-200"
	>
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
				Play
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
				class="text-md rounded-lg bg-purple-100 px-2 py-1 font-semibold leading-6 text-purple-400 ring-2 ring-inset ring-purple-200"
				on:change={(e) => changePlaybackRate(parseFloat(e.target.value))}
			>
				<option value="0.5">0.5x</option>
				<option value="0.75">0.75x</option>
				<option value="1" selected>1x</option>
				<option value="1.25">1.25x</option>
				<option value="1.5">1.5x</option>
				<option value="2">2x</option>
			</select>
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
	.input-wrap,
	.sort-options,
	.list {
		margin-bottom: 20px;
	}
	.row {
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	.ml-5 {
		margin-left: 20px;
	}
	.text-green-500 {
		color: green;
	}
	.text-red-500 {
		color: red;
	}

	:global(body),
	:global(html) {
		height: 100%;
		margin: 0;
		background-color: rgb(249, 249, 249);
	}

	:global(.virtual-list-wrapper) {
		margin: 20px;
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

	.input-wrap {
		display: flex;
		flex-grow: 1;
	}

	.row {
		/* padding: 0 15px; */

		/* border-bottom: 1px solid #eee; */
		box-sizing: border-box;
		/* line-height: 70px; */
		font-weight: 500;
		background: #fff;
		padding-left: 20px;
	}
	input[type='text'] {
		height: 30px;
		/* max-width: 1900px; */
		width: 100%;
		padding: 5px;
		margin: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	:global(input::-moz-focus-inner),
	:global(input::-moz-focus-outer) {
		border: 0;
	}
</style>
