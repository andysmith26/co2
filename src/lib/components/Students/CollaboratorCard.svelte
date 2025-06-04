<!-- src/lib/components/Students/CollaboratorCard.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { StudentCollaborator } from '$lib/types/student';

	interface CollaboratorCardProps {
		collaborator: StudentCollaborator;
		compact?: boolean;
		showSharedTasks?: boolean;
	}

	const { 
		collaborator, 
		compact = false,
		showSharedTasks = true 
	} = $props<CollaboratorCardProps>();

	// Helper functions
	function navigateToCollaborator() {
		goto(`/students/${collaborator.id}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			navigateToCollaborator();
		}
	}

	function getCollaborationStrength(): { level: string; color: string } {
		const count = collaborator.shared_task_count;
		if (count >= 5) return { level: 'Strong', color: 'text-green-600' };
		if (count >= 3) return { level: 'Regular', color: 'text-blue-600' };
		return { level: 'Occasional', color: 'text-gray-600' };
	}

	const strength = getCollaborationStrength();
</script>

<div 
	class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 group"
	onclick={navigateToCollaborator}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
	aria-label="View profile of {collaborator.first_name} {collaborator.last_initial}"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-3 min-w-0 flex-1">
			<!-- Avatar -->
			<div class="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
				<span class="text-sm font-bold text-white">
					{collaborator.first_name.charAt(0).toUpperCase()}{collaborator.last_initial.toUpperCase()}
				</span>
			</div>
			
			<!-- Collaborator Info -->
			<div class="min-w-0 flex-1">
				<h4 class="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
					{collaborator.first_name} {collaborator.last_initial}
				</h4>
				
				<div class="flex items-center space-x-2 text-xs text-gray-500">
					<span class="{strength.color} font-medium">
						{strength.level} collaborator
					</span>
					<span>•</span>
					<span>
						{collaborator.shared_task_count} shared task{collaborator.shared_task_count !== 1 ? 's' : ''}
					</span>
				</div>
				
				<!-- Shared Tasks Preview -->
				{#if showSharedTasks && !compact && collaborator.shared_tasks.length > 0}
					<div class="mt-2">
						<div class="text-xs text-gray-400 mb-1">Recent collaborations:</div>
						<div class="space-y-1">
							{#each collaborator.shared_tasks.slice(0, 2) as task}
								<div class="text-xs text-gray-600 truncate">
									• {task.title}
								</div>
							{/each}
							{#if collaborator.shared_tasks.length > 2}
								<div class="text-xs text-gray-400">
									+{collaborator.shared_tasks.length - 2} more
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Collaboration Strength Indicator & Arrow -->
		<div class="flex items-center space-x-2 flex-shrink-0">
			<!-- Strength dots -->
			<div class="flex space-x-1">
				{#each Array(3) as _, i}
					<div 
						class="w-1.5 h-1.5 rounded-full {i < Math.ceil(collaborator.shared_task_count / 2) ? 'bg-indigo-400' : 'bg-gray-200'}"
					></div>
				{/each}
			</div>
			
			<!-- Arrow -->
			<div class="text-gray-400 group-hover:text-indigo-600 transition-colors">
				<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</div>
		</div>
	</div>
</div>
