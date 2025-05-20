<!-- src/lib/components/Projects/ProjectList.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project } from '../../types';
	import { PROJECT_STATUS } from '../../constants';

	// Props
	const {
		projects = [],
		loading = false,
		showGroupName = false
	} = $props<{
		projects: Project[];
		loading?: boolean;
		showGroupName?: boolean;
	}>();

	// State
	let searchQuery: string = $state('');

	// Events
	const dispatch = createEventDispatcher();

	// Filter projects based on search query
	const filteredProjects = $derived(
		projects.filter((project) => 
			project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	// Handle clicking on a project
	function handleProjectClick(project: Project) {
		dispatch('select', project);
	}

	// Status color mapping
	function getStatusColor(status: string): string {
		switch (status) {
			case PROJECT_STATUS.ACTIVE:
				return 'bg-green-100 text-green-800';
			case PROJECT_STATUS.COMPLETED:
				return 'bg-blue-100 text-blue-800';
			case PROJECT_STATUS.ARCHIVED:
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
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
				class="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
			/>
			<span class="absolute right-3 top-2.5 text-gray-400">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</span>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if filteredProjects.length === 0}
		<div class="text-center py-12 bg-gray-50 rounded-lg">
			<h3 class="text-lg font-medium text-gray-700 mb-2">No Projects Found</h3>
			<p class="text-gray-500">
				{projects.length > 0
					? 'Try a different search term or create a new project.'
					: 'Create your first project to get started.'}
			</p>
		</div>
	{:else}
		<!-- Projects Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each filteredProjects as project (project.id)}
				<div
					class="bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition duration-150 ease-in-out overflow-hidden relative"
					on:click={() => handleProjectClick(project)}
				>
					<!-- Status Badge -->
					<div class="absolute top-0 right-0 m-2">
						<span class={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
							{project.status}
						</span>
					</div>

					<div class="p-4">
						<h3 class="text-lg font-medium text-gray-900 mb-1 truncate" title={project.title}>
							{project.title}
						</h3>
						
						{#if showGroupName && project.group_name}
							<p class="text-xs text-gray-500 mb-2">{project.group_name}</p>
						{/if}
						
						{#if project.description}
							<p class="text-sm text-gray-500 line-clamp-2" title={project.description}>
								{project.description}
							</p>
						{/if}
						
						<div class="mt-2 text-xs text-gray-400">
							Created {new Date(project.created_at).toLocaleDateString()}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
