<style>
	.dashboard-header {
		margin-bottom: 2rem;
	}

	.dashboard-header h1 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.dashboard-header p {
		color: #6c757d;
		font-size: 1.1rem;
		margin: 0;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.card-header {
		padding: 1.25rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.card-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #333;
	}

	.card-content {
		padding: 1.5rem;
		flex: 1;
	}

	.card-footer {
		padding: 1rem 1.25rem;
		background-color: #f9f9f9;
		border-top: 1px solid #f0f0f0;
	}

	.card-link {
		display: inline-block;
		color: #3498db;
		text-decoration: none;
		font-weight: 500;
	}

	.card-link:hover {
		text-decoration: underline;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 700;
		color: #3498db;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #6c757d;
		margin-top: 0.25rem;
	}

	.account-info p {
		margin: 0.5rem 0;
	}

	.error {
		color: #dc3545;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();
	let { supabase, session } = $derived(data);

	let studentCount = 0;
	let isLoading = true;
	let error = '';

	onMount(async () => {
		try {
			// Get the count of students (example of using the authenticated client)
			const { count, error: countError } = await supabase
				.from('students')
				.select('*', { count: 'exact', head: true });

			if (countError) throw countError;

			studentCount = count || 0;
		} catch (err) {
			error = err.message;
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Dashboard | LearningSpace</title>
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>Welcome, {session?.user?.email?.split('@')[0] || 'Teacher'}</h1>
		<p>Here's an overview of your account and activity.</p>
	</header>

	<div class="dashboard-grid">
		<div class="card">
			<div class="card-header">
				<h3>Students</h3>
			</div>
			<div class="card-content">
				{#if isLoading}
					<p>Loading...</p>
				{:else if error}
					<p class="error">Error: {error}</p>
				{:else}
					<div class="stat">
						<span class="stat-value">{studentCount}</span>
						<span class="stat-label">Total Students</span>
					</div>
				{/if}
			</div>
			<div class="card-footer">
				<a href="/students" class="card-link">View Students</a>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3>Account</h3>
			</div>
			<div class="card-content">
				{#if session?.user}
					<div class="account-info">
						<p><strong>Email:</strong> {session.user.email}</p>
						<p>
							<strong>Last Sign In:</strong>
							{new Date(session.user.last_sign_in_at || Date.now()).toLocaleString()}
						</p>
					</div>
				{:else}
					<p>Session information not available</p>
				{/if}
			</div>
			<div class="card-footer">
				<a href="/(protected)/profile" class="card-link">Edit Profile</a>
			</div>
		</div>
	</div>
</div>
