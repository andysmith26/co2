<!-- src/lib/components/Tasks/TaskList.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Task } from '../../types';
	import { TASK_STATUS, GROUP_MEMBER_ROLES } from '../../constants';

	// Props
	const {
		tasks = [],
		loading = false,
	} = $props<{
		tasks: Task[];
		loading?: boolean;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let editingTaskId = $state<string | null>(null);
	let editTitle = $state('');
	let editStatus = $state('');

	// Debug logging for tasks
	$effect(() => {
		if (tasks && tasks.length > 0) {
			console.log(`TaskList: Received ${tasks.length} tasks`);
			
			// Create a summary of assignee information for all tasks
			const assigneeSummary = tasks.map(task => ({
				task_id: task.id,
				title: task.title,
				assignee_id: task.assignee_id,
				has_assignee_object: !!task.assignee,
				assignee_details: task.assignee
			}));
			
			console.table(assigneeSummary);
			
			// Log unique assignee_ids to check for the issue
			const uniqueAssigneeIds = [...new Set(tasks.map(t => t.assignee_id))];
			console.log(`TaskList: Number of unique assignee_ids: ${uniqueAssigneeIds.length}`);
			console.log('TaskList: Unique assignee_ids:', uniqueAssigneeIds);
		}
	});

	// Handle status change
	function handleStatusChange(task: Task, newStatus: string) {
		dispatch('updateStatus', {
			taskId: task.id,
			status: newStatus
		});
	}

	// Handle edit task
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
		
		dispatch('update', {
			taskId: task.id,
			title: editTitle,
			status: editStatus
		});
		
		editingTaskId = null;
	}

	// Handle delete task
	function deleteTask(task: Task) {
		if (confirm('Are you sure you want to delete this task?')) {
			dispatch('delete', { taskId: task.id });
		}
	}

	// Handle assignee selection
	function handleAssigneeChange(task: Task, assigneeId: string | null) {
		dispatch('assign', {
			taskId: task.id,
			assigneeId
		});
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

	// Helper function to format assignee name
	function formatAssigneeName(task: Task): string {
		if (!task.assignee) {
			return 'Unassigned';
		}

		if (task.assignee.role === GROUP_MEMBER_ROLES.TEACHER) {
			return `${task.assignee.first_name} ${task.assignee.last_name || ''}`;
		} else {
			return `${task.assignee.first_name} ${task.assignee.last_initial || ''}`;
		}
	}
</script>

<div class="task-list">
	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if tasks.length === 0}
		<div class="text-center py-12 bg-gray-50 rounded-lg">
			<h3 class="text-lg font-medium text-gray-700 mb-2">No Tasks</h3>
			<p class="text-gray-500">
				Create your first task for this project.
			</p>
		</div>
	{:else}
		<!-- Tasks Table -->
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Task
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Status
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Assignee
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
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
									<span
										class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
											task.status
										)}`}
									>
										{task.status}
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900">
									{formatAssigneeName(task)}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								{#if editingTaskId === task.id}
									<button
										on:click={() => saveEdits(task)}
										class="text-indigo-600 hover:text-indigo-900 mr-4"
									>
										Save
									</button>
									<button
										on:click={cancelEditing}
										class="text-gray-600 hover:text-gray-900"
									>
										Cancel
									</button>
								{:else}
									<button
										on:click={() => startEditing(task)}
										class="text-indigo-600 hover:text-indigo-900 mr-4"
									>
										Edit
									</button>
									<button
										on:click={() => deleteTask(task)}
										class="text-red-600 hover:text-red-900"
									>
										Delete
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
