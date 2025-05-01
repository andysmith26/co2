<style>
	.dashboard {
		padding: 1rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.logout-button {
		padding: 0.5rem 1rem;
		background-color: #f8f9fa;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
	}

	.dashboard-content {
		display: grid;
		gap: 2rem;
	}

	.students-section {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		padding: 1.5rem;
	}

	.student-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
	}

	.student-item {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem;
		border-bottom: 1px solid #eee;
	}

	.student-item:last-child {
		border-bottom: none;
	}

	.student-status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.present {
		background-color: #e8f5e9;
		color: #2e7d32;
	}

	.absent {
		background-color: #ffebee;
		color: #c62828;
	}

	.error {
		color: #e74c3c;
		background-color: #fdf1f0;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.retry-button {
		padding: 0.5rem 1rem;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>

<script>
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { students, loading, error, fetchStudents } from '$lib/stores/students';

	export let data;

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}
</script>

<svelte:head>
	<title>Dashboard | LearningSpace</title>
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>Dashboard</h1>
		<div class="user-info">
			<span>Welcome, {data.session.user.email}</span>
			<button on:click={handleLogout} class="logout-button">Logout</button>
		</div>
	</header>

	<div class="dashboard-content">
		<section class="students-section">
			<h2>Students</h2>

			{#if $loading}
				<p>Loading...</p>
			{:else if $error}
				<p class="error">{$error}</p>
				<button on:click={fetchStudents} class="retry-button">Retry</button>
			{:else if $students.length === 0}
				<p>No students available. Add your first student.</p>
			{:else}
				<ul class="student-list">
					{#each $students as student}
						<li class="student-item">
							<span class="student-name">{student.first_name} {student.last_initial}.</span>
							<span
								class="student-status"
								class:present={student.status === 'present'}
								class:absent={student.status === 'absent'}
							>
								{student.status}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>
