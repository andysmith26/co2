<script lang="ts">
	import { groupStore } from '$lib/stores/groups.svelte.ts';
	import GroupForm from '$lib/components/Groups/GroupForm.svelte';

	// State with proper Svelte 5 syntax
	let showCreateForm = $state(false);
	let error: string | null = $state(null);

	// References to store values using $derived
	const groups = $derived(groupStore.groups);
	const loading = $derived(groupStore.loading);
	const storeError = $derived(groupStore.error);

	// Lifecycles
	$effect(() => {
		// Refresh groups list when page loads
		groupStore.fetchGroups();
	});

	$effect(() => {
		// Propagate store error to local state
		if (storeError) {
			error = storeError;
		}
	});

	// Event handlers
	async function handleCreateGroup(event) {
		try {
			const { name, description } = event.detail;
			await groupStore.createGroup(name, description);
			showCreateForm = false;
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to create group';
			}
			console.error('Error creating group:', err);
		}
	}

	function handleCancelCreate() {
		showCreateForm = false;
	}
</script>

<svelte:head>
	<title>Groups</title>
</svelte:head>

<div class="groups-page container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Groups</h1>

		{#if !showCreateForm}
			<button
				onclick={() => (showCreateForm = true)}
				class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>
				Create New Group
			</button>
		{/if}
	</div>

	{#if error}
		<div class="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
			{error}
		</div>
	{/if}

	{#if showCreateForm}
		<div class="mb-8">
			<GroupForm on:submit={handleCreateGroup} on:cancel={handleCancelCreate} />
		</div>
	{/if}

	{#if loading && groups.length === 0}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-indigo-600"></span>
		</div>
	{:else if groups.length === 0}
		<div class="text-center py-12 bg-gray-50 rounded-lg">
			<h3 class="text-lg font-medium text-gray-700 mb-2">No Groups Yet</h3>
			<p class="text-gray-500 mb-6">
				Create your first group to start organizing students and activities.
			</p>
			{#if !showCreateForm}
				<button
					onclick={() => (showCreateForm = true)}
					class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				>
					Create New Group
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each groups as group (group.id)}
				<a
					href={`/groups/${group.id}`}
					class="block p-6 bg-white rounded-lg shadow hover:shadow-md transition duration-150 ease-in-out"
				>
					<h3 class="text-lg font-medium text-gray-900 mb-2">{group.name}</h3>
					{#if group.description}
						<p class="text-gray-500 line-clamp-3">{group.description}</p>
					{/if}
					<div class="mt-4 flex items-center text-sm text-gray-500">
						<span>Created {new Date(group.created_at).toLocaleDateString()}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
