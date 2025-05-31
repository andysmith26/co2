<!-- src/lib/components/Projects/ProjectsFilters.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Group } from '../../types';

	// Props
	const {
		groups = [],
		selectedGroupId = '',
		groupsLoading = false,
		showCreateForm = false,
	} = $props<{
		groups?: Group[];
		selectedGroupId?: string;
		groupsLoading?: boolean;
		showCreateForm?: boolean;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	function handleGroupChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('groupChange', { groupId: target.value });
	}

	function handleCreateProject() {
		dispatch('createProject');
	}
</script>

<!-- Controls -->
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<!-- Group Filter -->
	<div class="flex items-center gap-2">
		<label for="group-filter" class="text-sm font-medium text-gray-700">Group:</label>
		<select
			id="group-filter"
			value={selectedGroupId}
			on:change={handleGroupChange}
			class="select select-sm select-bordered"
			disabled={groupsLoading}
		>
			<option value="">All Groups</option>
			{#each groups as group}
				<option value={group.id}>{group.name}</option>
			{/each}
		</select>

		{#if groupsLoading}
			<div class="loading loading-spinner loading-xs"></div>
		{/if}
	</div>

	<!-- Create Button -->
	{#if !showCreateForm}
		<button on:click={handleCreateProject} class="btn btn-primary btn-sm">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Project
		</button>
	{/if}
</div>
