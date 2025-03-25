<script>
	import { onMount } from 'svelte';

	// Hardcoded video ID for the p5.js conditional statements tutorial
	const videoId = '1Osb_iGDdjk';
	let player;
	let playerElement;

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
		};
	});

	function initPlayer() {
		player = new YT.Player(playerElement, {
			videoId,
			playerVars: {
				playsinline: 1,
				rel: 0, // Don't show related videos
				modestbranding: 1 // Hide most YouTube branding
			}
		});
	}
</script>

<div class="video-player">
	<div class="video-container">
		<div bind:this={playerElement}></div>
	</div>
	<div class="controls">
		<button>Play/Pause</button>
	</div>
</div>

<style>
	.video-player {
		background-color: #f8f8f8;
		border-radius: 0.5rem;
		overflow: hidden;
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
		padding: 1rem;
		display: flex;
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
</style>
