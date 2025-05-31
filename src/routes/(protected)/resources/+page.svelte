<!-- src/routes/(protected)/resources/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resourceStore } from '$lib/stores/resources.svelte.ts';
	import { groupStore } from '$lib/stores/groups.svelte.ts';
	import ResourceList from '$lib/components/Resources/ResourceList.svelte';
	import ResourceForm from '$lib/components/Resources/ResourceForm.svelte';
	import { RESOURCE_TYPES } from '$lib/constants';

	// State
	let showCreateForm = $state(false);
	let editingResource = $state<any | null>(null);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedGroupFilter = $state('all');
	let selectedTypeFilter = $state('all');

	// Store references
	const resources = $derived(resourceStore.getResources());
	const loading = $derived(resourceStore.loading);
	const storeError = $derived(resourceStore.error);
	const groups = $derived(groupStore.getGroups());
	const groupsLoading = $derived(groupStore.loading);

	// Initialize data
	onMount(async () => {
		console.log('🔄 Resources page mounting');
		try {
			// Load groups and resources in parallel
			await Promise.all([groupStore.fetchGroups(), resourceStore.fetchResources()]);
		} catch (err) {
			console.error('Error loading initial data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load data';
			}
		}
	});

	// Propagate store error to local error
	$effect(() => {
		if (storeError) {
			error = storeError;
		}
	});

	// Apply filters when they change
	$effect(() => {
		const filters: any = {};

		if (selectedGroupFilter && selectedGroupFilter !== 'all') {
			filters.groupId = selectedGroupFilter;
		}

		if (selectedTypeFilter && selectedTypeFilter !== 'all') {
			filters.type = selectedTypeFilter;
		}

		if (searchQuery.trim()) {
			filters.search = searchQuery.trim();
		}

		// Only fetch if we have any filters or if this is a refresh
		if (
			Object.keys(filters).length > 0 ||
			selectedGroupFilter !== 'all' ||
			selectedTypeFilter !== 'all'
		) {
			resourceStore.fetchResources(filters);
		}
	});

	// Event handlers
	async function handleCreateResource(event: CustomEvent) {
		try {
			const { type, title, url, description, group_id } = event.detail;
			console.log('🔄 Creating resource:', { type, title, url, group_id });
			await resourceStore.createResource(type, title, url, description, group_id);
			showCreateForm = false;
			editingResource = null;
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to create resource';
			}
			console.error('Error creating resource:', err);
		}
	}

	async function handleUpdateResource(event: CustomEvent) {
		try {
			const { resourceId, title, url, description, group_id } = event.detail;
			console.log('🔄 Updating resource:', { resourceId, title, url, group_id });
			await resourceStore.updateResource(resourceId, { title, url, description, group_id });
			showCreateForm = false;
			editingResource = null;
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update resource';
			}
			console.error('Error updating resource:', err);
		}
	}

	function handleEditResource(event: CustomEvent) {
		editingResource = event.detail;
		showCreateForm = true;
	}

	async function handleDeleteResource(event: CustomEvent) {
		try {
			const { resourceId } = event.detail;
			console.log('🔄 Deleting resource:', resourceId);
			await resourceStore.deleteResource(resourceId);
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete resource';
			}
			console.error('Error deleting resource:', err);
		}
	}

	function handleCancelForm() {
		showCreateForm = false;
		editingResource = null;
	}

	async function refreshResources() {
		const filters: any = {};

		if (selectedGroupFilter && selectedGroupFilter !== 'all') {
			filters.groupId = selectedGroupFilter;
		}

		if (selectedTypeFilter && selectedTypeFilter !== 'all') {
			filters.type = selectedTypeFilter;
		}

		if (searchQuery.trim()) {
			filters.search = searchQuery.trim();
		}

		await resourceStore.fetchResources(filters);
	}

	function clearFilters() {
		searchQuery = '';
		selectedGroupFilter = 'all';
		selectedTypeFilter = 'all';
		resourceStore.fetchResources();
	}
</script>

<svelte:head>
	<title>Resources | CO2</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Resources</h1>
			<p class="text-gray-600">
				Manage educational resources and links that can be shared across projects and groups
			</p>
		</div>

		<div class="flex items-center gap-2">
			<!-- Refresh Button -->
			<button
				on:click={refreshResources}
				class="btn btn-sm btn-circle btn-ghost"
				title="Refresh resources"
				disabled={loading}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</button>

			<!-- Create Button -->
			{#if !showCreateForm}
				<button on:click={() => (showCreateForm = true)} class="btn btn-primary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Resource
				</button>
			{/if}
		</div>
	</header>

	{#if error}
		<div class="mb-6 rounded-md bg-red-100 p-4 text-red-700">
			{error}
			<button on:click={() => (error = null)} class="float-right">&times;</button>
		</div>
	{/if}

	<!-- Filters -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
			<!-- Search -->
			<div>
				<label for="search" class="mb-1 block text-sm font-medium text-gray-700">Search</label>
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					placeholder="Search title, description, or URL..."
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				/>
			</div>

			<!-- Group Filter -->
			<div>
				<label for="group-filter" class="mb-1 block text-sm font-medium text-gray-700">Group</label>
				<select
					id="group-filter"
					bind:value={selectedGroupFilter}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					disabled={groupsLoading}
				>
					<option value="all">All Resources</option>
					<option value="global">Global Resources</option>
					{#each groups as group}
						<option value={group.id}>{group.name}</option>
					{/each}
				</select>
			</div>

			<!-- Type Filter -->
			<div>
				<label for="type-filter" class="mb-1 block text-sm font-medium text-gray-700">Type</label>
				<select
					id="type-filter"
					bind:value={selectedTypeFilter}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value="all">All Types</option>
					<option value={RESOURCE_TYPES.LINK}>Links</option>
				</select>
			</div>

			<!-- Clear Filters -->
			<div class="flex items-end">
				<button
					on:click={clearFilters}
					class="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Clear Filters
				</button>
			</div>
		</div>
	</div>

	<!-- Resource Form -->
	{#if showCreateForm}
		<div class="mb-6">
			<ResourceForm
				{groups}
				initialResource={editingResource}
				on:submit={editingResource ? handleUpdateResource : handleCreateResource}
				on:cancel={handleCancelForm}
			/>
		</div>
	{/if}

	<!-- Resources Count -->
	{#if !loading}
		<div class="mb-4 text-sm text-gray-600">
			Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
		</div>
	{/if}

	<!-- Resource List -->
	<ResourceList
		{resources}
		{loading}
		on:edit={handleEditResource}
		on:delete={handleDeleteResource}
	/>
</div>
