<style>
	/* Your styles here */
	nav {
		display: flex;
		gap: 16px;
		align-items: center;
		padding: 10px 0;
	}

	nav a {
		text-decoration: none;
		color: #0284c7;
	}

	nav a:hover {
		text-decoration: underline;
	}

	.admin-link {
		background-color: #6366f1;
		color: white !important;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.admin-link:hover {
		background-color: #4f46e5;
		text-decoration: none !important;
	}

	.app {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 16px;
	}

	main {
		padding: 20px 0;
	}

	.user-info {
		margin-left: auto;
		display: flex;
		gap: 16px;
		align-items: center;
	}
</style>

<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props();
	let { supabase, session, user } = $derived(data);
	let isAdmin = $state(false);

	async function checkAdminStatus() {
		if (!session) return;

		try {
			console.log('Checking admin status for user:', user?.email);

			const response = await fetch('/api/test-admin');
			const data = await response.json();

			console.log('Admin status check response:', data);

			if (data.success === false) {
				console.error('Admin check failed:', data.error, data.errorDetails);
				isAdmin = false;
			} else {
				isAdmin = data.admin === true;
				console.log('User admin status:', isAdmin);
			}
		} catch (err) {
			console.error('Failed to check admin status:', err);
			isAdmin = false;
		}
	}

	onMount(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		if (session) {
			setTimeout(checkAdminStatus, 100);
		}

		return () => {
			subscription.unsubscribe();
		};
	});

	$effect(() => {
		if (session) {
			setTimeout(checkAdminStatus, 100);
		} else {
			isAdmin = false;
		}
	});
</script>

<div class="app">
	<header>
		<nav>
			<a href="/">Home</a>
			{#if session}
				<a href="/dashboard">Dashboard</a>

				{#if isAdmin}
					<a href="/admin" class="admin-link">Admin</a>
				{/if}

				<div class="user-info">
					<span>{user?.email}</span>
					<form action="/signout" method="POST" style="display:inline;">
						<button type="submit">Sign Out</button>
					</form>
				</div>
			{:else}
				<a href="/login">Login</a>
			{/if}
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>
