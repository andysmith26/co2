<!-- src/routes/(protected)/projects/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ProjectList from '$lib/components/Projects/ProjectList.svelte';
	import ProjectForm from '$lib/components/Projects/ProjectForm.svelte';
	import { projectStore } from '$lib/stores/projects.svelte.ts';
	import { groupStore } from '$lib/stores/groups.svelte.ts';
	import { onMount } from 'svelte';

	// State
	let showCreateForm = $state(false);
	let selectedGroupId = $state('');
	let error = $state<string | null>(null);
	let isInitialized = $state(false);

	// Get stores data with $derived
	const projects = $derived(projectStore.projects);
	const loading = $derived(projectStore.loading);
	const tasksLoading = $derived(projectStore.tasksLoading);
	const projectTasks = $derived(projectStore.projectTasks);
	const groups = $derived(groupStore.groups);
	const groupsLoading = $derived(groupStore.loading);

	// FIXED: Simple one-time initialization on mount
	onMount(async () => {
		console.log('🔄 Projects page mounting - loading initial data');
		try {
			// Load groups and projects first
			await Promise.all([groupStore.fetchGroups(), projectStore.fetchProjects()]);

			// Then load tasks for the projects we just fetched
			if (projectStore.projects.length > 0) {
				console.log('🔄 Loading tasks for', projectStore.projects.length, 'projects');
				await projectStore.fetchTasksForAllProjects(true);
			}

			isInitialized = true;
		} catch (err) {
			console.error('Error loading initial data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load data';
			}
		}
	});

	// FIXED: Only react to group selection changes, not automatic refreshes
	$effect(() => {
		// Only run if we've initialized and group selection actually changed
		if (isInitialized && selectedGroupId !== '') {
			console.log('🔄 Group filter changed to:', selectedGroupId);
			// Fetch projects for the group, then tasks
			projectStore.fetchProjectsByGroup(selectedGroupId).then(() => {
				if (projectStore.projects.length > 0) {
					projectStore.fetchTasksForAllProjects(true);
				}
			});
		} else if (isInitialized && selectedGroupId === '') {
			console.log('🔄 Showing all projects');
			// Fetch all projects, then tasks
			projectStore.fetchProjects().then(() => {
				if (projectStore.projects.length > 0) {
					projectStore.fetchTasksForAllProjects(true);
				}
			});
		}
	});

	// Event handlers
	async function handleCreateProject(event: CustomEvent) {
		try {
			const { title, description, group_id } = event.detail;
			await projectStore.createProject(title, group_id, description);
			showCreateForm = false;
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to create project';
			}
			console.error('Error creating project:', err);
		}
	}

	function handleCancelCreate() {
		showCreateForm = false;
	}

	function handleSelectProject(event: CustomEvent) {
		const project = event.detail;
		goto(`/projects/${project.id}`);
	}

	// FIXED: Manual refresh only - no auto-refresh
	async function refreshProjects() {
		console.log('🔄 Manual refresh requested');
		try {
			if (selectedGroupId) {
				await projectStore.fetchProjectsByGroup(selectedGroupId);
			} else {
				await projectStore.fetchProjects();
			}

			// Also refresh tasks after refreshing projects
			if (projectStore.projects.length > 0) {
				console.log('🔄 Refreshing tasks for', projectStore.projects.length, 'projects');
				await projectStore.fetchTasksForAllProjects(true);
			}
		} catch (err) {
			console.error('Error refreshing projects:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to refresh projects';
			}
		}
	}

	// Calculate loading state
	const isLoading = $derived(loading || tasksLoading);

	// Calculate total tasks
	const totalTasks = $derived(() => {
		let count = 0;
		Object.values(projectTasks).forEach((tasks) => {
			count += tasks.length;
		});
		return count;
	});
</script>

<div class="container-fluid p-2">
	<header class="mb-4 flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="h2">Project Board</h2>
			<p class="text-sm text-gray-500">
				{projects.length} Projects • {totalTasks} Tasks
			</p>
		</div>

		<!-- Controls -->
		<div class="flex flex-wrap items-center gap-2">
			<!-- FIXED: Simple manual refresh button -->
			<button
				on:click={refreshProjects}
				class="btn btn-sm btn-circle btn-ghost"
				title="Refresh"
				aria-label="Refresh projects"
				disabled={loading}
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

			<!-- Group Filter -->
			<select
				bind:value={selectedGroupId}
				class="select select-sm select-bordered"
				disabled={groupsLoading}
			>
				<option value="">All Groups</option>
				{#each groups as group}
					<option value={group.id}>{group.name}</option>
				{/each}
			</select>

			<!-- Create Button -->
			{#if !showCreateForm}
				<button on:click={() => (showCreateForm = true)} class="btn btn-primary btn-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Project
				</button>
			{/if}
		</div>
	</header>

	{#if error}
		<div class="alert alert-error mb-4">
			<p>{error}</p>
			<button on:click={() => (error = null)} class="float-right">&times;</button>
		</div>
	{/if}

	{#if showCreateForm}
		<div class="mb-6">
			<ProjectForm on:submit={handleCreateProject} on:cancel={handleCancelCreate} />
		</div>
	{/if}

	<!-- Loading indicator -->
	{#if isLoading && projects.length === 0}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<ProjectList
			{projects}
			{loading}
			showGroupName={!selectedGroupId}
			tasksMap={projectTasks}
			on:select={handleSelectProject}
		/>
	{/if}
</div>
