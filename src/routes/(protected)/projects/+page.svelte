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

	// Get stores data with $derived
	const projects = $derived(projectStore.projects);
	const loading = $derived(projectStore.loading);
	const groups = $derived(groupStore.groups);
	const groupsLoading = $derived(groupStore.loading);

	// Initialize data
	$effect(() => {
		groupStore.fetchGroups();
		projectStore.fetchProjects();
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
</script>

<div class="container-fluid p-2">
	<header class="mb-4 flex items-center justify-between flex-wrap gap-2">
		<h2 class="h2">Projects</h2>

		<!-- Controls -->
		<div class="flex items-center gap-2 flex-wrap">
			<!-- Group Filter -->
			<select
				bind:value={selectedGroupId}
				class="select"
				disabled={groupsLoading}
			>
				<option value="">All Groups</option>
				{#each groups as group}
					<option value={group.id}>{group.name}</option>
				{/each}
			</select>

			<!-- Create Button -->
			{#if !showCreateForm}
				<button
					on:click={() => (showCreateForm = true)}
					class="btn btn-primary"
				>
					Create Project
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
			<ProjectForm
				on:submit={handleCreateProject}
				on:cancel={handleCancelCreate}
			/>
		</div>
	{/if}

	<ProjectList
		{projects}
		loading={loading}
		showGroupName={!selectedGroupId}
		on:select={handleSelectProject}
	/>
</div>
