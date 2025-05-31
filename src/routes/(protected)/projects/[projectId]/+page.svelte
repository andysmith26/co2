<!-- src/routes/(protected)/projects/[projectId]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { projectStore } from '$lib/stores/projects.svelte.ts';
	import { taskStore } from '$lib/stores/tasks.svelte.ts';
	import { groupStore } from '$lib/stores/groups.svelte.ts';
	import { resourceStore } from '$lib/stores/resources.svelte.ts';
	import ProjectForm from '$lib/components/Projects/ProjectForm.svelte';
	import TaskList from '$lib/components/Tasks/TaskList.svelte';
	import TaskForm from '$lib/components/Tasks/TaskForm.svelte';
	import ProjectResourceLinker from '$lib/components/Resources/ProjectResourceLinker.svelte';

	// Get the project ID from the URL
	const projectId = $derived($page.params.projectId);

	// State
	let isEditing = $state(false);
	let showDeleteConfirm = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state('tasks'); // 'tasks', 'resources', or 'details'
	let isInitialized = $state(false);
	let resourcesLoaded = $state(false);

	// References to store values
	const project = $derived(projectStore.getProjectById(projectId));
	const tasks = $derived(taskStore.getTasks());
	const groupMembers = $derived(groupStore.getGroupMembers());
	const resources = $derived(resourceStore.getResources());
	const projectResources = $derived(resourceStore.getProjectResources());
	const loading = $derived(projectStore.loading);
	const tasksLoading = $derived(taskStore.loading);
	const groupLoading = $derived(groupStore.membersLoading);
	const resourcesLoading = $derived(resourceStore.loading || resourceStore.projectResourcesLoading);

	// Enhanced logging for debugging
	$effect(() => {
		console.log('🔍 PROJECT PAGE: Current state:', {
			projectId,
			hasProject: !!project,
			tasksCount: tasks.length,
			groupMembersCount: groupMembers.length,
			resourcesCount: resources.length,
			projectResourcesCount: projectResources.length,
			isInitialized,
			resourcesLoaded,
			activeTab,
		});

		if (groupMembers.length > 0) {
			console.log('🔍 PROJECT PAGE: Group members breakdown:', {
				total: groupMembers.length,
				teachers: groupMembers.filter((m) => m.role === 'teacher').length,
				students: groupMembers.filter((m) => m.role === 'student').length,
			});
		}
	});

	// Watch for tab changes and lazy load resources
	$effect(() => {
		if (activeTab === 'resources' && !resourcesLoaded && isInitialized) {
			console.log('🔄 Loading resources for first time');
			loadResourcesData();
		}
	});

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

			console.log('✅ Project found:', currentProject.title);

			// Load related data in parallel (except resources - they'll be lazy loaded)
			await Promise.all([
				taskStore.fetchTasksForProject(projectId),
				groupStore.fetchGroupMembers(currentProject.group_id),
			]);

			isInitialized = true;
			console.log('✅ Project data loaded successfully');
		} catch (err) {
			console.error('❌ Error loading project data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load project data';
			}
		}
	}

	async function loadResourcesData() {
		if (resourcesLoaded) return;

		try {
			console.log('🔄 Loading resources data for project:', projectId);

			// Load available resources and project-specific resources in parallel
			await Promise.all([
				resourceStore.fetchResources(), // All available resources for linking
				resourceStore.fetchProjectResources(projectId), // Already linked resources
			]);

			resourcesLoaded = true;
			console.log('✅ Resources data loaded successfully');
		} catch (err) {
			console.error('❌ Error loading resources data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load resources data';
			}
		}
	}

	// Event handlers for project
	async function handleUpdateProject(event: CustomEvent) {
		try {
			const { title, description } = event.detail;
			console.log('🔄 Updating project:', { title, description });
			await projectStore.updateProject(projectId, title, description);
			isEditing = false;
		} catch (err) {
			console.error('❌ Error updating project:', err);
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
			console.log('🔄 Deleting project:', projectId);
			await projectStore.deleteProject(projectId);
			goto('/projects');
		} catch (err) {
			console.error('❌ Error deleting project:', err);
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
				description: description?.substring(0, 30) + '...',
				assigneeId,
				assigneeType,
				status,
			});

			await taskStore.createTask(projectId, title, assigneeId, assigneeType, description);
		} catch (err) {
			console.error('❌ Error creating task:', err);
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
			console.error('❌ Error updating task:', err);
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
			console.error('❌ Error updating task status:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update task status';
			}
		}
	}

	async function handleDeleteTask(event: CustomEvent) {
		try {
			const { taskId } = event.detail;
			console.log('🔄 Deleting task:', { taskId });
			await taskStore.deleteTask(projectId, taskId);
		} catch (err) {
			console.error('❌ Error deleting task:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete task';
			}
		}
	}

	// Event handlers for resources
	async function handleLinkResource(event: CustomEvent) {
		try {
			const { resourceId } = event.detail;
			console.log('🔄 Linking resource to project:', { projectId, resourceId });
			await resourceStore.linkResourceToProject(projectId, resourceId);
		} catch (err) {
			console.error('❌ Error linking resource:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to link resource';
			}
		}
	}

	async function handleUnlinkResource(event: CustomEvent) {
		try {
			const { resourceId } = event.detail;
			console.log('🔄 Unlinking resource from project:', { projectId, resourceId });
			await resourceStore.unlinkResourceFromProject(projectId, resourceId);
		} catch (err) {
			console.error('❌ Error unlinking resource:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to unlink resource';
			}
		}
	}

	// Manual refresh function
	async function refreshProjectData() {
		console.log('🔄 Manual refresh requested');
		await loadProjectData();

		// If resources tab is active and was loaded, refresh resources too
		if (activeTab === 'resources' && resourcesLoaded) {
			await loadResourcesData();
		}
	}

	// Get available resources (not already linked to this project)
	const availableResources = $derived(resourceStore.getAvailableResourcesForProject(projectId));

	// Computed values for better organization
	const completedTasks = $derived(tasks.filter((t) => t.status === 'completed').length);
	const inProgressTasks = $derived(tasks.filter((t) => t.status === 'in-progress').length);
	const todoTasks = $derived(tasks.filter((t) => t.status === 'todo').length);
	const teacherCount = $derived(groupMembers.filter((m) => m.role === 'teacher').length);
	const studentCount = $derived(groupMembers.filter((m) => m.role === 'student').length);
