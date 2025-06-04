<!-- src/lib/components/Students/StudentProfile.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { StudentProfileData } from '$lib/types/student';
	import StudentStatsCard from './StudentStatsCard.svelte';
	import TaskCard from './TaskCard.svelte';
	import GroupCard from './GroupCard.svelte';
	import CollaboratorCard from './CollaboratorCard.svelte';

	// Props with proper typing
	const { 
		student, 
		groups = [], 
		groupStats = [],
		tasks = [], 
		collaborators = [],
		stats = {
			total_tasks: 0,
			completed_tasks: 0,
			in_progress_tasks: 0,
			todo_tasks: 0,
			completion_rate: 0,
			completion_streak: 0,
			collaborator_count: 0
		}
	} = $props<Partial<StudentProfileData>>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let isEditing = $state(false);
	let deleteConfirmation = $state(false);

	// Validation and safety checks
	if (!student) {
		throw new Error('Student data is required');
	}

	// Event handlers
	function handleEdit() {
		isEditing = true;
	}

	function handleCancelEdit() {
		isEditing = false;
		deleteConfirmation = false;
	}

	function handleSaveEdit(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		dispatch('update', {
			first_name: formData.get('first_name'),
			last_initial: formData.get('last_initial')
		});
		isEditing = false;
	}

	function handleDelete() {
		deleteConfirmation = true;
	}

	function confirmDelete() {
		dispatch('delete', { studentId: student.id });
	}

	function handleStatusToggle() {
		const newStatus = student.status === 'present' ? 'absent' : 'present';
		dispatch('statusUpdate', { 
			studentId: student.id, 
			status: newStatus 
		});
	}

	// Helper functions
	function formatDate(dateString: string): string {
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return 'Unknown';
		}
	}

	function getRelativeDate(dateString: string): string {
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
			
			if (diffInSeconds < 60) return 'just now';
			if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
			if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
			
			const diffInDays = Math.floor(diffInSeconds / 86400);
			if (diffInDays === 1) return 'yesterday';
			if (diffInDays < 7) return `${diffInDays} days ago`;
			if (diffInDays < 14) return '1 week ago';
			if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
			if (diffInDays < 60) return '1 month ago';
			return `${Math.floor(diffInDays / 30)} months ago`;
		} catch {
			return 'some time ago';
		}
	}

	function getStatusColor(status: string): string {
		return status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	}

	// Get group stats for a specific group
	function getGroupStats(groupId: string) {
		return groupStats.find(gs => gs.group_id === groupId) || {
			member_count: 0,
			teacher_count: 0,
			student_count: 0,
			recent_activity_count: 0
		};
	}

	// Computed values for better organization
	const hasRecentActivity = $derived(
		stats.last_completed_task && 
		new Date(stats.last_completed_task.updated_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
	);

	const workloadDistribution = $derived(
		stats.tasks_by_project?.map(project => ({
			...project,
			completion_rate: project.tasks.length > 0 
				? Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)
				: 0
		})) || []
	);
</script>

