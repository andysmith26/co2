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
		tasksMap = {}, // Tasks by project ID
	} = $props<{
		projects: Project[];
		loading?: boolean;
		showGroupName?: boolean;
		tasksMap?: Record<string, Task[]>;
	}>();

	// State
	let searchQuery: string = $state('');

	// Events
	const dispatch = createEventDispatcher();

	// Filter projects based on search query
	const filteredProjects = $derived(
		projects.filter(
			(project) =>
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(project.description &&
					project.description.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	// Handle clicking on a project
	function handleProjectSelect(event: CustomEvent) {
		dispatch('select', event.detail);
	}
</script>

<div class="project-list">
	<!-- Search Bar -->
	<div class="mb-4">
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search projects..."
				class="w-full rounded-md border px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
			/>
			<span class="absolute top-2.5 right-3 text-gray-400">
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
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</span>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if filteredProjects.length === 0}
		<div class="rounded-lg bg-gray-50 py-12 text-center">
			<h3 class="mb-2 text-lg font-medium text-gray-700">No Projects Found</h3>
			<p class="text-gray-500">
				{projects.length > 0
					? 'Try a different search term or create a new project.'
					: 'Create your first project to get started.'}
			</p>
		</div>
	{:else}
		<!-- Projects Grid with Simplified Cards -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredProjects as project (project.id)}
				<ProjectCard {project} tasks={tasksMap[project.id] || []} on:select={handleProjectSelect} />
			{/each}
		</div>
	{/if}
</div>
