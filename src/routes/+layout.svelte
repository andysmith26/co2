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
		margin: 0;
		padding: 0;
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

<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { data } = $props();
	let { session, supabase } = $derived(data);

	// Navigation items
	const navItems = [
		{ path: '/', label: 'Home' },
		{ path: '/learn', label: 'Learn' },
		{ path: '/students', label: 'Students' },
	];

	// Dev mode indicator
	let showIndicator = browser && process.env.NODE_ENV !== 'production';
	let dbConnected = false;
	let connectionError = '';

	// Check connection status
	onMount(async () => {
		if (browser && supabase) {
			try {
				const { data } = await supabase.auth.getSession();
				dbConnected = !!data.session || true; // Set to true even without session for basic connectivity check
			} catch (err) {
				connectionError = err.message;
				dbConnected = false;
			}
		}

		// Set up auth state listener
		const {
			data: { subscription },
		} = supabase?.auth.onAuthStateChange((event, newSession) => {
			// When the auth state changes, invalidate the session data
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		}) || { data: { subscription: null } };

		// Clean up subscription when component unmounts
		return () => {
			subscription?.unsubscribe();
		};
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
			{#if session}
				<a href="/(protected)/dashboard">Dashboard</a>
				<!-- Show user email if available -->
				<span style="margin: 0 10px;">{session.user.email.split('@')[0]}</span>
			{:else}
				<a href="/login">Sign In</a>
			{/if}
		</div>
	</header>

	<div class="main-content">
		<slot />
	</div>

	{#if showIndicator}
		<div
			class="dev-indicator"
			class:connected={dbConnected}
			class:disconnected={!dbConnected}
			title={connectionError || ''}
		>
			Supabase: {dbConnected ? 'Connected' : 'Disconnected'}
		</div>
	{/if}

	<footer>
		<p>© 2025 LearningSpace</p>
	</footer>
</div>
