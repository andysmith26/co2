<!-- src/lib/components/Students/StudentProfile.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	const { 
		student, 
		groups = [], 
		groupStats = [],
		tasks = [], 
		collaborators = [],
		stats = {}
	} = $props<{
		student: any;
		groups?: any[];
		groupStats?: any[];
		tasks?: any[];
		collaborators?: any[];
		stats?: any;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let isEditing = $state(false);

	// Event handlers
	function handleEdit() {
		isEditing = true;
	}

	function handleCancelEdit() {
		isEditing = false;
	}

	function handleSaveEdit(event: CustomEvent) {
		dispatch('update', event.detail);
		isEditing = false;
	}

	function handleDelete() {
		if (confirm(`Are you sure you want to delete ${student.first_name} ${student.last_initial}? This action cannot be undone.`)) {
			dispatch('delete', { studentId: student.id });
		}
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
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getRelativeDate(dateString: string): string {
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
	}

	function getStatusColor(status: string): string {
		return status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	}

	function getTaskStatusColor(status: string): string {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'in-progress':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	function getTaskStatusIcon(status: string): string {
		switch (status) {
			case 'completed':
				return '✅';
			case 'in-progress':
				return '🔄';
			default:
				return '📝';
		}
	}

	function navigateToTask(task: any) {
		// Navigate to project page - the project detail page should handle highlighting the specific task
		window.location.href = `/projects/${task.projects.id}`;
	}

	function navigateToGroup(groupId: string) {
		window.location.href = `/groups/${groupId}`;
	}

	function navigateToCollaborator(collaboratorId: string) {
		window.location.href = `/students/${collaboratorId}`;
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
</script>

<div class="student-profile bg-white shadow-sm rounded-lg overflow-hidden">
	<!-- Header -->
	<div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<!-- Avatar placeholder -->
				<div class="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
					<span class="text-2xl font-bold text-white">
						{student.first_name.charAt(0).toUpperCase()}{student.last_initial.toUpperCase()}
					</span>
				</div>
				
				<div>
					<h1 class="text-3xl font-bold text-white">
						{student.first_name} {student.last_initial}
					</h1>
					<div class="flex items-center mt-2 space-x-3">
						<span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
							{student.status}
						</span>
						<span class="text-indigo-100 text-sm">
							Added {getRelativeDate(student.created_at)}
						</span>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex items-center space-x-2">
				<button
					on:click={handleStatusToggle}
					class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors"
					title="Toggle attendance status"
				>
					Mark {student.status === 'present' ? 'Absent' : 'Present'}
				</button>
				
				{#if !isEditing}
					<button
						on:click={handleEdit}
						class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors"
					>
						Edit
					</button>
				{/if}
				
				<button
					on:click={handleDelete}
					class="px-4 py-2 bg-red-500 bg-opacity-80 text-white rounded-md hover:bg-opacity-100 transition-colors"
				>
					Delete
				</button>
			</div>
		</div>
	</div>

	<!-- Edit Form (if editing) -->
	{#if isEditing}
		<div class="p-6 bg-gray-50 border-b">
			<form 
				on:submit|preventDefault={(e) => {
					const formData = new FormData(e.target);
					handleSaveEdit({
						detail: {
							first_name: formData.get('first_name'),
							last_initial: formData.get('last_initial')
						}
					});
				}}
				class="space-y-4"
			>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="first_name" class="block text-sm font-medium text-gray-700">
							First Name
						</label>
						<input
							type="text"
							name="first_name"
							id="first_name"
							value={student.first_name}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							required
						/>
					</div>
					
					<div>
						<label for="last_initial" class="block text-sm font-medium text-gray-700">
							Last Initial
						</label>
						<input
							type="text"
							name="last_initial"
							id="last_initial"
							value={student.last_initial}
							maxlength="1"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							required
						/>
					</div>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						on:click={handleCancelEdit}
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
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 mb-8">
			<div class="bg-blue-50 p-4 rounded-lg text-center">
				<div class="text-2xl font-bold text-blue-600">{stats.total_tasks || 0}</div>
				<div class="text-sm text-gray-600">Total Tasks</div>
			</div>
			
			<div class="bg-green-50 p-4 rounded-lg text-center">
				<div class="text-2xl font-bold text-green-600">{stats.completed_tasks || 0}</div>
				<div class="text-sm text-gray-600">Completed</div>
			</div>
			
			<div class="bg-purple-50 p-4 rounded-lg text-center">
				<div class="text-2xl font-bold text-purple-600">{stats.completion_rate || 0}%</div>
				<div class="text-sm text-gray-600">Success Rate</div>
			</div>
			
			<div class="bg-orange-50 p-4 rounded-lg text-center">
				<div class="text-2xl font-bold text-orange-600">{stats.in_progress_tasks || 0}</div>
				<div class="text-sm text-gray-600">In Progress</div>
			</div>
			
			<div class="bg-indigo-50 p-4 rounded-lg text-center">
				<div class="text-2xl font-bold text-indigo-600">{stats.completion_streak || 0}</div>
				<div class="text-sm text-gray-600">Streak</div>
			</div>
			
			<div class="bg-pink-50 p-4 rounded-lg text-center">
				<div class="text-2xl font-bold text-pink-600">{stats.collaborator_count || 0}</div>
				<div class="text-sm text-gray-600">Collaborators</div>
			</div>
		</div>

		<!-- Additional Stats Row -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
			{#if stats.last_completed_task}
				<div class="bg-gray-50 p-4 rounded-lg">
					<div class="text-sm font-medium text-gray-700">Last Completed</div>
					<div class="text-lg font-semibold text-gray-900 truncate">{stats.last_completed_task.title}</div>
					<div class="text-sm text-gray-500">
						{getRelativeDate(stats.last_completed_task.updated_at)}
					</div>
				</div>
			{/if}
			
			{#if stats.most_active_group}
				<div class="bg-gray-50 p-4 rounded-lg">
					<div class="text-sm font-medium text-gray-700">Most Active Group</div>
					<div class="text-lg font-semibold text-gray-900">{stats.most_active_group.name}</div>
					<div class="text-sm text-gray-500">
						{stats.most_active_group.task_count} tasks
					</div>
				</div>
			{/if}
			
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="text-sm font-medium text-gray-700">Workload Distribution</div>
				<div class="text-lg font-semibold text-gray-900">{groups.length} groups</div>
				<div class="text-sm text-gray-500">
					{stats.tasks_by_project?.length || 0} projects
				</div>
			</div>
		</div>

		<!-- Two Column Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Left Column -->
			<div class="space-y-6">
				<!-- Group Cards -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Groups ({groups.length})</h3>
					{#if groups.length === 0}
						<div class="text-center py-8 bg-gray-50 rounded-lg">
							<div class="text-gray-400 mb-2">👥</div>
							<p class="text-sm text-gray-500">Not assigned to any groups yet.</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each groups as groupMembership}
								{@const groupStats = getGroupStats(groupMembership.groups.id)}
								<div 
									class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-gray-50"
									on:click={() => navigateToGroup(groupMembership.groups.id)}
									role="button"
									tabindex="0"
									on:keydown={(e) => e.key === 'Enter' && navigateToGroup(groupMembership.groups.id)}
								>
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<h4 class="text-lg font-medium text-gray-900">{groupMembership.groups.name}</h4>
											{#if groupMembership.groups.description}
												<p class="text-sm text-gray-600 mt-1">{groupMembership.groups.description}</p>
											{/if}
											<div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
												<span>{groupStats.student_count} students</span>
												<span>{groupStats.teacher_count} teachers</span>
												{#if groupStats.recent_activity_count > 0}
													<span class="text-green-600">{groupStats.recent_activity_count} recent tasks</span>
												{/if}
											</div>
										</div>
										<div class="ml-4 flex-shrink-0">
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
												Member since {getRelativeDate(groupMembership.created_at)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Collaborators Section -->
				{#if collaborators.length > 0}
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-4">
							Collaborators ({collaborators.length})
						</h3>
						<div class="space-y-3">
							{#each collaborators as collaborator}
								<div 
									class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-gray-50"
									on:click={() => navigateToCollaborator(collaborator.id)}
									role="button"
									tabindex="0"
									on:keydown={(e) => e.key === 'Enter' && navigateToCollaborator(collaborator.id)}
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-3">
											<div class="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
												<span class="text-sm font-medium text-gray-700">
													{collaborator.first_name.charAt(0).toUpperCase()}{collaborator.last_initial.toUpperCase()}
												</span>
											</div>
											<div>
												<h4 class="text-sm font-medium text-gray-900">
													{collaborator.first_name} {collaborator.last_initial}
												</h4>
												<p class="text-xs text-gray-500">
													{collaborator.shared_task_count} shared task{collaborator.shared_task_count !== 1 ? 's' : ''}
												</p>
											</div>
										</div>
										<div class="text-xs text-gray-400">
											→
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Column -->
			<div class="space-y-6">
				<!-- Task Cards -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">
						Tasks ({tasks.length})
					</h3>
					{#if tasks.length === 0}
						<div class="text-center py-8 bg-gray-50 rounded-lg">
							<div class="text-gray-400 mb-2">📋</div>
							<p class="text-sm text-gray-500">No tasks assigned yet.</p>
						</div>
					{:else}
						<div class="space-y-3 max-h-96 overflow-y-auto">
							{#each tasks as task}
								<div 
									class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-gray-50 {getTaskStatusColor(task.status)}"
									on:click={() => navigateToTask(task)}
									role="button"
									tabindex="0"
									on:keydown={(e) => e.key === 'Enter' && navigateToTask(task)}
								>
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<div class="flex items-center space-x-2 mb-2">
												<span class="text-lg">{getTaskStatusIcon(task.status)}</span>
												<h4 class="text-sm font-medium text-gray-900">{task.title}</h4>
											</div>
											{#if task.description}
												<p class="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
											{/if}
											<div class="flex items-center space-x-2 text-xs text-gray-500">
												<span class="font-medium">{task.projects.title}</span>
												<span>•</span>
												<span>{task.projects.groups.name}</span>
												<span>•</span>
												<span>Updated {getRelativeDate(task.updated_at)}</span>
											</div>
										</div>
										<div class="ml-4 flex-shrink-0">
											<span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
												{task.status}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
