<style>
	.profile-container {
		max-width: 800px;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #6c757d;
		margin-top: 0;
		margin-bottom: 2rem;
	}

	.profile-form {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		padding: 2rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #333;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	input:disabled {
		background-color: #f9f9f9;
		cursor: not-allowed;
	}

	.help-text {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #6c757d;
	}

	.form-actions {
		margin-top: 2rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		font-weight: 500;
		transition:
			background-color 0.2s,
			transform 0.1s;
	}

	.btn:hover {
		transform: translateY(-1px);
	}

	.btn:active {
		transform: translateY(0);
	}

	.primary {
		background-color: #3498db;
		color: white;
	}

	.primary:hover {
		background-color: #2980b9;
	}

	.primary:disabled {
		background-color: #95a5a6;
		cursor: not-allowed;
	}

	.message {
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}

	.success {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}
</style>

<script lang="ts">
	import { invalidate } from '$app/navigation';

	let { data } = $props();
	let { supabase, session } = $derived(data);

	let loading = false;
	let message = '';
	let error = '';

	// Form fields
	let firstName = '';
	let lastName = '';
	let avatarUrl = '';

	// Load profile data
	async function loadProfile() {
		if (!session?.user) return;

		loading = true;
		try {
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('first_name, last_name, avatar_url')
				.eq('id', session.user.id)
				.single();

			if (profileError) throw profileError;

			if (profile) {
				firstName = profile.first_name || '';
				lastName = profile.last_name || '';
				avatarUrl = profile.avatar_url || '';
			}
		} catch (err) {
			console.error('Error loading profile:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// Update profile
	async function updateProfile() {
		if (!session?.user) return;

		loading = true;
		message = '';
		error = '';

		try {
			const { error: updateError } = await supabase.from('profiles').upsert({
				id: session.user.id,
				first_name: firstName,
				last_name: lastName,
				avatar_url: avatarUrl,
				updated_at: new Date().toISOString(),
			});

			if (updateError) throw updateError;

			message = 'Profile updated successfully!';

			// Refresh data
			await invalidate('supabase:auth');
		} catch (err) {
			console.error('Error updating profile:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// Run once when component mounts
	$effect(() => {
		if (session?.user) {
			loadProfile();
		}
	});
</script>

<svelte:head>
	<title>Profile | LearningSpace</title>
</svelte:head>

<div class="profile-container">
	<h1>Profile Settings</h1>
	<p class="subtitle">Update your personal information</p>

	{#if session?.user}
		<form on:submit|preventDefault={updateProfile} class="profile-form">
			<div class="form-grid">
				<div class="form-group">
					<label for="email">Email</label>
					<input type="email" id="email" value={session.user.email || ''} disabled />
					<p class="help-text">Email address cannot be changed</p>
				</div>

				<div class="form-group">
					<label for="firstName">First Name</label>
					<input type="text" id="firstName" bind:value={firstName} placeholder="Your first name" />
				</div>

				<div class="form-group">
					<label for="lastName">Last Name</label>
					<input type="text" id="lastName" bind:value={lastName} placeholder="Your last name" />
				</div>

				<div class="form-group">
					<label for="avatarUrl">Avatar URL</label>
					<input
						type="url"
						id="avatarUrl"
						bind:value={avatarUrl}
						placeholder="https://example.com/avatar.jpg"
					/>
				</div>
			</div>

			{#if message}
				<div class="message success">{message}</div>
			{/if}

			{#if error}
				<div class="message error">{error}</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="btn primary" disabled={loading}>
					{loading ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	{:else}
		<p>You need to be logged in to view this page.</p>
	{/if}
</div>
