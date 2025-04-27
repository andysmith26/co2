<script>
	// Simple navigation for now, will expand later
	const navItems = [
		{ label: 'Dashboard', path: '/' },
		{ label: 'Learn', path: '/learn' },
		{ label: 'Explore', path: '/explore' }
	];

	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';

	let dbConnected = $state(false);
	let showIndicator = import.meta.env.DEV; // Only show in development mode

	onMount(async () => {
		if (showIndicator) {
			try {
				// Simple health check that doesn't require specific tables
				const { data, error } = await supabase.auth.getSession();

				if (!error) {
					dbConnected = true;
				} else {
					throw error;
				}
			} catch (e) {
				dbConnected = false;
			}
		}
	});
</script>

<div class="app-container">
	<header>
		<div class="logo">LearningSpace</div>
		<nav>
			<ul>
				{#each navItems as item}
					<li>
						<a href={item.path}>{item.label}</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="user-menu">
			<!-- Placeholder for user menu -->
			<button>Sign In</button>
		</div>
	</header>

	<div class="main-content">
		<slot></slot>
	</div>

	{#if showIndicator}
		<div class="dev-indicator" class:connected={dbConnected} class:disconnected={!dbConnected}>
			Supabase: {dbConnected ? 'Connected' : 'Disconnected'}
		</div>
	{/if}

	<footer>
		<p>© 2025 LearningSpace</p>
	</footer>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2rem;
		height: 60px;
		background-color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	nav ul {
		display: flex;
		list-style: none;
		gap: 1.5rem;
	}

	nav a {
		text-decoration: none;
		color: #333;
		font-weight: 500;
	}

	nav a:hover {
		color: #3498db;
	}

	.main-content {
		flex: 1;
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	footer {
		padding: 1rem;
		text-align: center;
		background-color: #f8f8f8;
	}

	.dev-indicator {
		position: fixed;
		bottom: 10px;
		right: 10px;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 12px;
		font-family: monospace;
		z-index: 9999;
		opacity: 0.8;
		transition: opacity 0.3s;
	}

	.dev-indicator:hover {
		opacity: 1;
	}

	.connected {
		background-color: #10b981;
		color: white;
	}

	.disconnected {
		background-color: #ef4444;
		color: white;
	}
</style>
