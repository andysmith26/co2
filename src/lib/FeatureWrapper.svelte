<style>
	.loading-container,
	.error-container,
	.placeholder-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		width: 100%;
		text-align: center;
		padding: 2rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error-container {
		color: #721c24;
		background-color: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		max-width: 500px;
		margin: 2rem auto;
	}

	.error-container button {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 1rem;
	}

	.placeholder-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.feature-status {
		margin-top: 2rem;
		border: 1px solid #ddd;
		padding: 1rem;
		border-radius: 4px;
		background-color: #f9f9f9;
		width: 100%;
		max-width: 400px;
		text-align: left;
	}

	.feature-status h3 {
		margin-top: 0;
		border-bottom: 1px solid #ddd;
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}

	.feature-status ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.feature-status li {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	.feature-name {
		font-weight: bold;
	}

	.feature-badge {
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
	}

	.feature-badge.enabled {
		background-color: #28a745;
		color: white;
	}

	.feature-badge.disabled {
		background-color: #dc3545;
		color: white;
	}
</style>

<script>
	import { FEATURES, isFeatureEnabled } from '$lib/constants/features';
	// Lazy load feature components using dynamic imports
	import { onMount } from 'svelte';

	// Components will be lazily loaded
	let ConceptMappingApp;
	let ProjectTrackingApp;

	// Track loading state
	let loading = $state(true);
	let loadError = $state(null);

	onMount(async () => {
		try {
			// Dynamically import features based on enabled flags
			if (isFeatureEnabled('CONCEPT_MAPPING')) {
				const module = await import('$lib/features/concept-mapping/App.svelte');
				ConceptMappingApp = module.default;
			}

			if (isFeatureEnabled('PROJECT_TRACKING')) {
				// This would be implemented when project tracking feature is developed
				// const module = await import('$lib/features/project-tracking/App.svelte');
				// ProjectTrackingApp = module.default;
			}

			loading = false;
		} catch (error) {
			loadError = error.message;
			loading = false;
			console.error('Error loading feature components:', error);
		}
	});
</script>

/** * Central feature coordination component * * This component acts as a bridge between the main
application and the feature modules. * It conditionally renders features based on feature flags. */
{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Loading application...</p>
	</div>
{:else if loadError}
	<div class="error-container">
		<h2>Something went wrong</h2>
		<p>{loadError}</p>
		<button onclick={() => window.location.reload()}>Retry</button>
	</div>
{:else}
	<!-- Render active features based on feature flags -->
	{#if isFeatureEnabled('CONCEPT_MAPPING') && ConceptMappingApp}
		<svelte:component this={ConceptMappingApp} />
	{:else if isFeatureEnabled('PROJECT_TRACKING') && ProjectTrackingApp}
		<svelte:component this={ProjectTrackingApp} />
	{:else}
		<div class="placeholder-container">
			<h2>CO2 Educational Platform</h2>
			<p>Project tracking features are currently in development.</p>

			<div class="feature-status">
				<h3>Feature Status</h3>
				<ul>
					<li>
						<span class="feature-name">Concept Mapping:</span>
						<span class="feature-badge {FEATURES.CONCEPT_MAPPING ? 'enabled' : 'disabled'}">
							{FEATURES.CONCEPT_MAPPING ? 'Enabled' : 'Disabled'}
						</span>
					</li>
					<li>
						<span class="feature-name">Project Tracking:</span>
						<span class="feature-badge {FEATURES.PROJECT_TRACKING ? 'enabled' : 'disabled'}">
							{FEATURES.PROJECT_TRACKING ? 'Enabled' : 'Disabled'}
						</span>
					</li>
				</ul>
			</div>
		</div>
	{/if}
{/if}
