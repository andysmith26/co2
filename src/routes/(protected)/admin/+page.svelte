<style>
	.admin-dashboard {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.admin-card {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
	}

	th,
	td {
		text-align: left;
		padding: 8px;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f2f2f2;
	}

	.error {
		background-color: #fee2e2;
		border-left: 4px solid #ef4444;
		padding: 12px;
		margin: 12px 0;
	}

	.stats-list {
		list-style: none;
		padding: 0;
	}

	.stats-list li {
		margin-bottom: 8px;
	}

	.refresh-button,
	.retry-button {
		align-self: flex-start;
		padding: 8px 16px;
		background: #0ea5e9;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.refresh-button:hover:not([disabled]),
	.retry-button:hover {
		background: #0284c7;
	}

	.refresh-button[disabled] {
		background: #94a3b8;
		cursor: not-allowed;
	}

	.retry-button {
		background: #f97316;
		margin-top: 8px;
	}

	.retry-button:hover {
		background: #ea580c;
	}

	.loading-spinner {
		width: 30px;
		height: 30px;
		border: 3px solid #f3f3f3;
		border-top: 3px solid #0ea5e9;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 10px auto;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.admin-debug {
		margin-bottom: 20px;
		font-family: monospace;
		font-size: 12px;
		background-color: #f0f0f0;
		padding: 10px;
		border-radius: 4px;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		margin: 20px 0;
	}
</style>

<!-- src/routes/(protected)/admin/+page.svelte -->
<script>
	import { onMount } from 'svelte';

	// State variables
	let stats = $state(null);
	let loading = $state(true);
	let statsLoading = $state(false);
	let error = $state(null);
	let statsError = $state(null);
	let adminStatus = $state(null);

	// Debug function to track loading state
	function debugState(label) {
		console.log(`[${label}] Admin Dashboard State:`, {
			loading,
			statsLoading,
			error,
			statsError,
			adminStatus: adminStatus ? 'exists' : null,
		});
	}

	async function fetchAdminStatus() {
		console.log('🔄 Starting fetchAdminStatus');
		try {
			// Reset state
			loading = true;
			error = null;
			statsError = null;

			debugState('Before fetch');

			// Directly fetch from the API with no-cache to avoid stale responses
			const response = await fetch('/api/test-admin', {
				method: 'GET',
				headers: {
					'Cache-Control': 'no-cache',
					Pragma: 'no-cache',
				},
			});

			if (!response.ok) {
				throw new Error(`API returned ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('✅ Admin check response:', data);

			// Check for error format
			if (data.success === false) {
				throw new Error(data.error || 'Unknown error checking admin status');
			}

			// Store admin status
			adminStatus = data;
			debugState('After admin check');

			// If admin, fetch stats
			if (data.admin) {
				await fetchStats();
			}
		} catch (err) {
			console.error('❌ Error checking admin status:', err);
			error = err.message || 'Error checking admin status';
		} finally {
			// IMPORTANT: Set loading to false AFTER all async operations
			loading = false;
			console.log('✅ Completed fetchAdminStatus - loading:', loading);
			debugState('Final state');
		}
	}

	async function fetchStats() {
		console.log('🔄 Starting fetchStats');
		try {
			statsLoading = true;
			statsError = null;
			debugState('Stats loading');

			const response = await fetch('/api/admin/stats', {
				method: 'GET',
				headers: {
					'Cache-Control': 'no-cache',
					Pragma: 'no-cache',
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('❌ Stats API error:', errorData);
				throw new Error(errorData.error || errorData.message || 'Failed to fetch admin stats');
			}

			const data = await response.json();
			console.log('✅ Stats received:', data);
			stats = data;
			debugState('Stats loaded');
		} catch (err) {
			console.error('❌ Error fetching stats:', err);
			statsError = err.message || 'Failed to load statistics';
		} finally {
			statsLoading = false;
			debugState('After stats fetch');
		}
	}

	// Force update function for troubleshooting
	function forceRefresh() {
		loading = false;
		setTimeout(() => {
			fetchAdminStatus();
		}, 100);
	}

	// Handle initialization
	onMount(() => {
		console.log('🔄 Admin dashboard component mounted');
		setTimeout(fetchAdminStatus, 100);

		// Return cleanup function
		return () => {
			console.log('Admin dashboard component unmounted');
		};
	});
</script>

<h1>Admin Dashboard</h1>

<div class="admin-debug">
	<details>
		<summary>Debug Info</summary>
		<p>Loading: {loading}</p>
		<p>Stats Loading: {statsLoading}</p>
		<p>Admin Status: {adminStatus ? 'Received' : 'None'}</p>
		<p>Error: {error}</p>
		<p>Stats Error: {statsError}</p>
		<button on:click={forceRefresh}>Force Refresh</button>
	</details>
</div>

{#if loading}
	<div class="loading-container">
		<p>Loading admin status...</p>
		<div class="loading-spinner"></div>
		<button on:click={forceRefresh} class="retry-button">Retry</button>
	</div>
{:else if error}
	<div class="error">
		<p>Error: {error}</p>
		<button on:click={fetchAdminStatus}>Retry</button>
	</div>
{:else if !adminStatus?.admin}
	<div class="error">
		<h2>Access Denied</h2>
		<p>You don't have admin privileges.</p>
		<p>{adminStatus?.message || 'Your account does not have admin permissions.'}</p>
	</div>
{:else}
	<div class="admin-dashboard">
		<div class="admin-card">
			<h2>System Status</h2>
			<p>✅ Admin access confirmed</p>
			<p>Logged in as: {adminStatus.email || 'Unknown'}</p>
		</div>

		{#if statsLoading}
			<div class="admin-card">
				<p>Loading statistics...</p>
				<div class="loading-spinner"></div>
			</div>
		{:else if statsError}
			<div class="error admin-card">
				<h3>Error Loading Statistics</h3>
				<p>{statsError}</p>
				<button on:click={fetchStats} class="retry-button">Retry</button>
			</div>
		{:else if stats}
			<div class="admin-card">
				<h2>Student Statistics</h2>
				<p>Total Students: <strong>{stats.totalStudents}</strong></p>

				<h3>Status Breakdown</h3>
				<ul class="stats-list">
					<li>Present: <strong>{stats.statusCounts?.present || 0}</strong></li>
					<li>Absent: <strong>{stats.statusCounts?.absent || 0}</strong></li>
					<li>Late: <strong>{stats.statusCounts?.late || 0}</strong></li>
				</ul>

				{#if Object.keys(stats.teacherCounts || {}).length > 0}
					<h3>Teacher Breakdown</h3>
					<table>
						<thead>
							<tr>
								<th>Teacher</th>
								<th>Students</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.entries(stats.teacherCounts || {}) as [teacherId, count]}
								<tr>
									<td>{stats.teacherEmails?.[teacherId] || teacherId}</td>
									<td>{count}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p>No teacher data available.</p>
				{/if}
			</div>
		{:else}
			<div class="admin-card">
				<p>No statistics available. Click refresh to load data.</p>
			</div>
		{/if}

		<button on:click={fetchStats} class="refresh-button" disabled={statsLoading}>
			{statsLoading ? 'Loading...' : 'Refresh Stats'}
		</button>
	</div>
{/if}
