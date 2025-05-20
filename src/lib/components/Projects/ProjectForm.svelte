<!-- src/lib/components/Projects/ProjectForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project } from '../../types';
	import { groupStore } from '$lib/stores/groups.svelte.ts';

	// Using the new $props rune
	const { project = null } = $props<{
		project?: Project | null;
	}>();

	// Form state
	let title: string = $state(project?.title || '');
	let description: string = $state(project?.description || '');
	let groupId: string = $state(project?.group_id || '');
	let error: string | null = $state(null);
	let isSubmitting: boolean = $state(false);

	// Get group data for dropdown
	$effect(() => {
		if (!groupStore.groups.length) {
			groupStore.fetchGroups();
		}
	});

	const groups = $derived(groupStore.groups);
	const loading = $derived(groupStore.loading);

	const dispatch = createEventDispatcher();

	$effect(() => {
		if (project) {
			title = project.title;
			description = project.description || '';
			groupId = project.group_id;
		} else {
			title = '';
			description = '';
			groupId = '';
		}
	});

	function validateForm() {
		error = null;
		if (!title.trim()) {
			error = 'Project title is required';
			return false;
		}
		if (!project && !groupId) {
			error = 'Group is required';
			return false;
		}
		return true;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validateForm() || isSubmitting) return;

		isSubmitting = true;

		try {
			await dispatch('submit', {
				title,
				description: description || undefined,
				group_id: groupId,
				id: project?.id,
			});

			// Reset form if this is a new project
			if (!project) {
				title = '';
				description = '';
			}
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
			console.error('Error submitting project form:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="project-form p-4 bg-white rounded-lg shadow">
	<h2 class="text-xl font-semibold mb-4">
		{project ? 'Edit Project' : 'Create New Project'}
	</h2>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		{#if error}
			<div class="p-3 bg-red-100 text-red-700 rounded-md">
				{error}
			</div>
		{/if}

		<div class="form-control">
			<label for="project-title" class="block text-sm font-medium text-gray-700 mb-1"
				>Project Title</label
			>
			<input
				id="project-title"
				type="text"
				bind:value={title}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="Enter project title"
				required
			/>
		</div>

		{#if !project}
			<!-- Only show group selection for new projects -->
			<div class="form-control">
				<label for="project-group" class="block text-sm font-medium text-gray-700 mb-1">Group</label>
				<select
					id="project-group"
					bind:value={groupId}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					required
				>
					<option value="">Select a group</option>
					{#each groups as group}
						<option value={group.id}>{group.name}</option>
					{/each}
				</select>
				{#if loading}
					<p class="text-sm text-gray-500 mt-1">Loading groups...</p>
				{/if}
			</div>
		{/if}

		<div class="form-control">
			<label for="project-description" class="block text-sm font-medium text-gray-700 mb-1"
				>Description (optional)</label
			>
			<textarea
				id="project-description"
				bind:value={description}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows="3"
				placeholder="Describe the project"
			></textarea>
		</div>

		<div class="flex justify-end space-x-3 mt-6">
			<button
				type="button"
				on:click={handleCancel}
				class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				disabled={isSubmitting}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
			</button>
		</div>
	</form>
</div>
