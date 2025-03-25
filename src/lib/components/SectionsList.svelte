<script>
	import { videoData, currentSectionIndex } from '$lib/stores/videoStore';

	function convertTimeToSeconds(timeString) {
		const [minutes, seconds] = timeString.split(':').map(Number);
		return minutes * 60 + seconds;
	}
</script>

<div class="sections-list">
	<h2>Video Sections</h2>
	<ul>
		{#each $videoData.sections as section, index}
			<li
				class:active={$currentSectionIndex === index}
				on:click={() => currentSectionIndex.set(index)}
			>
				<div class="section-title">{section.title}</div>
				<div class="section-time">{section.startTime} - {section.endTime}</div>
				<div class="section-description">{section.description}</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.sections-list {
		background-color: #f8f8f8;
		padding: 1rem;
		border-radius: 0.5rem;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 400px;
		overflow-y: auto;
	}

	li {
		padding: 0.75rem;
		border-left: 4px solid transparent;
		margin-bottom: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	li:hover {
		background-color: #eaeaea;
	}

	li.active {
		border-left-color: #3498db;
		background-color: #e8f4fb;
	}

	.section-title {
		font-weight: bold;
		margin-bottom: 0.25rem;
	}

	.section-time {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.section-description {
		font-size: 0.9rem;
		color: #444;
	}
</style>
