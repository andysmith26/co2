<!-- src/lib/components/Projects/ProjectList.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project, Task } from '../../types';
	import ProjectCard from './ProjectCard.svelte';

	// Props
	const {
		projects = [],
		loading = false,
		showGroupName = false,
		tasksMap = {}, // Tasks by project ID - Task[] | null | undefined
		tasksLoadingSet = new Set(), // Set of project IDs currently loading tasks
	} = $props<{
		projects: Project[];
		loading?: boolean;
		showGroupName?: boolean;
		tasksMap?: Record<string, Task[] | null>;
		tasksLoadingSet?: Set<string>;
	}>();

	// State
	let searchQuery: string = $state('');

	// Events
	const dispatch = createEventDispatcher();

	// Filter projects based on search query
	const filteredProjects = $derived(
		projects.filter((project) => {
			const query = searchQuery.toLowerCase().trim();
			if (!query) return true;

			return (
				project.title.toLowerCase().includes(query) ||
				(project.description && project.description.toLowerCase().includes(query)) ||
				project.status.toLowerCase().includes(query)
			);
		})
	);

	// Loading projects count
	const loadingTasksCount = $derived(tasksLoadingSet.size);

	// Handle clicking on a project
	function handleProjectSelect(event: CustomEvent) {
		dispatch('select', event.detail);
	}

	// Clear search
	function clearSearch() {
		searchQuery = '';
	}
</script>

<div class="projects-list">
	<!-- Search and Stats Bar -->
	{#if projects.length > 0}
		<div class="mb-6 space-y-4">
			<!-- Search Input -->
			<div class="relative max-w-md">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search projects..."
					class="block w-full rounded-lg border border-gray-300 py-2.5 pr-10 pl-9 text-sm placeholder-gray-500 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
				/>
				{#if searchQuery}
					<button
						on:click={clearSearch}
						class="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors hover:text-gray-600"
						aria-label="Clear search"
					>
						<svg
							class="h-4 w-4 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>

			<!-- Results Info -->
			<div class="flex items-center justify-between text-sm text-gray-600">
				<div class="flex items-center space-x-4">
					<span>
						{#if searchQuery}
							{filteredProjects.length} of {projects.length} projects
						{:else}
							{projects.length} project{projects.length !== 1 ? 's' : ''}
						{/if}
					</span>

					{#if loadingTasksCount > 0}
						<div class="flex items-center space-x-1 text-indigo-600">
							<div
								class="h-3 w-3 animate-spin rounded-full border border-indigo-300 border-t-indigo-600"
							></div>
							<span
								>Loading tasks for {loadingTasksCount} project{loadingTasksCount !== 1
									? 's'
									: ''}</span
							>
						</div>
					{/if}
				</div>

				{#if searchQuery}
					<button
						on:click={clearSearch}
						class="font-medium text-indigo-600 transition-colors hover:text-indigo-800"
					>
						Clear search
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Loading State -->
	{#if loading && projects.length === 0}
		<div class="flex flex-col items-center justify-center py-16">
			<div
				class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
			></div>
			<p class="text-lg font-medium text-gray-600">Loading projects...</p>
			<p class="mt-1 text-sm text-gray-500">This should only take a moment</p>
		</div>

		<!-- Empty State - No Projects -->
	{:else if projects.length === 0}
		<div class="py-16 text-center">
			<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
				<svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-xl font-semibold text-gray-900">No projects yet</h3>
			<p class="mx-auto mb-6 max-w-md text-gray-600">
				Get started by creating your first project. You can organize tasks, collaborate with your
				team, and track progress all in one place.
			</p>
			<div class="text-sm text-gray-500">Click the "New Project" button above to begin</div>
		</div>

		<!-- Empty Search Results -->
	{:else if filteredProjects.length === 0}
		<div class="py-16 text-center">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
				<svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">No projects found</h3>
			<p class="mb-4 text-gray-600">
				We couldn't find any projects matching "{searchQuery}"
			</p>
			<button
				on:click={clearSearch}
				class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200"
			>
				Clear search and show all projects
			</button>
		</div>

		<!-- Projects Grid -->
	{:else}
		<div
			class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
		>
			{#each filteredProjects as project (project.id)}
				<ProjectCard
					{project}
					tasks={tasksMap[project.id] ?? null}
					tasksLoading={tasksLoadingSet.has(project.id)}
					on:select={handleProjectSelect}
				/>
			{/each}
		</div>

		<!-- Search Results Footer -->
		{#if searchQuery && filteredProjects.length > 0}
			<div class="mt-8 text-center">
				<p class="text-sm text-gray-500">
					Showing {filteredProjects.length} of {projects.length} projects for "{searchQuery}"
				</p>
			</div>
		{/if}
	{/if}
</div>
