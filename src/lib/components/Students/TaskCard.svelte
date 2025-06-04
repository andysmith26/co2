<!-- src/lib/components/Students/TaskCard.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { StudentTask } from '$lib/types/student';

	interface TaskCardProps {
		task: StudentTask;
		showProject?: boolean;
		compact?: boolean;
	}

	const { 
		task, 
		showProject = true, 
		compact = false 
	} = $props<TaskCardProps>();

	// Helper functions
	function getStatusIcon(status: string): string {
		switch (status) {
			case 'completed':
				return '✅';
			case 'in-progress':
				return '🔄';
			default:
				return '📝';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'in-progress':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	function getRelativeDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		if (diffInSeconds < 60) return 'just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		
		const diffInDays = Math.floor(diffInSeconds / 86400);
		if (diffInDays === 1) return 'yesterday';
		if (diffInDays < 7) return `${diffInDays}d ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
		return `${Math.floor(diffInDays / 30)}mo ago`;
	}

	function navigateToProject() {
		goto(`/projects/${task.projects.id}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			navigateToProject();
		}
	}
</script>

<div 
	class="border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 {getStatusColor(task.status)}"
	onclick={navigateToProject}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
	aria-label="Open task {task.title} in project {task.projects.title}"
>
	<div class="flex items-start justify-between">
		<div class="min-w-0 flex-1">
			<!-- Task Header -->
			<div class="flex items-center space-x-2 mb-2">
				<span class="text-lg flex-shrink-0">{getStatusIcon(task.status)}</span>
				<h4 class="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
			</div>
			
			<!-- Task Description -->
			{#if task.description && !compact}
				<p class="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
			{/if}
			
			<!-- Project & Group Info -->
			{#if showProject}
				<div class="flex items-center space-x-2 text-xs text-gray-500">
					<span class="font-medium truncate">{task.projects.title}</span>
					<span class="flex-shrink-0">•</span>
					<span class="truncate">{task.projects.groups.name}</span>
					<span class="flex-shrink-0">•</span>
					<span class="flex-shrink-0">Updated {getRelativeDate(task.updated_at)}</span>
				</div>
			{:else}
				<div class="text-xs text-gray-500">
					Updated {getRelativeDate(task.updated_at)}
				</div>
			{/if}
		</div>

		<!-- Status Badge -->
		<div class="ml-4 flex-shrink-0">
			<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(task.status)}">
				{task.status}
			</span>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