<div class="student-profile bg-white shadow-sm rounded-lg overflow-hidden">
	<!-- Enhanced Header -->
	<div class="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-6 py-8">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<!-- Enhanced Avatar -->
				<div class="relative">
					<div class="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center ring-4 ring-white ring-opacity-30">
						<span class="text-2xl font-bold text-white">
							{student.first_name.charAt(0).toUpperCase()}{student.last_initial.toUpperCase()}
						</span>
					</div>
					<!-- Status indicator -->
					<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full {student.status === 'present' ? 'bg-green-400' : 'bg-red-400'} border-2 border-white flex items-center justify-center">
						<span class="text-xs text-white font-bold">
							{student.status === 'present' ? '✓' : '✗'}
						</span>
					</div>
				</div>
				
				<div>
					<h1 class="text-3xl font-bold text-white">
						{student.first_name} {student.last_initial}
					</h1>
					<div class="flex items-center mt-2 space-x-3">
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
							{student.status}
						</span>
						<span class="text-indigo-100 text-sm">
							Added {getRelativeDate(student.created_at)}
						</span>
						{#if hasRecentActivity}
							<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-400 bg-opacity-80 text-white">
								Recently Active
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex items-center space-x-2">
				<button
					onclick={handleStatusToggle}
					class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors flex items-center space-x-2"
					title="Toggle attendance status"
				>
					<span>{student.status === 'present' ? '✗' : '✓'}</span>
					<span>Mark {student.status === 'present' ? 'Absent' : 'Present'}</span>
				</button>
				
				{#if !isEditing}
					<button
						onclick={handleEdit}
						class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors flex items-center space-x-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
						</svg>
						<span>Edit</span>
					</button>
				{/if}
				
				{#if !deleteConfirmation}
					<button
						onclick={handleDelete}
						class="px-4 py-2 bg-red-500 bg-opacity-80 text-white rounded-md hover:bg-opacity-100 transition-colors flex items-center space-x-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
						</svg>
						<span>Delete</span>
					</button>
				{:else}
					<div class="flex items-center space-x-2 bg-red-600 bg-opacity-90 rounded-md px-3 py-2">
						<span class="text-white text-sm font-medium">Confirm?</span>
						<button
							onclick={confirmDelete}
							class="px-2 py-1 bg-white text-red-600 rounded text-xs font-medium hover:bg-gray-100"
						>
							Yes
						</button>
						<button
							onclick={handleCancelEdit}
							class="px-2 py-1 bg-transparent text-white border border-white rounded text-xs hover:bg-white hover:bg-opacity-20"
						>
							No
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Edit Form (if editing) -->
	{#if isEditing}
		<div class="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
			<form 
				onsubmit={handleSaveEdit}
				class="space-y-4"
			>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">
							First Name
						</label>
						<input
							type="text"
							name="first_name"
							id="first_name"
							value={student.first_name}
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							required
						/>
					</div>
					
					<div>
						<label for="last_initial" class="block text-sm font-medium text-gray-700 mb-1">
							Last Initial
						</label>
						<input
							type="text"
							name="last_initial"
							id="last_initial"
							value={student.last_initial}
							maxlength="1"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							required
						/>
					</div>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={handleCancelEdit}
						class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Content -->
	<div class="p-6">
		<!-- Enhanced Stats Grid -->
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
			<StudentStatsCard 
				title="Total Tasks"
				value={stats.total_tasks}
				color="blue"
				icon="📋"
			/>
			
			<StudentStatsCard 
				title="Completed"
				value={stats.completed_tasks}
				subtitle="{stats.completion_rate}% success"
				color="green"
				icon="✅"
			/>
			
			<StudentStatsCard 
				title="In Progress"
				value={stats.in_progress_tasks}
				color="orange"
				icon="🔄"
			/>
			
			<StudentStatsCard 
				title="Todo"
				value={stats.todo_tasks}
				color="gray"
				icon="📝"
			/>
			
			<StudentStatsCard 
				title="Streak"
				value={stats.completion_streak}
				subtitle="completed in a row"
				color="purple"
				icon="🔥"
			/>
			
			<StudentStatsCard 
				title="Collaborators"
				value={stats.collaborator_count}
				subtitle="unique teammates"
				color="pink"
				icon="👥"
			/>
		</div>

		<!-- Additional Stats Row -->
		{#if stats.last_completed_task || stats.most_active_group || workloadDistribution.length > 0}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
				{#if stats.last_completed_task}
					<div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-400">
						<div class="text-sm font-medium text-gray-700 flex items-center">
							<span class="mr-2">🎯</span>
							Last Completed
						</div>
						<div class="text-lg font-semibold text-gray-900 truncate mt-1" title={stats.last_completed_task.title}>
							{stats.last_completed_task.title}
						</div>
						<div class="text-sm text-gray-500 mt-1">
							{getRelativeDate(stats.last_completed_task.updated_at)}
						</div>
					</div>
				{/if}
				
				{#if stats.most_active_group}
					<div class="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
						<div class="text-sm font-medium text-gray-700 flex items-center">
							<span class="mr-2">⭐</span>
							Most Active Group
						</div>
						<div class="text-lg font-semibold text-gray-900 mt-1">{stats.most_active_group.name}</div>
						<div class="text-sm text-gray-500 mt-1">
							{stats.most_active_group.task_count} tasks
						</div>
					</div>
				{/if}
				
				<div class="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
					<div class="text-sm font-medium text-gray-700 flex items-center">
						<span class="mr-2">📊</span>
						Workload Distribution
					</div>
					<div class="text-lg font-semibold text-gray-900 mt-1">{groups.length} groups</div>
					<div class="text-sm text-gray-500 mt-1">
						{workloadDistribution.length} active projects
					</div>
				</div>
			</div>
		{/if}

		<!-- Two Column Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Left Column -->
			<div class="space-y-8">
				<!-- Groups Section -->
				<div>
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold text-gray-900 flex items-center">
							<span class="mr-2">👥</span>
							Groups ({groups.length})
						</h3>
						{#if groups.length > 0}
							<span class="text-sm text-gray-500">
								{groupStats.reduce((sum, gs) => sum + gs.recent_activity_count, 0)} recent activities
							</span>
						{/if}
					</div>
					
					{#if groups.length === 0}
						<div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
							<div class="text-4xl mb-3">👥</div>
							<p class="text-gray-500 font-medium">Not assigned to any groups yet</p>
							<p class="text-sm text-gray-400 mt-1">Groups will appear here when assigned</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each groups as group}
								<GroupCard 
									{group} 
									stats={getGroupStats(group.groups.id)}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Collaborators Section -->
				{#if collaborators.length > 0}
					<div>
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-gray-900 flex items-center">
								<span class="mr-2">🤝</span>
								Collaborators ({collaborators.length})
							</h3>
							<span class="text-sm text-gray-500">
								{collaborators.reduce((sum, c) => sum + c.shared_task_count, 0)} shared tasks
							</span>
						</div>
						<div class="space-y-3">
							{#each collaborators.slice(0, 5) as collaborator}
								<CollaboratorCard {collaborator} />
							{/each}
							{#if collaborators.length > 5}
								<div class="text-center py-2">
									<span class="text-sm text-gray-500">
										+{collaborators.length - 5} more collaborators
									</span>
								</div>
							{/if}
						</div>
					</div>
				{:else if tasks.length > 0}
					<div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
						<div class="text-3xl mb-3">🤝</div>
						<p class="text-gray-500 font-medium">No collaborators yet</p>
						<p class="text-sm text-gray-400 mt-1">Collaborators appear when working on shared tasks</p>
					</div>
				{/if}
			</div>

			<!-- Right Column -->
			<div class="space-y-8">
				<!-- Tasks Section -->
				<div>
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold text-gray-900 flex items-center">
							<span class="mr-2">📋</span>
							Tasks ({tasks.length})
						</h3>
						{#if tasks.length > 0}
							<div class="text-sm text-gray-500">
								{stats.completion_rate}% completion rate
							</div>
						{/if}
					</div>
					
					{#if tasks.length === 0}
						<div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
							<div class="text-4xl mb-3">📋</div>
							<p class="text-gray-500 font-medium">No tasks assigned yet</p>
							<p class="text-sm text-gray-400 mt-1">Tasks will appear here when assigned to projects</p>
						</div>
					{:else}
						<div class="space-y-3 max-h-96 overflow-y-auto">
							{#each tasks as task}
								<TaskCard {task} />
							{/each}
						</div>
					{/if}
				</div>

				<!-- Workload Analysis -->
				{#if workloadDistribution.length > 0}
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<span class="mr-2">📈</span>
							Project Breakdown
						</h3>
						<div class="space-y-3">
							{#each workloadDistribution as project}
								<div class="bg-white border rounded-lg p-4">
									<div class="flex items-center justify-between mb-2">
										<h4 class="font-medium text-gray-900">{project.project_name}</h4>
										<span class="text-sm text-gray-500">{project.completion_rate}%</span>
									</div>
									<div class="text-xs text-gray-500 mb-2">{project.group_name}</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div 
											class="bg-indigo-500 h-2 rounded-full transition-all duration-300"
											style="width: {project.completion_rate}%"
										></div>
									</div>
									<div class="flex justify-between text-xs text-gray-500 mt-1">
										<span>{project.tasks.filter(t => t.status === 'completed').length} completed</span>
										<span>{project.tasks.length} total</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
