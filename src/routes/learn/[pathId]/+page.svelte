<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { learningPaths } from '$lib/stores/learningPathStore';

	const pathId = $page.params.pathId;

	// Track loading state
	let loading = true;
	let currentPath = null;

	onMount(async () => {
		// Fetch learning paths (if not already loaded)
		if (!$learningPaths.paths.length) {
			await learningPaths.fetchPaths();
		}

		// Set the current path
		learningPaths.setCurrentPath(pathId);
		loading = false;
	});

	// Subscribe to the current path
	$: currentPath = $learningPaths.currentPath;
</script>

<svelte:head>
	<title>{currentPath?.title || 'Learning Path'} | LearningSpace</title>
</svelte:head>

<div class="learning-path">
	{#if loading}
		<div class="loading">Loading path details...</div>
	{:else if !currentPath}
		<div class="error">
			<h2>Path Not Found</h2>
			<p>Sorry, we couldn't find the learning path you're looking for.</p>
			<a href="/learn">Return to Learning Paths</a>
		</div>
	{:else}
		<div class="path-header">
			<h1>{currentPath.title}</h1>
			<p>{currentPath.description}</p>
			<div class="progress-container">
				<div class="progress-bar" style="width: {currentPath.progress}%"></div>
				<div class="progress-text">{currentPath.progress}% complete</div>
			</div>
		</div>

		<div class="modules-list">
			<h2>Modules</h2>

			{#each currentPath.modules as module, index}
				<div class="module-card">
					<div class="module-status">
						{#if module.completed}
							<span class="status-icon completed">✓</span>
						{:else}
							<span class="status-icon">{index + 1}</span>
						{/if}
					</div>

					<div class="module-content">
						<h3>{module.title}</h3>
						<div class="module-type">{module.type}</div>
					</div>

					<div class="module-actions">
						<a href={`/learn/video/${module.id}`} class="module-button">
							{module.completed ? 'Review' : 'Start'}
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.learning-path {
		max-width: 800px;
		margin: 0 auto;
	}

	.loading,
	.error {
		text-align: center;
		padding: 2rem;
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.path-header {
		background-color: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		margin-bottom: 2rem;
	}

	.progress-container {
		margin-top: 1.5rem;
		position: relative;
	}

	.progress-bar {
		height: 8px;
		background-color: #3498db;
		border-radius: 4px;
	}

	.progress-text {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: #666;
	}

	.modules-list {
		background-color: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.modules-list h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	.module-card {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid #eee;
		margin-bottom: 1rem;
	}

	.module-status {
		margin-right: 1.5rem;
	}

	.status-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background-color: #f0f0f0;
		color: #666;
	}

	.status-icon.completed {
		background-color: #2ecc71;
		color: white;
	}

	.module-content {
		flex: 1;
	}

	.module-content h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.module-type {
		color: #666;
		font-size: 0.9rem;
		margin-top: 0.25rem;
	}

	.module-button {
		padding: 0.5rem 1.5rem;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 0.25rem;
		text-decoration: none;
		font-size: 0.9rem;
	}
</style>
