<script>
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import SectionsList from '$lib/components/SectionsList.svelte';
</script>

<main>
	<h1>CO2 - Code and Cognition Organizer</h1>
	<div class="container">
		<VideoPlayer />
		<SectionsList />
	</div>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.container {
			flex-direction: row;
		}

		.container :global(.video-player) {
			flex: 2;
		}

		.container :global(.sections-list) {
			flex: 1;
			margin-top: 0;
		}
	}
</style>
