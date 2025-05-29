<!-- src/routes/(protected)/projects/[projectId]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { projectStore } from '$lib/stores/projects.svelte.ts';
	import { taskStore } from '$lib/stores/tasks.svelte.ts';
	import { groupStore } from '$lib/stores/groups.svelte.ts';
	import ProjectForm from '$lib/components/Projects/ProjectForm.svelte';
	import TaskList from '$lib/components/Tasks/TaskList.svelte';
	import TaskForm from '$lib/components/Tasks/TaskForm.svelte';

	// Get the project ID from the URL
	const projectId = $derived($page.params.projectId);

	// State
	let isEditing = $state(false);
	let showDeleteConfirm = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state('tasks'); // 'tasks' or 'details'
	let isInitialized = $state(false);

	// References to store values
	const project = $derived(projectStore.getProjectById(projectId));
	const tasks = $derived(taskStore.getTasks());
	const groupMembers = $derived(groupStore.getGroupMembers());
	const loading = $derived(projectStore.loading);
	const tasksLoading = $derived(taskStore.loading);
	const groupLoading = $derived(groupStore.membersLoading);

	// FIXED: Simple one-time data loading on mount
	onMount(async () => {
		if (!projectId) {
			error = 'Invalid project ID';
			return;
		}

		console.log('🔄 Project detail page mounting for:', projectId);
		await loadProjectData();
	});

	async function loadProjectData() {
		try {
			console.log('🔄 Loading project data for:', projectId);

			// First, ensure we have projects loaded
			if (!project) {
				console.log('🔄 Project not found in store, fetching all projects...');
				await projectStore.fetchProjects();
			}

			// Check again after fetching
			const currentProject = projectStore.getProjectById(projectId);
			if (!currentProject) {
				throw new Error('Project not found');
			}

			// Load related data in parallel
			await Promise.all([
				taskStore.fetchTasksForProject(projectId),
				groupStore.fetchGroupMembers(currentProject.group_id),
			]);

			isInitialized = true;
			console.log('✅ Project data loaded successfully');
		} catch (err) {
			console.error('Error loading project data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load project data';
			}
		}
	}

	// FIXED: Remove reactive effect that was causing constant reloads
	// The original $effect(() => { if (projectId) loadProjectData(); }) was problematic

	// Event handlers for project
	async function handleUpdateProject(event: CustomEvent) {
		try {
			const { title, description } = event.detail;
			await projectStore.updateProject(projectId, title, description);
			isEditing = false;
		} catch (err) {
			console.error('Error updating project:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update project';
			}
		}
	}

	function handleCancelEdit() {
		isEditing = false;
	}

	async function handleDeleteProject() {
		try {
			await projectStore.deleteProject(projectId);
			goto('/projects');
		} catch (err) {
			console.error('Error deleting project:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete project';
			}
			showDeleteConfirm = false;
		}
	}

	// Event handlers for tasks
	async function handleCreateTask(event: CustomEvent) {
		try {
			const { title, description, assigneeId, assigneeType, status } = event.detail;

			console.log('🔄 Creating task:', {
				title,
				description,
				assigneeId,
				assigneeType,
				status,
			});

			await taskStore.createTask(projectId, title, assigneeId, assigneeType, description);
		} catch (err) {
			console.error('Error creating task:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to create task';
			}
		}
	}

	async function handleUpdateTask(event: CustomEvent) {
		try {
			const { taskId, title, status } = event.detail;
			console.log('🔄 Updating task:', { taskId, title, status });
			await taskStore.updateTask(projectId, taskId, { title, status });
		} catch (err) {
			console.error('Error updating task:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update task';
			}
		}
	}

	async function handleTaskStatusChange(event: CustomEvent) {
		try {
			const { taskId, status } = event.detail;
			console.log('🔄 Changing task status:', { taskId, status });
			await taskStore.updateTaskStatus(projectId, taskId, status);
		} catch (err) {
			console.error('Error updating task status:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update task status';
			}
		}
	}

	async function handleTaskAssignment(event: CustomEvent) {
		try {
			const { taskId, assigneeId, assigneeType } = event.detail;
			console.log('🔄 Assigning task:', { taskId, assigneeId, assigneeType });
			await taskStore.assignTask(projectId, taskId, assigneeId, assigneeType);
		} catch (err) {
			console.error('Error assigning task:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to assign task';
			}
		}
	}

	async function handleDeleteTask(event: CustomEvent) {
		try {
			const { taskId } = event.detail;
			console.log('🔄 Deleting task:', { taskId });
			await taskStore.deleteTask(projectId, taskId);
		} catch (err) {
			console.error('Error deleting task:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete task';
			}
		}
	}

	// FIXED: Manual refresh function
	async function refreshProjectData() {
		console.log('🔄 Manual refresh requested');
		await loadProjectData();
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/projects" class="text-indigo-600 hover:text-indigo-800"> &larr; Back to Projects </a>

		<!-- FIXED: Add manual refresh button -->
		<button
			on:click={refreshProjectData}
			class="btn btn-sm btn-circle btn-ghost"
			title="Refresh project data"
			disabled={loading || tasksLoading}
		>
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
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
		</button>
	</div>

	{#if error}
		<div class="mb-6 rounded-md bg-red-100 p-4 text-red-700">
			{error}
			<button on:click={() => (error = null)} class="float-right">&times;</button>
		</div>
	{/if}

	{#if loading && !project}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-indigo-600"></span>
		</div>
	{:else if !project}
		<div class="rounded-lg bg-gray-50 py-12 text-center">
			<h3 class="mb-2 text-lg font-medium text-gray-700">Project Not Found</h3>
			<p class="mb-6 text-gray-500">
				The project you're looking for may have been deleted or does not exist.
			</p>
			<a
				href="/projects"
				class="inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
			>
				Return to Projects
			</a>
		</div>
	{:else}
		<!-- Project Header -->
		{#if isEditing}
			<div class="mb-6">
				<ProjectForm {project} on:submit={handleUpdateProject} on:cancel={handleCancelEdit} />
			</div>
		{:else}
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h1 class="text-2xl font-bold">{project.title}</h1>
					{#if project.description}
						<p class="mt-2 text-gray-600">{project.description}</p>
					{/if}
					<p class="mt-2 text-sm text-gray-500">
						Created on {new Date(project.created_at).toLocaleDateString()}
					</p>
				</div>

				<div class="flex gap-2">
					<button
						on:click={() => (isEditing = true)}
						class="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
					>
						Edit Project
					</button>

					{#if !showDeleteConfirm}
						<button
							on:click={() => (showDeleteConfirm = true)}
							class="rounded-md border border-red-600 bg-white px-4 py-2 text-red-600 hover:bg-red-50"
						>
							Delete
						</button>
					{:else}
						<div class="flex items-center gap-3 rounded-md border border-red-100 bg-red-50 p-3">
							<span class="text-sm text-red-800">Confirm deletion?</span>
							<button
								on:click={handleDeleteProject}
								class="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
							>
								Yes, Delete
							</button>
							<button
								on:click={() => (showDeleteConfirm = false)}
								class="rounded-md border bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Tabs -->
			<div class="mb-6 border-b border-gray-200">
				<nav class="-mb-px flex">
					<button
						class={`border-b-2 px-4 py-2 text-sm font-medium ${
							activeTab === 'tasks'
								? 'border-indigo-500 text-indigo-600'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
						}`}
						on:click={() => (activeTab = 'tasks')}
					>
						Tasks
					</button>
					<button
						class={`border-b-2 px-4 py-2 text-sm font-medium ${
							activeTab === 'details'
								? 'border-indigo-500 text-indigo-600'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
						}`}
						on:click={() => (activeTab = 'details')}
					>
						Project Details
					</button>
				</nav>
			</div>

			<!-- Tab Content -->
			{#if activeTab === 'tasks'}
				<div class="overflow-hidden rounded-lg bg-white shadow">
					<div class="p-6">
						<h2 class="mb-4 text-lg font-medium">Project Tasks</h2>

						<!-- Task Form -->
						<div class="mb-6">
							<TaskForm {projectId} {groupMembers} on:submit={handleCreateTask} />
						</div>

						<!-- Task List -->
						<div class="mt-6">
							<TaskList
								{tasks}
								loading={tasksLoading}
								{groupMembers}
								on:updateStatus={handleTaskStatusChange}
								on:update={handleUpdateTask}
								on:assign={handleTaskAssignment}
								on:delete={handleDeleteTask}
							/>
						</div>
					</div>
				</div>
			{:else if activeTab === 'details'}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-4 text-lg font-medium">Project Details</h2>

					<div class="space-y-4">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Project Status</h3>
							<p class="mt-1">{project.status}</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Created By</h3>
							<p class="mt-1">Teacher ID: {project.created_by}</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Group</h3>
							<p class="mt-1">
								{#if groupLoading}
									Loading group information...
								{:else}
									Group ID: {project.group_id}
								{/if}
							</p>
						</div>

						<div>
							<h3 class="text-sm font-medium text-gray-500">Last Updated</h3>
							<p class="mt-1">{new Date(project.updated_at).toLocaleString()}</p>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
