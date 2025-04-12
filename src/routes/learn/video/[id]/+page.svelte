<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import SectionsList from '$lib/components/SectionsList.svelte';
	import { videoData } from '$lib/stores/videoStore';

	// Get the video ID from the route params
	const videoId = $page.params.id;

	// Mock data that would typically be fetched from an API
	const mockVideoData = {
		id: videoId,
		title: 'Introduction to Web Development',
		description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
		videoUrl: 'https://example.com/video.mp4',
		sections: [
			{
				title: 'Introduction',
				startTime: '0:00',
				endTime: '2:30',
				description: 'Overview of the course content'
			},
			{
				title: 'HTML Basics',
				startTime: '2:31',
				endTime: '10:15',
				description: 'Introduction to HTML structure and elements'
			},
			{
				title: 'CSS Styling',
				startTime: '10:16',
				endTime: '18:45',
				description: 'How to style HTML elements with CSS'
			},
			{
				title: 'JavaScript Fundamentals',
				startTime: '18:46',
				endTime: '29:30',
				description: 'Basic JavaScript concepts and syntax'
			}
		]
	};

	// Related content that would typically be fetched from an API
	const relatedContent = [
		{
			id: 'related-1',
			title: 'CSS Grid Layout',
			type: 'video'
		},
		{
			id: 'related-2',
			title: 'JavaScript DOM Manipulation',
			type: 'video'
		},
		{
			id: 'exercise-1',
			title: 'HTML Structure Exercise',
			type: 'exercise'
		}
	];

	onMount(() => {
		// In a real app, fetch the video data from an API
		// For now, we'll use our mock data
		videoData.set(mockVideoData);
	});
</script>

<svelte:head>
	<title>{mockVideoData.title} | LearningSpace</title>
</svelte:head>

<div class="video-learning-page">
	<div class="video-container">
		<div class="video-player-wrapper">
			<VideoPlayer />

			<div class="video-info">
				<h1>{mockVideoData.title}</h1>
				<p>{mockVideoData.description}</p>
			</div>
		</div>

		<div class="sections-wrapper">
			<SectionsList />

			<!-- This is a new addition to your existing components -->
			<div class="content-actions">
				<button class="action-button">
					<span class="icon">📝</span>
					Take Notes
				</button>
				<button class="action-button">
					<span class="icon">💬</span>
					Discussion
				</button>
				<button class="action-button">
					<span class="icon">📋</span>
					Resources
				</button>
			</div>
		</div>
	</div>

	<div class="related-content">
		<h2>Related Content</h2>
		<ul>
			{#each relatedContent as content}
				<li>
					<a href={`/learn/${content.type}/${content.id}`}>
						<span class="content-type">{content.type}</span>
						{content.title}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.video-learning-page {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.video-container {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1.5rem;
	}

	.video-player-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.video-info {
		background-color: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.video-info h1 {
		margin-top: 0;
		font-size: 1.5rem;
	}

	.sections-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.content-actions {
		display: flex;
		justify-content: space-between;
		background-color: white;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.action-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.85rem;
		color: #555;
	}

	.icon {
		font-size: 1.2rem;
	}

	.related-content {
		background-color: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.related-content h2 {
		margin-top: 0;
		font-size: 1.25rem;
	}

	.related-content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.related-content li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #eee;
	}

	.related-content li:last-child {
		border-bottom: none;
	}

	.related-content a {
		text-decoration: none;
		color: inherit;
		display: flex;
		align-items: center;
	}

	.content-type {
		background-color: #f0f0f0;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		margin-right: 0.75rem;
		text-transform: capitalize;
	}

	/* Media query for responsive layout */
	@media (max-width: 900px) {
		.video-container {
			grid-template-columns: 1fr;
		}
	}
</style>
