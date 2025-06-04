<!-- src/lib/components/Students/GroupCard.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { StudentGroup, GroupStats } from '$lib/types/student';

	interface GroupCardProps {
		group: StudentGroup;
		stats?: GroupStats;
		compact?: boolean;
	}

	const { 
		group, 
		stats = null, 
		compact = false 
	} = $props<GroupCardProps>();

	// Helper functions
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

	function navigateToGroup() {
		goto(`/groups/${group.groups.id}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			navigateToGroup();
		}
	}

	// Determine activity indicator
	const hasRecentActivity = stats && stats.recent_activity_count > 0;
	const activityColor = hasRecentActivity ? 'text-green-600' : 'text-gray-500';
</script>

<div 
	class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 group"
	onclick={navigateToGroup}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
	aria-label="Open group {group.groups.name}"
>
	<div class="flex items-start justify-between">
		<div class="min-w-0 flex-1">
			<!-- Group Header -->
			<div class="flex items-center space-x-2 mb-2">
				<div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
					<span class="text-indigo-600 font-medium text-sm">
						{group.groups.name.charAt(0).toUpperCase()}
					</span>
				</div>
				<h4 class="text-lg font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
					{group.groups.name}
				</h4>
			</div>
			
			<!-- Group Description -->
			{#if group.groups.description && !compact}
				<p class="text-sm text-gray-600 mb-3 line-clamp-2">{group.groups.description}</p>
			{/if}
			
			<!-- Group Stats -->
			{#if stats}
				<div class="flex items-center space-x-4 text-sm text-gray-500 mb-2">
					<div class="flex items-center space-x-1">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
						</svg>
						<span>{stats.student_count} students</span>
					</div>
					
					<div class="flex items-center space-x-1">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<span>{stats.teacher_count} teachers</span>
					</div>
					
					{#if stats.recent_activity_count > 0}
						<div class="flex items-center space-x-1 {activityColor}">
							<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
							</svg>
							<span>{stats.recent_activity_count} recent tasks</span>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Membership Info -->
			<div class="text-xs text-gray-500">
				Member since {getRelativeDate(group.created_at)}
			</div>
		</div>

		<!-- Arrow Indicator -->
		<div class="ml-4 flex-shrink-0 text-gray-400 group-hover:text-indigo-600 transition-colors">
			<svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
			</svg>
		</div>
	</div>

	<!-- Activity Indicator Bar -->
	{#if stats && stats.recent_activity_count > 0}
		<div class="mt-3 w-full bg-gray-200 rounded-full h-1">
			<div 
				class="bg-green-500 h-1 rounded-full transition-all duration-300"
				style="width: {Math.min(100, (stats.recent_activity_count / 10) * 100)}%"
			></div>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
