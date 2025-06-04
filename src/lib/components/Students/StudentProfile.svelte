<!-- src/lib/components/Students/StudentProfile.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	const { student, groups = [], projects = [], tasks = [] } = $props<{
		student: any;
		groups?: any[];
		projects?: any[];
		tasks?: any[];
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let isEditing = $state(false);

	// Computed values
	const activeTasks = $derived(tasks.filter(t => t.status !== 'completed'));
	const completedTasks = $derived(tasks.filter(t => t.status === 'completed'));
	const groupNames = $derived(groups.map(g => g.groups.name).join(', '));

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

	function getStatusColor(status: string): string {
		return status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	}

	function getTaskStatusColor(status: string): string {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'in-progress':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
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
							Student ID: {student.id.split('-')[0]}...
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
		<!-- Quick Stats -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="text-2xl font-bold text-gray-900">{groups.length}</div>
				<div class="text-sm text-gray-500">Groups</div>
			</div>
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="text-2xl font-bold text-gray-900">{projects.length}</div>
				<div class="text-sm text-gray-500">Projects</div>
			</div>
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="text-2xl font-bold text-indigo-600">{activeTasks.length}</div>
				<div class="text-sm text-gray-500">Active Tasks</div>
			</div>
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="text-2xl font-bold text-green-600">{completedTasks.length}</div>
				<div class="text-sm text-gray-500">Completed</div>
			</div>
		</div>

		<!-- Details -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Left Column -->
			<div class="space-y-6">
				<!-- Basic Information -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
					<dl class="space-y-3">
						<div>
							<dt class="text-sm font-medium text-gray-500">Full Name</dt>
							<dd class="text-sm text-gray-900">{student.first_name} {student.last_initial}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Current Status</dt>
							<dd class="text-sm text-gray-900">
								<span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
									{student.status}
								</span>
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Groups</dt>
							<dd class="text-sm text-gray-900">
								{groupNames || 'No groups assigned'}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Added Date</dt>
							<dd class="text-sm text-gray-900">{formatDate(student.created_at)}</dd>
						</div>
					</dl>
				</div>

				<!-- Active Tasks -->
				{#if activeTasks.length > 0}
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-4">Active Tasks</h3>
						<div class="space-y-3">
							{#each activeTasks as task}
								<div class="border border-gray-200 rounded-lg p-4">
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<h4 class="text-sm font-medium text-gray-900">{task.title}</h4>
											{#if task.description}
												<p class="text-sm text-gray-500 mt-1">{task.description}</p>
											{/if}
											<p class="text-xs text-gray-400 mt-2">
												Project: {task.projects.title}
											</p>
										</div>
										<span class={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
											{task.status}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Column -->
			<div class="space-y-6">
				<!-- Projects -->
				{#if projects.length > 0}
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-4">Projects ({projects.length})</h3>
						<div class="space-y-3">
							{#each projects as project}
								<div class="border border-gray-200 rounded-lg p-4">
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<h4 class="text-sm font-medium text-gray-900">{project.title}</h4>
											{#if project.description}
												<p class="text-sm text-gray-500 mt-1">{project.description}</p>
											{/if}
											<p class="text-xs text-gray-400 mt-2">
												Group: {project.groups.name}
											</p>
										</div>
										<span class={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
											project.status === 'active' 
												? 'bg-green-100 text-green-800'
												: project.status === 'completed'
													? 'bg-blue-100 text-blue-800'
													: 'bg-gray-100 text-gray-800'
										}`}>
											{project.status}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Completed Tasks -->
				{#if completedTasks.length > 0}
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-4">Recent Completed Tasks</h3>
						<div class="space-y-3">
							{#each completedTasks.slice(0, 5) as task}
								<div class="border border-gray-200 rounded-lg p-4 opacity-75">
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<h4 class="text-sm font-medium text-gray-900 line-through">{task.title}</h4>
											<p class="text-xs text-gray-400 mt-2">
												Completed: {formatDate(task.updated_at)}
											</p>
										</div>
										<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
											completed
										</span>
									</div>
								</div>
							{/each}
							{#if completedTasks.length > 5}
								<p class="text-sm text-gray-500 text-center">
									And {completedTasks.length - 5} more completed tasks...
								</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Empty States -->
				{#if projects.length === 0 && tasks.length === 0}
					<div class="text-center py-8">
						<div class="text-gray-400 mb-2">📚</div>
						<p class="text-sm text-gray-500">
							This student hasn't been assigned to any projects or tasks yet.
						</p>
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
