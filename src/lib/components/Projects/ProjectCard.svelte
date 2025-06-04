<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

<!-- src/lib/components/Projects/ProjectCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project, Task } from '../../types';
	import { TASK_STATUS } from '../../constants';

	// Props
	const {
		project,
		tasks = null,
		tasksLoading = false,
	} = $props<{
		project: Project;
		tasks: Task[] | null;
		tasksLoading?: boolean;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Status colors
	const statusColors = {
		active: 'bg-green-100 text-green-800 border-green-200',
		completed: 'bg-blue-100 text-blue-800 border-blue-200',
		archived: 'bg-gray-100 text-gray-800 border-gray-200',
	};

	// Task status colors
	function getStatusColor(status: string): string {
		switch (status) {
			case TASK_STATUS.TODO:
				return 'bg-amber-400';
			case TASK_STATUS.IN_PROGRESS:
				return 'bg-blue-500';
			case TASK_STATUS.COMPLETED:
				return 'bg-green-500';
			default:
				return 'bg-gray-400';
		}
	}

	// Handle card click
	function handleClick() {
		dispatch('select', project);
	}

	// Handle card keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<div
	class="project-card group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-300 hover:shadow-md"
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={handleKeydown}
	aria-label="Open project {project.title}"
>
	<!-- Project Header -->
	<div class="p-5">
		<div class="mb-3 flex items-start justify-between">
			<div class="min-w-0 flex-1">
				<h3
					class="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600"
				>
					{project.title}
				</h3>
				{#if project.description}
					<p class="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
						{project.description}
					</p>
				{/if}
			</div>

			<!-- Status Badge -->
			<span
				class="ml-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {statusColors[
					project.status
				] || statusColors.active}"
			>
				{project.status}
			</span>
		</div>

		<!-- Tasks Section -->
		{#if tasksLoading}
			<!-- Loading State -->
			<div class="space-y-2">
				<div class="mb-2 flex items-center text-xs text-gray-500">
					<div class="mr-2 flex space-x-1">
						<div
							class="h-1 w-1 animate-bounce rounded-full bg-gray-400"
							style="animation-delay: 0ms"
						></div>
						<div
							class="h-1 w-1 animate-bounce rounded-full bg-gray-400"
							style="animation-delay: 150ms"
						></div>
						<div
							class="h-1 w-1 animate-bounce rounded-full bg-gray-400"
							style="animation-delay: 300ms"
						></div>
					</div>
					<span>Loading tasks</span>
				</div>
				<!-- Skeleton tasks -->
				{#each Array(3) as _, i}
					<div class="flex animate-pulse items-center space-x-2">
						<div class="h-2 w-2 rounded-full bg-gray-200"></div>
						<div class="h-3 flex-1 rounded bg-gray-200" style="width: {80 - i * 15}%"></div>
						<div class="h-3 w-4 rounded bg-gray-200"></div>
					</div>
				{/each}
			</div>
		{:else if tasks === null}
			<!-- Initial state - tasks not loaded yet -->
			<div class="flex items-center justify-center py-3 text-gray-400">
				<div class="flex space-x-1">
					<div
						class="h-1 w-1 animate-bounce rounded-full bg-gray-300"
						style="animation-delay: 0ms"
					></div>
					<div
						class="h-1 w-1 animate-bounce rounded-full bg-gray-300"
						style="animation-delay: 150ms"
					></div>
					<div
						class="h-1 w-1 animate-bounce rounded-full bg-gray-300"
						style="animation-delay: 300ms"
					></div>
				</div>
			</div>
		{:else if tasks.length === 0}
			<!-- No tasks state -->
			<div class="py-3 text-center">
				<div class="text-sm text-gray-400">No tasks yet</div>
				<div class="mt-1 text-xs text-gray-400">Click to add tasks</div>
			</div>
		{:else}
			<!-- Tasks loaded -->
			<div class="space-y-2">
				<!-- Show up to 5 tasks (increased from 4 since we have more space) -->
				{#each tasks.slice(0, 5) as task (task.id)}
					<div class="flex items-center space-x-2 text-sm">
						<!-- Status indicator -->
						<div
							class="h-2 w-2 flex-shrink-0 rounded-full {getStatusColor(task.status)}"
							title={task.status}
						></div>

						<!-- Task title -->
						<span
							class="flex-1 truncate {task.status === TASK_STATUS.COMPLETED
								? 'text-gray-500 line-through'
								: 'text-gray-700'}"
							title={task.title}
						>
							{task.title}
						</span>

						<!-- Assignee indicator -->
						{#if task.assignee_type}
							<span class="w-6 text-right font-mono text-xs text-gray-400">
								{#if task.assignee_type === 'teacher' && task.assignee}
									{task.assignee.first_name?.charAt(0)}{task.assignee.last_name?.charAt(0)}
								{:else if task.assignee_type === 'student' && task.student_assignee}
									{task.student_assignee.first_name?.charAt(0)}{task.student_assignee.last_initial}
								{:else}
									??
								{/if}
							</span>
						{:else}
							<span class="w-6"></span>
						{/if}
					</div>
				{/each}

				<!-- Show "and X more" if there are more tasks -->
				{#if tasks.length > 5}
					<div class="pt-1 text-center text-xs text-gray-500">
						and {tasks.length - 5} more task{tasks.length - 5 !== 1 ? 's' : ''}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
