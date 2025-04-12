<script>
	// Sample learning paths list - this will eventually come from a store
	const learningPaths = [
		{
			id: 'web-dev',
			title: 'Web Development',
			description: 'Learn modern web development techniques',
			modules: 8,
			image: 'https://via.placeholder.com/600x300'
		},
		{
			id: 'data-science',
			title: 'Data Science Fundamentals',
			description: 'Explore data analysis and machine learning',
			modules: 12,
			image: 'https://via.placeholder.com/600x300'
		}
	];
</script>

<svelte:head>
	<title>Learning Paths | LearningSpace</title>
</svelte:head>

<div class="learn-page">
	<h1>Learning Paths</h1>
	<p>Select a learning path to begin or continue your journey</p>

	<div class="paths-list">
		{#each learningPaths as path}
			<a href={`/learn/${path.id}`} class="path-item">
				<div class="path-image">
					<img src={path.image} alt={path.title} />
				</div>
				<div class="path-content">
					<h2>{path.title}</h2>
					<p>{path.description}</p>
					<div class="path-meta">
						<span>{path.modules} modules</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.learn-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.paths-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.path-item {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		border-radius: 0.5rem;
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.path-item:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.path-image {
		flex: 0 0 200px;
	}

	.path-image img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		border-radius: 0.25rem;
	}

	.path-content {
		flex: 1;
	}

	.path-meta {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: #666;
	}
</style>
