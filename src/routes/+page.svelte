<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 0 1rem 2rem;
	}

	.welcome-section {
		padding: 2rem;
		background-color: #e8f4fb;
		border-radius: 0.5rem;
	}

	h1,
	h2,
	h3 {
		margin-top: 0;
	}

	.feature-announcement {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #fff;
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #3498db;
	}

	.feature-cta {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: #3498db;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-weight: bold;
	}

	.feature-navigation {
		margin-top: 1rem;
	}

	.feature-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.5rem;
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		margin-bottom: 0.5rem;
	}

	.feature-card p {
		color: #666;
		margin: 0;
	}

	.path-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.path-card {
		padding: 1.5rem;
		border-radius: 0.5rem;
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
	}

	.add-path {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		border: 2px dashed #ccc;
		background-color: #fafafa;
	}

	.add-icon {
		font-size: 2rem;
		color: #3498db;
		margin-bottom: 1rem;
	}

	.progress-container {
		height: 8px;
		background-color: #eee;
		border-radius: 4px;
		margin: 1rem 0 0.5rem;
	}

	.progress-bar {
		height: 100%;
		background-color: #3498db;
		border-radius: 4px;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.continue-btn,
	.discover-btn {
		margin-top: auto;
		padding: 0.6rem 1rem;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 0.25rem;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
	}

	.discover-btn {
		background-color: #f8f8f8;
		color: #333;
		border: 1px solid #ddd;
	}

	.video-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.video-card {
		text-decoration: none;
		color: inherit;
	}

	.thumbnail {
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.thumbnail img {
		width: 100%;
		display: block;
	}

	.duration {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
	}
</style>

<script>
	import { FEATURES, isFeatureEnabled } from '$lib/constants';
	import { redirect } from '@sveltejs/kit';

	// Original dashboard data
	const learningPaths = [
		{
			id: 'web-dev',
			title: 'Web Development',
			description: 'Learn modern web development techniques',
			progress: 35,
			modules: 8,
		},
		{
			id: 'data-science',
			title: 'Data Science Fundamentals',
			description: 'Explore data analysis and machine learning',
			progress: 15,
			modules: 12,
		},
	];

	const recommendedVideos = [
		{
			id: 'vid-1',
			title: 'Introduction to React',
			thumbnail: 'https://via.placeholder.com/320x180',
			duration: '15:30',
		},
		{
			id: 'vid-2',
			title: 'CSS Grid Layout',
			thumbnail: 'https://via.placeholder.com/320x180',
			duration: '12:45',
		},
	];

	// Check if features are enabled
	const showProjectTracking = isFeatureEnabled('PROJECT_TRACKING');
</script>

<svelte:head>
	<title>Dashboard | LearningWhatever</title>
</svelte:head>

<div class="dashboard">
	<section class="welcome-section">
		<h1>Welcome to LearningWhatever</h1>

		{#if showProjectTracking}
			<div class="feature-announcement">
				<h2>🚀 Project Tracking Now Available!</h2>
				<p>
					Our new project tracking system helps you monitor progress and collaborate with your team.
				</p>
				<a href="/projects" class="feature-cta">Try Project Tracking</a>
			</div>
		{/if}
	</section>

	<!-- Feature Navigation -->
	<section class="feature-navigation">
		<h2>Tools & Features</h2>
		<div class="feature-cards">
			{#if isFeatureEnabled('CONCEPT_MAPPING')}
				<a href="/concept-map" class="feature-card">
					<div class="feature-icon">🔄</div>
					<h3>Concept Mapping</h3>
					<p>Visualize and connect complex concepts</p>
				</a>
			{/if}

			{#if showProjectTracking}
				<a href="/projects" class="feature-card">
					<div class="feature-icon">📊</div>
					<h3>Project Tracking</h3>
					<p>Monitor progress and collaborate with your team</p>
				</a>
			{/if}

			<a href="/learn" class="feature-card">
				<div class="feature-icon">📚</div>
				<h3>Learning Paths</h3>
				<p>Structured courses for your educational journey</p>
			</a>
		</div>
	</section>

	<section class="learning-paths">
		<h2>Your Learning Paths</h2>
		<div class="path-cards">
			{#each learningPaths as path}
				<div class="path-card">
					<h3>{path.title}</h3>
					<p>{path.description}</p>
					<div class="progress-container">
						<div class="progress-bar" style="width: {path.progress}%"></div>
					</div>
					<div class="progress-info">
						<span>{path.progress}% complete</span>
						<span>{path.modules} modules</span>
					</div>
					<a href={`/learn/${path.id}`} class="continue-btn">Continue Learning</a>
				</div>
			{/each}
			<div class="path-card add-path">
				<div class="add-icon">+</div>
				<p>Discover new learning paths</p>
				<a href="/explore" class="discover-btn">Explore</a>
			</div>
		</div>
	</section>

	<section class="recommendations">
		<h2>Recommended for You</h2>
		<div class="video-grid">
			{#each recommendedVideos as video}
				<a href={`/learn/video/${video.id}`} class="video-card">
					<div class="thumbnail">
						<img src={video.thumbnail} alt={video.title} />
						<span class="duration">{video.duration}</span>
					</div>
					<h3>{video.title}</h3>
				</a>
			{/each}
		</div>
	</section>
</div>
