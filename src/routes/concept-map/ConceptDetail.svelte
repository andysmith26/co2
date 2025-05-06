<style>
	.concept-detail {
		padding: 1rem 0;
	}

	.concept-title {
		margin-top: 0;
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
	}

	.concept-meta {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		gap: 0.5rem;
	}

	.concept-type {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		color: white;
		font-size: 0.8rem;
		text-transform: capitalize;
	}

	.concept-big-idea {
		font-size: 0.8rem;
		color: #666;
		background-color: #f8f9fa;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.concept-description {
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.progress-tracker {
		background-color: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}

	.progress-tracker h3 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		font-size: 1rem;
	}

	.progress-options {
		display: flex;
		gap: 0.5rem;
	}

	.progress-option {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: white;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.progress-option:hover {
		border-color: var(--status-color);
		background-color: var(--status-color);
	}

	.progress-option.active {
		border-color: var(--status-color);
		background-color: var(--status-color);
		font-weight: bold;
	}

	.concept-examples,
	.concept-resources {
		margin-bottom: 1.5rem;
	}

	.concept-examples h3,
	.concept-resources h3 {
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}

	.concept-examples ul,
	.concept-resources ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.concept-examples li,
	.concept-resources li {
		margin-bottom: 0.25rem;
	}

	.concept-resources a {
		color: #0066cc;
		text-decoration: none;
	}

	.concept-resources a:hover {
		text-decoration: underline;
	}
</style>

<script>
	import { createEventDispatcher } from 'svelte';

	// Props
	let { concept, progress = 'not-started' } = $props();

	// Event dispatcher to send progress updates to parent
	const dispatch = createEventDispatcher();

	// Progress status options
	const progressStatuses = [
		{ id: 'not-started', label: 'Not Started', color: '#f8f9fa' },
		{ id: 'in-progress', label: 'In Progress', color: '#fff3cd' },
		{ id: 'mastered', label: 'Mastered', color: '#d4edda' },
	];

	// Handle progress status change
	function updateProgress(status) {
		dispatch('progressUpdate', {
			conceptId: concept.id,
			status: status,
		});
	}
</script>

<div class="concept-detail">
	<h2 class="concept-title">{concept.label}</h2>

	<div class="concept-meta">
		<span class="concept-type" style="background-color: {concept.color || '#777'}">
			{concept.type}
		</span>
		{#if concept.bigIdea}
			<span class="concept-big-idea">Big Idea {concept.bigIdea}</span>
		{/if}
	</div>

	<p class="concept-description">{concept.description}</p>

	<div class="progress-tracker">
		<h3>My Understanding</h3>
		<div class="progress-options">
			{#each progressStatuses as status}
				<button
					class="progress-option"
					class:active={progress === status.id}
					style="--status-color: {status.color};"
					onclick={() => updateProgress(status.id)}
				>
					{status.label}
				</button>
			{/each}
		</div>
	</div>

	{#if concept.examples && concept.examples.length > 0}
		<div class="concept-examples">
			<h3>Examples</h3>
			<ul>
				{#each concept.examples as example}
					<li>{example}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if concept.resources && concept.resources.length > 0}
		<div class="concept-resources">
			<h3>Resources</h3>
			<ul>
				{#each concept.resources as resource}
					<li>
						<a href={resource.url} target="_blank" rel="noopener noreferrer">
							{resource.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
