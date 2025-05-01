<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 200px);
		padding: 2rem;
	}

	.login-card {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		color: #333;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
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
		font-size: 1rem;
	}

	.error {
		color: #e74c3c;
		background-color: #fdf1f0;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.login-button {
		width: 100%;
		padding: 0.75rem;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.login-button:hover {
		background-color: #2980b9;
	}

	.login-button:disabled {
		background-color: #95a5a6;
		cursor: not-allowed;
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleLogin() {
		loading = true;
		error = '';

		try {
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (authError) throw authError;

			goto('/dashboard');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login | LearningSpace</title>
</svelte:head>

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
