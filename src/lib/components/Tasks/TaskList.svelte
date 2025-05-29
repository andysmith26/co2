<!-- src/lib/components/Tasks/TaskList.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Task } from '../../types';
	import { TASK_STATUS, GROUP_MEMBER_ROLES } from '../../constants';

	// Props
	const {
		tasks = [],
		loading = false,
		groupMembers = [],
	} = $props<{
		tasks: Task[];
		loading?: boolean;
		groupMembers?: any[];
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state - simplified, no more inline editing
	let editingTaskId = $state<string | null>(null);
	let editTitle = $state('');
	let editStatus = $state('');

	// Handle status change - this is the main interaction we keep
	function handleStatusChange(task: Task, newStatus: string) {
		console.log('🔄 TaskList: Status change for task', task.id, 'to', newStatus);
		dispatch('updateStatus', {
			taskId: task.id,
			status: newStatus,
		});
	}

	// Simplified edit - title and status only
	function startEditing(task: Task) {
		editingTaskId = task.id;
		editTitle = task.title;
		editStatus = task.status;
	}

	function cancelEditing() {
		editingTaskId = null;
	}

	function saveEdits(task: Task) {
		if (editTitle.trim() === '') return;

		console.log('🔄 TaskList: Saving edits for task', task.id);
		dispatch('update', {
			taskId: task.id,
			title: editTitle,
			status: editStatus,
		});

		editingTaskId = null;
	}

	// Handle delete task
	function deleteTask(task: Task) {
		if (confirm('Are you sure you want to delete this task?')) {
			console.log('🔄 TaskList: Deleting task', task.id);
			dispatch('delete', { taskId: task.id });
		}
	}

	// Status color mapping
	function getStatusColor(status: string): string {
		switch (status) {
			case TASK_STATUS.TODO:
				return 'bg-gray-100 text-gray-800';
			case TASK_STATUS.IN_PROGRESS:
				return 'bg-blue-100 text-blue-800';
			case TASK_STATUS.COMPLETED:
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	// Helper to display assignee info
	function getAssigneeDisplay(task: Task): string {
		if (task.assignee_type === 'teacher' && task.assignee) {
			return `${task.assignee.first_name} ${task.assignee.last_name || ''} (Teacher)`;
		} else if (task.assignee_type === 'student' && task.student_assignee) {
			return `${task.student_assignee.first_name} ${task.student_assignee.last_initial || ''} (Student)`;
		}
		return 'Unassigned';
	}
</script>

<div class="task-list">
	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if tasks.length === 0}
		<div class="rounded-lg bg-gray-50 py-12 text-center">
			<h3 class="mb-2 text-lg font-medium text-gray-700">No Tasks</h3>
			<p class="text-gray-500">Create your first task for this project.</p>
		</div>
	{:else}
		<!-- Simplified Tasks Table -->
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Task
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Status
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Assignee
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each tasks as task (task.id)}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if editingTaskId === task.id}
									<input
										type="text"
										bind:value={editTitle}
										class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
									/>
								{:else}
									<div class="text-sm font-medium text-gray-900">{task.title}</div>
									{#if task.description}
										<div class="text-sm text-gray-500">{task.description}</div>
									{/if}
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if editingTaskId === task.id}
									<select
										bind:value={editStatus}
										class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
									>
										<option value={TASK_STATUS.TODO}>To Do</option>
										<option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
										<option value={TASK_STATUS.COMPLETED}>Completed</option>
									</select>
								{:else}
									<!-- Quick status toggle buttons -->
									<div class="flex items-center gap-2">
										<span
											class={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(task.status)}`}
										>
											{task.status}
										</span>
										<div class="flex gap-1">
											{#if task.status !== TASK_STATUS.TODO}
												<button
													on:click={() => handleStatusChange(task, TASK_STATUS.TODO)}
													class="text-xs text-gray-500 hover:text-gray-700"
													title="Mark as To Do"
												>
													📝
												</button>
											{/if}
											{#if task.status !== TASK_STATUS.IN_PROGRESS}
												<button
													on:click={() => handleStatusChange(task, TASK_STATUS.IN_PROGRESS)}
													class="text-xs text-blue-500 hover:text-blue-700"
													title="Mark as In Progress"
												>
													🔄
												</button>
											{/if}
											{#if task.status !== TASK_STATUS.COMPLETED}
												<button
													on:click={() => handleStatusChange(task, TASK_STATUS.COMPLETED)}
													class="text-xs text-green-500 hover:text-green-700"
													title="Mark as Completed"
												>
													✅
												</button>
											{/if}
										</div>
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<!-- Display-only assignee info -->
								<div class="text-sm text-gray-900">
									{getAssigneeDisplay(task)}
								</div>
								<div class="mt-1 text-xs text-gray-500">
									Change assignments when editing the task
								</div>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
								{#if editingTaskId === task.id}
									<button
										on:click={() => saveEdits(task)}
										class="mr-4 text-indigo-600 hover:text-indigo-900"
									>
										Save
									</button>
									<button on:click={cancelEditing} class="text-gray-600 hover:text-gray-900">
										Cancel
									</button>
								{:else}
									<button
										on:click={() => startEditing(task)}
										class="mr-4 text-indigo-600 hover:text-indigo-900"
									>
										Edit
									</button>
									<button on:click={() => deleteTask(task)} class="text-red-600 hover:text-red-900">
										Delete
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-600">
			<strong>💡 Tip:</strong> Use the quick status buttons (📝🔄✅) to update task progress. To change
			task assignments, use the "Add New Task" form above.
		</div>
	{/if}
</div>
