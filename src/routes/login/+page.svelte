<style>
	/* Your styles here */
</style>

<script lang="ts">
	import { invalidate } from '$app/navigation';

	// Use $props rune for component props
	let { data } = $props();
	// Use $derived for computed values
	let { supabase } = $derived(data);

	// Use $state for local reactive state
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin() {
		loading = true;
		error = '';

		try {
			const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (authError) throw authError;

			// Invalidate the auth data
			await invalidate('supabase:auth');

			// Redirect to dashboard - use window.location for full page reload
			// to ensure cookies are properly set
			window.location.href = '/(protected)/dashboard';
		} catch (err) {
			console.error('Login error:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Login</h1>

		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="email">Email</label>
				<input id="email" type="email" bind:value={email} required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input id="password" type="password" bind:value={password} required />
			</div>

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<button type="submit" disabled={loading} class="login-button">
				{loading ? 'Loading...' : 'Log In'}
			</button>
		</form>
	</div>
</div>
