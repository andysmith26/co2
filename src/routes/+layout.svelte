<style>
	/* Your styles here */
</style>

<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	// Use $props rune for component props
	let { data } = $props();
	// Use $derived for computed values
	let { supabase, session, user } = $derived(data);

	onMount(() => {
		// Set up auth state change listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Clean up on unmount
		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<div class="app">
	<header>
		<nav>
			<a href="/">Home</a>
			{#if session}
				<a href="/dashboard">Dashboard</a>
				<span>{user?.email}</span>
				<form action="/signout" method="POST" style="display:inline;">
					<button type="submit">Sign Out</button>
				</form>
			{:else}
				<a href="/login">Login</a>
			{/if}
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>
