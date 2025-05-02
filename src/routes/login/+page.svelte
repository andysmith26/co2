<style>
	.login-container {
		max-width: 400px;
		margin: 40px auto;
	}

	.login-card {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	h1 {
		text-align: center;
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.error {
		color: #e74c3c;
		margin-bottom: 1rem;
	}

	.login-button {
		width: 100%;
		padding: 0.75rem;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.login-button:disabled {
		background-color: #95a5a6;
	}

	.redirect-message {
		background-color: #f8f9fa;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		color: #666;
		text-align: center;
	}
</style>

<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	// Use $props rune for component props
	let { data } = $props();
	// Use $derived for computed values
	let { supabase } = $derived(data);

	// Use $state for local reactive state
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	// Get redirectTo parameter from URL
	let redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/dashboard');

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

			// Redirect to the intended page
			window.location.href = redirectTo;
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

		{#if redirectTo && redirectTo !== '/(dashboard'}
			<div class="redirect-message">You'll be redirected to your requested page after login.</div>
		{/if}

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
