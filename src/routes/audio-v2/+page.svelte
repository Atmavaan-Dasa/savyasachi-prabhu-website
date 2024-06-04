<script lang="ts">
	import { onMount } from 'svelte';
	import VirtualList from 'svelte-tiny-virtual-list';
	let data: any = [];
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

	async function fetchData() {
		const response = await fetch('/output.json');
		const jsonData = await response.json();
		data = jsonData;
	}

	let itemSize = 80;
	let audio: HTMLAudioElement;
	let currentIndex = 0;
	let playbackRate = 1;
	let isPlaying = false;
	let currentTime = 0;
	let duration = 0;
	let isLoading = false;
	$: lastPlayedPosition = 0;

	onMount(() => {
		fetchData();
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

<div class="sort-options">
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
		<VirtualList height={800} width="auto" itemCount={filteredData.length} {itemSize}>
			<div
				slot="item"
				let:index
				let:style
				{style}
				class="row"
				on:click={() => {
					currentIndex = index;
					playAudio(index);
				}}
			>
				<td>{filteredData[index].title}</td>
				<td class="ml-5">
					{#if heards[filteredData[index].Id]}
						<button class="text-green-500" on:click={() => toggleHeard(index)}>Heard</button>
					{:else}
						<button class="text-red-500" on:click={() => toggleHeard(index)}>Unheard</button>
					{/if}
				</td>
				<td class="ml-5">
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
						>
							Download
						</button>
					{/if}
				</td>
			</div>
		</VirtualList>

		<button on:click={exportHeardData}>Export Heard Data</button>
		<button on:click={importHeardData}>Import Heard Data</button>
	</div>
{:else}
	<p>Loading data...</p>
{/if}

<div class="audio-controls">
	<button on:click={previousAudio}>Previous</button>
	<button on:click={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
	<button on:click={nextAudio}>Next</button>
	<button on:click={() => seekAudio(-10)}>-10s</button>
	<button on:click={() => seekAudio(10)}>+10s</button>
	<input type="number" min="0" on:change={jumpToTimestamp} placeholder="Jump to (s)" />
	<select on:change={(e) => changePlaybackRate(parseFloat(e.target.value))}>
		<option value="0.5">0.5x</option>
		<option value="0.75">0.75x</option>
		<option value="1" selected>1x</option>
		<option value="1.25">1.25x</option>
		<option value="1.5">1.5x</option>
		<option value="2">2x</option>
	</select>
</div>

<div class="seekbar">
	<input type="range" min="0" max={duration} value={currentTime} on:input={updateCurrentTime} />
	<span>{isLoading ? 'Loading...' : filteredData[currentIndex]?.title}</span>
</div>

<style>
	.audio-controls,
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
	td {
		/* padding: 8px; */
		text-align: left;
		/* font-size: larger; */
		/* border-left: 1px solid black; */
	}

	:global(.virtual-list-wrapper) {
		margin: 20px;
		background: #fff;
		border-top: 1px solid black;
		border-radius: 10px;
		box-shadow:
			0 2px 2px 0 rgba(0, 0, 0, 0.14),
			0 3px 1px -2px rgba(0, 0, 0, 0.2),
			0 1px 5px 0 rgba(0, 0, 0, 0.12);
		background: #fafafa;
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

		border-bottom: 1px solid black;
		border-left: 1px solid black;
		border-right: 1px solid black;
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