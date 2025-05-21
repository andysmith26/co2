<!-- src/lib/components/Tasks/TaskForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Task } from '../../types';
	import { TASK_STATUS } from '../../constants';

	// Props
	const {
		projectId = '',
		groupMembers = [],
		initialTask = null,
	} = $props<{
		projectId: string;
		groupMembers: any[]; // We'll use any[] for now, ideally this would be properly typed
		initialTask?: Task | null;
	}>();

	// State
	let title: string = $state(initialTask?.title || '');
	let description: string = $state(initialTask?.description || '');
	let assigneeId: string | null = $state(
		initialTask?.assignee_type === 'teacher'
			? initialTask?.assignee_id
			: initialTask?.assignee_type === 'student'
				? initialTask?.student_assignee_id
				: initialTask?.assignee_id || initialTask?.student_assignee_id || null
	);
	let assigneeType: 'teacher' | 'student' | null = $state(initialTask?.assignee_type || null);
	let status: string = $state(initialTask?.status || TASK_STATUS.TODO);
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
				taskId: initialTask?.id,
				title,
				description: description || undefined,
				assigneeId,
				assigneeType,
				status,
			});

			// If this is a new task, reset the form
			if (!initialTask) {
				title = '';
				description = '';
				assigneeId = null;
				assigneeType = null;
				status = TASK_STATUS.TODO;
			}
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

<div class="task-form rounded-lg bg-white p-4 shadow">
	<h3 class="mb-4 text-lg font-medium">{initialTask ? 'Edit Task' : 'Add New Task'}</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		{#if error}
			<div class="rounded-md bg-red-100 p-3 text-red-700">
				{error}
			</div>
		{/if}

		<div class="form-control">
			<label for="task-title" class="mb-1 block text-sm font-medium text-gray-700">Task Title</label
			>
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
			<label for="task-description" class="mb-1 block text-sm font-medium text-gray-700"
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

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="form-control">
				<label for="task-assignee" class="mb-1 block text-sm font-medium text-gray-700"
					>Assignee (optional)</label
				>
				<select
					id="task-assignee"
					on:change={(e) => {
						const selectedValue = e.currentTarget.value;
						if (selectedValue === 'null') {
							assigneeId = null;
							assigneeType = null;
						} else {
							// Format is either "teacher:{id}" or "student:{id}"
							const [type, id] = selectedValue.split(':');
							assigneeId = id;
							assigneeType = type as 'teacher' | 'student';
						}
					}}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					value={assigneeId && assigneeType ? `${assigneeType}:${assigneeId}` : 'null'}
				>
					<option value="null">Unassigned</option>
					{#each groupMembers as member}
						{#if member.user_id}
							<option value={`teacher:${member.user_id}`}>
								{member.first_name}
								{member.last_name || ''} (Teacher)
							</option>
						{:else if member.student_id}
							<option value={`student:${member.student_id}`}>
								{member.first_name}
								{member.last_initial || ''} (Student)
							</option>
						{/if}
					{/each}
				</select>
			</div>

			<div class="form-control">
				<label for="task-status" class="mb-1 block text-sm font-medium text-gray-700">Status</label>
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
				class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				disabled={isSubmitting}
			>
				{isSubmitting
					? initialTask
						? 'Updating...'
						: 'Adding...'
					: initialTask
						? 'Update Task'
						: 'Add Task'}
			</button>
		</div>
	</form>
</div>