</script>

<svelte:head>
	<title>{project ? project.title : 'Project'} | CO2</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Navigation & Refresh -->
		<div class="mb-8 flex items-center justify-between">
			<nav class="flex items-center space-x-4">
				<a
					href="/projects"
					class="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
				>
					<svg
						class="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to Projects
				</a>
			</nav>

			<button
				on:click={refreshProjectData}
				class="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
				title="Refresh project data"
				disabled={loading || tasksLoading || (activeTab === 'resources' && resourcesLoading)}
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</button>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
				<div class="flex items-start">
					<svg
						class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
					<div class="ml-3 flex-1">
						<p class="text-sm font-medium text-red-800">{error}</p>
					</div>
					<button
						on:click={() => (error = null)}
						class="ml-auto flex-shrink-0 rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
					>
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/if}

		<!-- Loading State -->
		{#if loading && !project}
			<div class="flex min-h-[400px] items-center justify-center">
				<div class="text-center">
					<div
						class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
					></div>
					<p class="mt-4 text-sm text-gray-600">Loading project...</p>
				</div>
			</div>

			<!-- Project Not Found -->
		{:else if !project}
			<div class="rounded-lg bg-white px-6 py-16 text-center shadow-sm">
				<svg
					class="mx-auto h-16 w-16 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-semibold text-gray-900">Project Not Found</h3>
				<p class="mt-2 max-w-sm text-sm text-gray-600">
					The project you're looking for may have been deleted or does not exist.
				</p>
				<a
					href="/projects"
					class="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
				>
					Return to Projects
				</a>
			</div>

			<!-- Main Content -->
		{:else}
			<!-- Project Header -->
			<div class="mb-8">
				{#if isEditing}
					<div class="rounded-lg bg-white p-6 shadow-sm">
						<ProjectForm {project} on:submit={handleUpdateProject} on:cancel={handleCancelEdit} />
					</div>
				{:else}
					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="flex items-start justify-between">
							<div class="min-w-0 flex-1">
								<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">{project.title}</h1>
								{#if project.description}
									<p class="mt-2 text-base text-gray-600">{project.description}</p>
								{/if}
								<div class="mt-4 flex items-center space-x-6 text-sm text-gray-500">
									<div class="flex items-center">
										<svg class="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
												clip-rule="evenodd"
											/>
										</svg>
										Created {new Date(project.created_at).toLocaleDateString()}
									</div>
									<div class="flex items-center">
										<svg class="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
												clip-rule="evenodd"
											/>
										</svg>
										{teacherCount} teacher{teacherCount !== 1 ? 's' : ''}, {studentCount} student{studentCount !==
										1
											? 's'
											: ''}
									</div>
									<div class="flex items-center">
										<div
											class="mr-1.5 h-2 w-2 rounded-full {project.status === 'active'
												? 'bg-green-500'
												: project.status === 'completed'
													? 'bg-blue-500'
													: 'bg-gray-500'}"
										></div>
										<span class="capitalize">{project.status}</span>
									</div>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="ml-6 flex flex-shrink-0 items-center space-x-3">
								<button
									on:click={() => (isEditing = true)}
									class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
								>
									<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									Edit
								</button>

								{#if !showDeleteConfirm}
									<button
										on:click={() => (showDeleteConfirm = true)}
										class="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
									>
										<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
										Delete
									</button>
								{:else}
									<div
										class="flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2"
									>
										<span class="text-sm font-medium text-red-800">Confirm deletion?</span>
										<button
											on:click={handleDeleteProject}
											class="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
										>
											Yes, Delete
										</button>
										<button
											on:click={() => (showDeleteConfirm = false)}
											class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
										>
											Cancel
										</button>
									</div>
								{/if}
							</div>
						</div>

						<!-- Quick Stats -->
						<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
							<div class="rounded-lg bg-gray-50 px-4 py-3">
								<div class="flex items-center">
									<div class="flex-shrink-0">
										<div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100">
											<svg class="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
													clip-rule="evenodd"
												/>
											</svg>
										</div>
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-gray-900">{tasks.length}</p>
										<p class="text-xs text-gray-500">Total Tasks</p>
									</div>
								</div>
							</div>

							<div class="rounded-lg bg-gray-50 px-4 py-3">
								<div class="flex items-center">
									<div class="flex-shrink-0">
										<div class="flex h-8 w-8 items-center justify-center rounded-md bg-green-100">
											<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
										</div>
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-gray-900">{completedTasks}</p>
										<p class="text-xs text-gray-500">Completed</p>
									</div>
								</div>
							</div>

							<div class="rounded-lg bg-gray-50 px-4 py-3">
								<div class="flex items-center">
									<div class="flex-shrink-0">
										<div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
											<svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
													clip-rule="evenodd"
												/>
											</svg>
										</div>
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-gray-900">{inProgressTasks}</p>
										<p class="text-xs text-gray-500">In Progress</p>
									</div>
								</div>
							</div>

							{#if resourcesLoaded}
								<div class="rounded-lg bg-gray-50 px-4 py-3">
									<div class="flex items-center">
										<div class="flex-shrink-0">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100"
											>
												<svg
													class="h-5 w-5 text-purple-600"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fill-rule="evenodd"
														d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
														clip-rule="evenodd"
													/>
												</svg>
											</div>
										</div>
										<div class="ml-3">
											<p class="text-sm font-medium text-gray-900">{projectResources.length}</p>
											<p class="text-xs text-gray-500">Resources</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<!-- Tabs Navigation -->
			<div class="mb-8">
				<div class="rounded-t-lg border-b border-gray-200 bg-white">
					<nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
						<button
							class="border-b-2 border-transparent px-1 py-4 text-sm font-medium transition-colors {activeTab ===
							'tasks'
								? 'border-indigo-500 text-indigo-600'
								: 'text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
							on:click={() => (activeTab = 'tasks')}
						>
							<div class="flex items-center">
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
										clip-rule="evenodd"
									/>
								</svg>
								Tasks
								<span
									class="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900"
								>
									{tasks.length}
								</span>
							</div>
						</button>

						<button
							class="border-b-2 border-transparent px-1 py-4 text-sm font-medium transition-colors {activeTab ===
							'resources'
								? 'border-indigo-500 text-indigo-600'
								: 'text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
							on:click={() => (activeTab = 'resources')}
						>
							<div class="flex items-center">
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
										clip-rule="evenodd"
									/>
								</svg>
								Resources
								{#if resourcesLoaded}
									<span
										class="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900"
									>
										{projectResources.length}
									</span>
								{/if}
							</div>
						</button>

						<button
							class="border-b-2 border-transparent px-1 py-4 text-sm font-medium transition-colors {activeTab ===
							'details'
								? 'border-indigo-500 text-indigo-600'
								: 'text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
							on:click={() => (activeTab = 'details')}
						>
							<div class="flex items-center">
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
										clip-rule="evenodd"
									/>
								</svg>
								Details
							</div>
						</button>
					</nav>
				</div>
			</div>

			<!-- Tab Content -->
			<div class="rounded-lg bg-white shadow-sm">
				{#if activeTab === 'tasks'}
					<div class="p-6">
						<div class="mb-8">
							<h2 class="mb-4 text-lg font-semibold text-gray-900">Add New Task</h2>
							<div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
								<TaskForm {projectId} {groupMembers} on:submit={handleCreateTask} />
							</div>
						</div>

						<div>
							<div class="mb-4 flex items-center justify-between">
								<h2 class="text-lg font-semibold text-gray-900">Project Tasks</h2>
								{#if tasksLoading}
									<div class="flex items-center text-sm text-gray-500">
										<div
											class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"
										></div>
										Loading tasks...
									</div>
								{/if}
							</div>

							<div class="rounded-lg border border-gray-200">
								<TaskList
									{tasks}
									loading={tasksLoading}
									{groupMembers}
									on:updateStatus={handleTaskStatusChange}
									on:update={handleUpdateTask}
									on:delete={handleDeleteTask}
								/>
							</div>
						</div>
					</div>
				{:else if activeTab === 'resources'}
					<div class="p-6">
						{#if !resourcesLoaded}
							<div class="flex min-h-[300px] items-center justify-center">
								<div class="text-center">
									<div
										class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"
									></div>
									<p class="mt-2 text-sm text-gray-600">Loading resources...</p>
								</div>
							</div>
						{:else}
							<ProjectResourceLinker
								{projectId}
								{availableResources}
								linkedResources={projectResources}
								loading={resourcesLoading}
								on:link={handleLinkResource}
								on:unlink={handleUnlinkResource}
							/>
						{/if}
					</div>
				{:else if activeTab === 'details'}
					<div class="p-6">
						<h2 class="mb-6 text-lg font-semibold text-gray-900">Project Information</h2>

						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<!-- Project Details -->
							<div class="space-y-6">
								<div>
									<h3 class="text-sm font-medium tracking-wide text-gray-500 uppercase">
										Project Status
									</h3>
									<div class="mt-2 flex items-center">
										<div
											class="mr-2 h-2 w-2 rounded-full {project.status === 'active'
												? 'bg-green-500'
												: project.status === 'completed'
													? 'bg-blue-500'
													: 'bg-gray-500'}"
										></div>
										<span class="text-sm font-medium text-gray-900 capitalize"
											>{project.status}</span
										>
									</div>
								</div>

								<div>
									<h3 class="text-sm font-medium tracking-wide text-gray-500 uppercase">
										Created By
									</h3>
									<p class="mt-2 text-sm text-gray-900">Teacher ID: {project.created_by}</p>
								</div>

								<div>
									<h3 class="text-sm font-medium tracking-wide text-gray-500 uppercase">
										Group Information
									</h3>
									{#if groupLoading}
										<div class="mt-2 flex items-center text-sm text-gray-500">
											<div
												class="mr-2 h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-indigo-600"
											></div>
											Loading group information...
										</div>
									{:else}
										<div class="mt-2 text-sm text-gray-900">
											<p>Group ID: {project.group_id}</p>
											{#if groupMembers.length > 0}
												<p class="mt-1 text-xs text-gray-500">
													{teacherCount} teacher{teacherCount !== 1 ? 's' : ''},
													{studentCount} student{studentCount !== 1 ? 's' : ''}
												</p>
											{/if}
										</div>
									{/if}
								</div>

								<div>
									<h3 class="text-sm font-medium tracking-wide text-gray-500 uppercase">
										Last Updated
									</h3>
									<p class="mt-2 text-sm text-gray-900">
										{new Date(project.updated_at).toLocaleString()}
									</p>
								</div>
							</div>

							<!-- Stats & Summary -->
							<div class="space-y-6">
								<div>
									<h3 class="text-sm font-medium tracking-wide text-gray-500 uppercase">
										Task Summary
									</h3>
									<div class="mt-2 space-y-2">
										<div class="flex items-center justify-between">
											<span class="text-sm text-gray-600">Total Tasks</span>
											<span class="text-sm font-medium text-gray-900">{tasks.length}</span>
										</div>
										{#if tasks.length > 0}
											<div class="flex items-center justify-between">
												<span class="text-sm text-gray-600">Completed</span>
												<span class="text-sm font-medium text-green-600">{completedTasks}</span>
											</div>
											<div class="flex items-center justify-between">
												<span class="text-sm text-gray-600">In Progress</span>
												<span class="text-sm font-medium text-blue-600">{inProgressTasks}</span>
											</div>
											<div class="flex items-center justify-between">
												<span class="text-sm text-gray-600">To Do</span>
												<span class="text-sm font-medium text-gray-600">{todoTasks}</span>
											</div>
											<!-- Progress Bar -->
											<div class="mt-3">
												<div class="mb-1 flex items-center justify-between text-xs text-gray-500">
													<span>Progress</span>
													<span>{Math.round((completedTasks / tasks.length) * 100)}%</span>
												</div>
												<div class="h-2 w-full rounded-full bg-gray-200">
													<div
														class="h-2 rounded-full bg-green-500 transition-all duration-300"
														style="width: {(completedTasks / tasks.length) * 100}%"
													></div>
												</div>
											</div>
										{/if}
									</div>
								</div>

								{#if resourcesLoaded}
									<div>
										<h3 class="text-sm font-medium tracking-wide text-gray-500 uppercase">
											Resources Summary
										</h3>
										<div class="mt-2 space-y-2">
											<div class="flex items-center justify-between">
												<span class="text-sm text-gray-600">Linked Resources</span>
												<span class="text-sm font-medium text-gray-900"
													>{projectResources.length}</span
												>
											</div>
											{#if availableResources.length > 0}
												<div class="flex items-center justify-between">
													<span class="text-sm text-gray-600">Available to Link</span>
													<span class="text-sm font-medium text-gray-600"
														>{availableResources.length}</span
													>
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						</div>

						<!-- Tips Section -->
						<div class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
							<div class="flex">
								<svg class="mt-0.5 h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clip-rule="evenodd"
									/>
								</svg>
								<div class="ml-3">
									<h4 class="text-sm font-medium text-blue-900">Project Management Tips</h4>
									<div class="mt-2 text-sm text-blue-800">
										<ul class="space-y-1">
											<li>• Create tasks with assignments using the Tasks tab</li>
											<li>• Link relevant resources to help students access materials</li>
											<li>• Use quick status buttons (📝🔄✅) to update task progress</li>
											<li>
												• Resources are shared across projects - link existing ones when possible
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
