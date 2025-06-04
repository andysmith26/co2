<!-- src/routes/(protected)/projects/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ProjectsHeader from '$lib/components/Projects/ProjectsHeader.svelte';
	import ProjectsFilters from '$lib/components/Projects/ProjectsFilters.svelte';
	import ProjectList from '$lib/components/Projects/ProjectList.svelte';
	import ProjectForm from '$lib/components/Projects/ProjectForm.svelte';
	import AnnouncementsSidebar from '$lib/components/Projects/AnnouncementsSidebar.svelte';
	import { projectStore } from '$lib/stores/projects.svelte.ts';
	import { groupStore } from '$lib/stores/groups.svelte.ts';

	// State
	let showCreateForm = $state(false);
	let selectedGroupId = $state('');
	let error = $state<string | null>(null);

	// Get stores data with $derived
	const projects = $derived(projectStore.getProjects());
	const tasksMap = $derived(projectStore.getProjectTasks());
	const totalTaskCount = $derived(projectStore.getTotalTaskCount());
	const loading = $derived(projectStore.loading);
	const groups = $derived(groupStore.getGroups());
	const groupsLoading = $derived(groupStore.loading);

	// Get tasks loading state for each project
	const tasksLoadingSet = $derived(
		new Set(projects.map((p) => p.id).filter((id) => projectStore.isProjectTasksLoading(id)))
	);

	// Initialize data on mount
	onMount(async () => {
		console.log('🔄 Projects page mounting - loading initial data');
		try {
			// Load groups and projects in parallel
			await Promise.all([groupStore.fetchGroups(), projectStore.fetchProjects()]);

			// Start progressive task loading after projects are loaded
			if (projectStore.getProjects().length > 0) {
				console.log('🔄 Starting progressive task loading');
				projectStore.loadTasksForVisibleProjects();
			}
		} catch (err) {
			console.error('Error loading initial data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load data';
			}
		}
	});

	// Handle group filter changes
	async function handleGroupChange(event: CustomEvent) {
		const { groupId } = event.detail;
		selectedGroupId = groupId;

		console.log('🔄 Group filter changed to:', groupId || 'All Groups');

		try {
			// Fetch projects for the selected group
			if (groupId) {
				await projectStore.fetchProjectsByGroup(groupId);
			} else {
				await projectStore.fetchProjects();
			}

			// Start progressive task loading for the new project set
			if (projectStore.getProjects().length > 0) {
				console.log('🔄 Starting progressive task loading for filtered projects');
				projectStore.loadTasksForVisibleProjects();
			}
		} catch (err) {
			console.error('Error changing group filter:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to filter projects';
			}
		}
	}

	// Manual refresh - reload everything
	async function handleRefresh() {
		console.log('🔄 Manual refresh requested');
		try {
			// Refresh projects based on current filter
			if (selectedGroupId) {
				await projectStore.fetchProjectsByGroup(selectedGroupId);
			} else {
				await projectStore.fetchProjects();
			}

			// Force reload tasks for all visible projects
			if (projectStore.getProjects().length > 0) {
				console.log('🔄 Force refreshing all project tasks');
				projectStore.loadTasksForVisibleProjects(true); // force = true
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

	// Project creation
	async function handleCreateProject(event: CustomEvent) {
		try {
			const { title, description, group_id } = event.detail;
			const newProject = await projectStore.createProject(title, group_id, description);
			showCreateForm = false;
			error = null;

			// Immediately start loading tasks for the new project
			projectStore.fetchTasksForProject(newProject.id);
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

	function handleShowCreateForm() {
		showCreateForm = true;
	}
</script>

<svelte:head>
	<title>Projects | CO2</title>
</svelte:head>

<!-- Main layout with sidebar -->
<div class="flex h-screen bg-gray-50">
	<!-- Announcements Sidebar - Desktop/Tablet -->
	<div class="hidden md:flex md:w-[30%] md:flex-shrink-0">
		<AnnouncementsSidebar />
	</div>

	<!-- Main content area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Mobile announcements (top section) -->
		<div class="md:hidden border-b border-gray-200 bg-white">
			<div class="max-h-48 overflow-y-auto">
				<AnnouncementsSidebar />
			</div>
		</div>

		<!-- Projects content -->
		<div class="flex-1 overflow-y-auto">
			<div class="container-fluid p-4">
				<!-- Header with Stats and Refresh -->
				<ProjectsHeader
					projectCount={projects.length}
					taskCount={totalTaskCount}
					{loading}
					on:refresh={handleRefresh}
				/>

				<!-- Error Display -->
				{#if error}
					<div class="alert alert-error mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{error}</span>
						<button on:click={() => (error = null)} class="float-right">&times;</button>
					</div>
				{/if}

				<!-- Filters and Create Button -->
				<ProjectsFilters
					{groups}
					{selectedGroupId}
					{groupsLoading}
					{showCreateForm}
					on:groupChange={handleGroupChange}
					on:createProject={handleShowCreateForm}
				/>

				<!-- Create Project Form -->
				{#if showCreateForm}
					<div class="mb-6">
						<ProjectForm on:submit={handleCreateProject} on:cancel={handleCancelCreate} />
					</div>
				{/if}

				<!-- Loading indicator for initial load -->
				{#if loading && projects.length === 0}
					<div class="flex justify-center py-12">
						<div class="text-center">
							<span class="loading loading-spinner loading-lg"></span>
							<p class="mt-4 text-gray-600">Loading projects...</p>
						</div>
					</div>
				{:else}
					<!-- Projects List with Progressive Task Loading -->
					<ProjectList
						{projects}
						{loading}
						showGroupName={!selectedGroupId}
						{tasksMap}
						{tasksLoadingSet}
						on:select={handleSelectProject}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>
