<style>
	.protected-layout {
		display: flex;
		min-height: calc(100vh - 60px - 40px); /* Subtract header and footer height */
	}

	.sidebar {
		width: 250px;
		background-color: #f8f9fa;
		border-right: 1px solid #e9ecef;
		display: flex;
		flex-direction: column;
	}

	.sidebar-header {
		padding: 1.5rem 1rem;
		border-bottom: 1px solid #e9ecef;
	}

	.sidebar-header h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.user-email {
		margin: 0;
		font-size: 0.875rem;
		color: #6c757d;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		color: #495057;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.nav-item:hover {
		background-color: #e9ecef;
	}

	.icon {
		margin-right: 0.75rem;
		font-size: 1.25rem;
	}

	.content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	.signout-button {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		margin-top: auto;
		color: #dc3545;
	}

	form {
		margin-top: auto;
	}
</style>

<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	let { session, supabase } = $derived(data);
</script>

<div class="protected-layout">
	<div class="sidebar">
		<div class="sidebar-header">
			<h3>Dashboard</h3>
			{#if session?.user}
				<p class="user-email">{session.user.email}</p>
			{/if}
		</div>

		<nav class="sidebar-nav">
			<a href="/(protected)/dashboard" class="nav-item">
				<span class="icon">📊</span>
				<span>Dashboard</span>
			</a>
			<a href="/(protected)/profile" class="nav-item">
				<span class="icon">👤</span>
				<span>Profile</span>
			</a>

			<!-- Sign out button uses a form so it happens server-side -->
			<form action="?/signout" method="POST" use:enhance>
				<button type="submit" class="nav-item signout-button">
					<span class="icon">🚪</span>
					<span>Sign Out</span>
				</button>
			</form>
		</nav>
	</div>

	<main class="content">
		<slot />
	</main>
</div>
