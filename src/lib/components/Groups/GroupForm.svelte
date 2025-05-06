<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Group } from '../types';

	// Using the new $props rune
	const { group = null } = $props<{
		group?: Group | null;
	}>();

	// Form state
	let name: string = $state(group?.name || '');
	let description: string = $state(group?.description || '');
	let error: string | null = $state(null);
	let isSubmitting: boolean = $state(false);

	const dispatch = createEventDispatcher();

	$effect(() => {
		if (group) {
			name = group.name;
			description = group.description || '';
		} else {
			name = '';
			description = '';
		}
	});

	function validateForm() {
		error = null;
		if (!name.trim()) {
			error = 'Group name is required';
			return false;
		}
		return true;
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!validateForm() || isSubmitting) return;

		isSubmitting = true;

		try {
			const result = await dispatch('submit', {
				name,
				description: description || undefined,
				id: group?.id,
			});

			if (!result) {
				// Reset form if no result returned (usually for new groups)
				if (!group) {
					name = '';
					description = '';
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
			console.error('Error submitting group form:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="group-form p-4 bg-white rounded-lg shadow">
	<h2 class="text-xl font-semibold mb-4">
		{group ? 'Edit Group' : 'Create New Group'}
	</h2>

	<form onsubmit={handleSubmit} class="space-y-4">
		{#if error}
			<div class="p-3 bg-red-100 text-red-700 rounded-md">
				{error}
			</div>
		{/if}

		<div class="form-control">
			<label for="group-name" class="block text-sm font-medium text-gray-700 mb-1">Group Name</label
			>
			<input
				id="group-name"
				type="text"
				bind:value={name}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="Enter group name"
				required
			/>
		</div>

		<div class="form-control">
			<label for="group-description" class="block text-sm font-medium text-gray-700 mb-1"
				>Description (optional)</label
			>
			<textarea
				id="group-description"
				bind:value={description}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows="3"
				placeholder="Describe the purpose of this group"
			></textarea>
		</div>

		<div class="flex justify-end space-x-3 mt-6">
			<button
				type="button"
				onclick={handleCancel}
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
				{isSubmitting ? 'Saving...' : group ? 'Update Group' : 'Create Group'}
			</button>
		</div>
	</form>
</div>
