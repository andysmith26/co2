<!-- src/lib/components/Tasks/TaskForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Task } from '../../types';
	import { TASK_STATUS } from '../../constants';

	// Props
	const {
		projectId = '',
		groupMembers = []
	} = $props<{
		projectId: string;
		groupMembers: any[];  // We'll use any[] for now, ideally this would be properly typed
	}>();

	// State
	let title: string = $state('');
	let description: string = $state('');
	let assigneeId: string | null = $state(null);
	let status: string = $state(TASK_STATUS.TODO);
	let error: string | null = $state(null);
	let isSubmitting: boolean = $state(false);

	// Events
	const dispatch = createEventDispatcher();

	// Methods
	function validateForm() {
		error = null;
		if (!title.trim()) {
			error = 'Task title is required';
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
				projectId,
				title,
				description: description || undefined,
				assigneeId,
				status
			});

			// Reset form
			title = '';
			description = '';
			assigneeId = null;
			status = TASK_STATUS.TODO;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
			console.error('Error submitting task form:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="task-form p-4 bg-white rounded-lg shadow">
	<h3 class="text-lg font-medium mb-4">Add New Task</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		{#if error}
			<div class="p-3 bg-red-100 text-red-700 rounded-md">
				{error}
			</div>
		{/if}

		<div class="form-control">
			<label for="task-title" class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
			<input
				id="task-title"
				type="text"
				bind:value={title}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="Enter task title"
				required
			/>
		</div>

		<div class="form-control">
			<label for="task-description" class="block text-sm font-medium text-gray-700 mb-1"
				>Description (optional)</label
			>
			<textarea
				id="task-description"
				bind:value={description}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows="2"
				placeholder="Describe the task"
			></textarea>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="task-assignee" class="block text-sm font-medium text-gray-700 mb-1"
					>Assignee (optional)</label
				>
				<select
					id="task-assignee"
					bind:value={assigneeId}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value={null}>Unassigned</option>
					{#each groupMembers as member}
						<option value={member.user_id}>
							{member.first_name} {member.last_initial || member.last_name || ''}
						</option>
					{/each}
				</select>
			</div>

			<div class="form-control">
				<label for="task-status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<select
					id="task-status"
					bind:value={status}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value={TASK_STATUS.TODO}>To Do</option>
					<option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
					<option value={TASK_STATUS.COMPLETED}>Completed</option>
				</select>
			</div>
		</div>

		<div class="mt-4">
			<button
				type="submit"
				class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Adding...' : 'Add Task'}
			</button>
		</div>
	</form>
</div>
