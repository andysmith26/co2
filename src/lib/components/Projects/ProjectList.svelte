<!-- src/lib/components/Projects/ProjectList.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project, Task } from '../../types';
	import { PROJECT_STATUS } from '../../constants';
	import TaskBadge from '$lib/components/Tasks/TaskBadge.svelte';

	// Props
	const {
		projects = [],
		loading = false,
		showGroupName = false,
		tasksMap = {}, // New prop for tasks by project
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

	// Get the most recent task for a project
	function getMostRecentTask(projectId: string): Task | null {
		const tasks = tasksMap[projectId] || [];
		if (tasks.length === 0) return null;

		// Sort by updated_at date (descending)
		return [...tasks].sort(
			(a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
		)[0];
	}

	// Calculate progress percentage for a project
	function getProjectProgress(projectId: string): number {
		const tasks = tasksMap[projectId] || [];
		if (tasks.length === 0) return 0;

		const completedTasks = tasks.filter((task) => task.status === 'completed').length;
		return Math.round((completedTasks / tasks.length) * 100);
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
		<!-- Projects Big Board Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredProjects as project (project.id)}
				<div
					class="relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow transition duration-150 ease-in-out hover:shadow-md"
					role="button"
					tabindex="0"
					on:click={() => handleProjectClick(project)}
					on:keydown={(e) => e.key === 'Enter' && handleProjectClick(project)}
				>
					<!-- Status Badge -->
					<div class="absolute top-0 right-0 m-2">
						<span class={`rounded-full px-2 py-1 text-xs ${getStatusColor(project.status)}`}>
							{project.status}
						</span>
					</div>

					<div class="flex-grow p-4">
						<h3 class="mb-1 truncate text-lg font-medium text-gray-900" title={project.title}>
							{project.title}
						</h3>

						{#if showGroupName && project.group_name}
							<p class="mb-2 text-xs text-gray-500">{project.group_name}</p>
						{/if}

						{#if project.description}
							<p class="mb-3 line-clamp-2 text-sm text-gray-500" title={project.description}>
								{project.description}
							</p>
						{/if}

						<!-- Task Progress -->
						{#if tasksMap[project.id] && tasksMap[project.id].length > 0}
							<div class="mt-2 mb-3">
								<div class="mb-1 flex justify-between text-xs text-gray-500">
									<span>Progress</span>
									<span>{getProjectProgress(project.id)}%</span>
								</div>
								<div class="h-2 w-full rounded-full bg-gray-200">
									<div
										class="h-2 rounded-full bg-indigo-600"
										style="width: {getProjectProgress(project.id)}%"
									></div>
								</div>
							</div>
						{/if}

						<div class="mt-2 text-xs text-gray-400">
							Created {new Date(project.created_at).toLocaleDateString()}
						</div>
					</div>

					<!-- Recent Tasks Section -->
					{#if tasksMap[project.id] && tasksMap[project.id].length > 0}
						<div class="mt-2 px-4 pb-4">
							<h4 class="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
								{tasksMap[project.id].length === 1
									? 'Task'
									: `Tasks (${tasksMap[project.id].length})`}
							</h4>

							{#if tasksMap[project.id].length === 1}
								<!-- Single task -->
								<TaskBadge task={tasksMap[project.id][0]} />
							{:else if tasksMap[project.id].length > 1}
								<!-- Most recent task -->
								<div class="space-y-2">
									<TaskBadge task={getMostRecentTask(project.id)} />
									<p class="text-xs text-gray-400 italic">
										{tasksMap[project.id].length - 1} more {tasksMap[project.id].length - 1 === 1
											? 'task'
											: 'tasks'}
									</p>
								</div>
							{/if}
						</div>
					{:else}
						<div class="mt-2 px-4 pb-4">
							<p class="text-xs text-gray-400 italic">No tasks yet</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
