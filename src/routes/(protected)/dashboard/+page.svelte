<style>
	.dashboard {
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.user-info {
		background-color: #f5f5f5;
		padding: 1rem;
		border-radius: 5px;
		margin: 1rem 0;
	}

	button {
		background-color: #ff3e00;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
	}
</style>

<script lang="ts">
	// Use $props rune
	let { data } = $props();
	// Use $derived for computed values
	let { session, user } = $derived(data);
</script>

<div class="dashboard">
	<h1>Welcome to Your Dashboard</h1>

	<div class="user-info">
		<h2>User Information</h2>
		<p>Email: {user?.email}</p>
		<p>Last Sign In: {new Date(session?.last_sign_in_at || '').toLocaleString()}</p>
	</div>

	<form action="/signout" method="POST">
		<button type="submit">Sign Out</button>
	</form>
</div>
