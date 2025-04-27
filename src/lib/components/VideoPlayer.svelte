<style>
	.video-player {
		background-color: #f8f8f8;
		border-radius: 0.5rem;
		overflow: hidden;
		padding: 1rem;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.video-container {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
	}

	.video-container > div {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.controls {
		padding: 1rem 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: center;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	button:hover {
		background-color: #2980b9;
	}

	.time-display {
		padding: 0.5rem;
		background-color: #2c3e50;
		color: white;
		border-radius: 0.25rem;
		font-family: monospace;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { videoData, currentSectionIndex } from '$lib/stores/videoStore';

	// YouTube Player type declaration
	type YouTubePlayer = {
		seekTo: (seconds: number, allowSeekAhead: boolean) => void;
		playVideo: () => void;
		pauseVideo: () => void;
		getCurrentTime: () => number;
		getDuration: () => number;
		destroy: () => void;
	};

	let player: YouTubePlayer | undefined = undefined;
	let playerElement: HTMLDivElement | undefined = undefined;
	let isPlaying = $state(false);
	let currentTime = $state('00:00');
	let duration = $state('00:00');
	let timeUpdateInterval: number | undefined;

	// Function to convert time string (MM:SS) to seconds
	function convertTimeToSeconds(timeString: any) {
		const [minutes, seconds] = timeString.split(':').map(Number);
		return minutes * 60 + seconds;
	}

	// Function to format seconds to MM:SS
	function formatTime(seconds: any) {
		if (isNaN(seconds) || seconds < 0) seconds = 0;
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Subscribe to changes in currentSectionIndex
	$effect(() => {
		if (player && $currentSectionIndex >= 0 && $videoData.sections[$currentSectionIndex]) {
			const startTime = convertTimeToSeconds($videoData.sections[$currentSectionIndex].startTime);
			player.seekTo(startTime, true);
			player.playVideo();
		}
	});

	// Update the current section based on video time
	function updateCurrentSection() {
		if (!player?.getCurrentTime) return;

		const timeInSeconds = player.getCurrentTime();

		// Update time display
		currentTime = formatTime(timeInSeconds);

		// Find which section we're currently in
		for (let i = 0; i < $videoData.sections.length; i++) {
			const section = $videoData.sections[i];
			const startTime = convertTimeToSeconds(section.startTime);
			const endTime = convertTimeToSeconds(section.endTime);

			if (timeInSeconds >= startTime && timeInSeconds < endTime) {
				if ($currentSectionIndex !== i) {
					currentSectionIndex.set(i);
				}
				break;
			}
		}
	}

	onMount(() => {
		// Load YouTube API script if not already loaded
		if (!window.YT) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			// Define callback for when API is ready
			window.onYouTubeIframeAPIReady = initPlayer;
		} else {
			// API already loaded
			initPlayer();
		}

		return () => {
			// Cleanup
			if (player && player.destroy) {
				player.destroy();
			}

			if (timeUpdateInterval) {
				window.clearInterval(timeUpdateInterval);
			}
		};
	});

	function initPlayer() {
		if (!playerElement) return;

		player = new YT.Player(playerElement, {
			videoId: $videoData.videoId,
			playerVars: {
				playsinline: 1,
				rel: 0,
				modestbranding: 1,
			},
			events: {
				onStateChange: handlePlayerStateChange,
				onReady: handlePlayerReady,
			},
		}) as YouTubePlayer;
	}

	function handlePlayerReady() {
		// Get video duration
		if (player?.getDuration) {
			duration = formatTime(player.getDuration());
		}

		// Set up interval to check current time and update current section
		timeUpdateInterval = window.setInterval(updateCurrentSection, 500);
	}

	function handlePlayerStateChange(event: YT.PlayerEvent) {
		// Update isPlaying based on player state
		isPlaying = event.data === YT.PlayerState.PLAYING;
	}

	function togglePlayPause() {
		if (!player) return;

		if (isPlaying) {
			player.pauseVideo();
		} else {
			player.playVideo();
		}
	}
</script>

<div class="video-player">
	<h2>{$videoData.title}</h2>
	<div class="video-container">
		<div bind:this={playerElement}></div>
	</div>
	<div class="controls">
		<button onclick={togglePlayPause}>
			{isPlaying ? 'Pause' : 'Play'}
		</button>
		<div class="time-display">{currentTime} / {duration}</div>
	</div>
</div>
