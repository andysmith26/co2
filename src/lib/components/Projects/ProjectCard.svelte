<style>
	.project-card {
		min-height: 120px;
		display: flex;
		flex-direction: column;
	}

	.project-card:hover {
		transform: translateY(-1px);
	}

	.project-card:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>

<!-- src/lib/components/Projects/ProjectCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project, Task } from '../../types';
	import TaskStatusLight from '$lib/components/Tasks/TaskStatusLight.svelte';
	import { formatAssigneeInitials } from '$lib/utils/taskHelpers';

	// Props
	const { project, tasks = [] } = $props<{
		project: Project;
		tasks: Task[];
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Handle clicking on the project card
	function handleProjectClick() {
		dispatch('select', project);
	}
</script>

<div
	class="project-card cursor-pointer overflow-hidden rounded-lg bg-white shadow transition duration-150 ease-in-out hover:shadow-md"
	role="button"
	tabindex="0"
	on:click={handleProjectClick}
	on:keydown={(e) => e.key === 'Enter' && handleProjectClick()}
>
	<!-- Project Title -->
	<div class="border-b border-gray-200 px-4 py-3">
		<h3 class="truncate text-lg font-medium text-gray-900" title={project.title}>
			{project.title}
		</h3>
	</div>

	<!-- Task List -->
	<div class="px-4 py-3">
		{#if tasks.length === 0}
			<p class="text-sm text-gray-500 italic">No tasks yet</p>
		{:else}
			<div class="space-y-2">
				{#each tasks as task (task.id)}
					<div class="flex items-center gap-2 text-sm">
						<!-- Status Light -->
						<TaskStatusLight status={task.status} />

						<!-- Task Name -->
						<span
							class="flex-1 truncate"
							class:line-through={task.status === 'completed'}
							class:text-gray-500={task.status === 'completed'}
							title={task.title}
						>
							{task.title}
						</span>

						<!-- Assignee Initials -->
						<span class="font-mono text-xs text-gray-400">
							{formatAssigneeInitials(task)}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
