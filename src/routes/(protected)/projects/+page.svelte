<!-- src/routes/(protected)/projects/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ProjectList from '$lib/components/Projects/ProjectList.svelte';
	import ProjectForm from '$lib/components/Projects/ProjectForm.svelte';
	import { projectStore } from '$lib/stores/projects.svelte.ts';
	import { groupStore } from '$lib/stores/groups.svelte.ts';

	// State
	let showCreateForm = $state(false);
	let selectedGroupId = $state('');
	let error = $state<string | null>(null);
	let refreshInterval = $state<number | null>(null);
	let autoRefresh = $state(false); // DISABLED BY DEFAULT

	// Get stores data with $derived
	const projects = $derived(projectStore.projects);
	const loading = $derived(projectStore.loading);
	const tasksLoading = $derived(projectStore.tasksLoading);
	const projectTasks = $derived(projectStore.projectTasks);
	const groups = $derived(groupStore.groups);
	const groupsLoading = $derived(groupStore.loading);

	// FIXED: Much simpler initialization - no auto-refresh loops
	$effect.root(() => {
		// One-time data load
		groupStore.fetchGroups();
		projectStore.fetchProjects();

		// Clean up interval when component is destroyed
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
				refreshInterval = null;
			}
		};
	});

	// When group selection changes, fetch projects for that group
	$effect(() => {
		if (selectedGroupId) {
			projectStore.fetchProjectsByGroup(selectedGroupId);
		} else {
			projectStore.fetchProjects();
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

	function toggleAutoRefresh() {
		autoRefresh = !autoRefresh;
		if (autoRefresh) {
			// Set to 30 seconds, not every few seconds
			refreshInterval = setInterval(() => {
				console.log('Auto-refreshing projects...');
				projectStore.fetchProjects();
			}, 30000) as unknown as number; // 30 seconds
		} else if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	}

	function refreshProjects() {
		projectStore.fetchProjects();
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
			<!-- Refresh Control -->
			<div class="flex items-center gap-2">
				<button
					on:click={refreshProjects}
					class="btn btn-sm btn-circle btn-ghost"
					title="Refresh"
					aria-label="Refresh projects"
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
				<label class="flex cursor-pointer items-center gap-1">
					<input
						type="checkbox"
						class="toggle toggle-sm toggle-primary"
						checked={autoRefresh}
						on:change={toggleAutoRefresh}
					/>
					<span class="text-xs text-gray-500">Auto-refresh (30s)</span>
				</label>
			</div>

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
