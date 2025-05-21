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
		groupMembers?: any[]; // Use the correct type based on your application
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let editingTaskId = $state<string | null>(null);
	let editTitle = $state('');
	let editStatus = $state('');
	let editingAssigneeTaskId = $state<string | null>(null);

	// Handle status change
	function handleStatusChange(task: Task, newStatus: string) {
		dispatch('updateStatus', {
			taskId: task.id,
			status: newStatus,
		});
	}

	// Helper functions to get available assignees
	function getTeacherOptions() {
		return groupMembers.filter((member) => member.role === GROUP_MEMBER_ROLES.TEACHER);
	}

	function getStudentOptions() {
		return groupMembers.filter((member) => member.role === GROUP_MEMBER_ROLES.STUDENT);
	}

	// Handle edit task
	function startEditing(task: Task) {
		editingTaskId = task.id;
		editTitle = task.title;
		editStatus = task.status;
	}

	function startEditingAssignee(task: Task) {
		editingTaskId = task.id;
	}

	function cancelEditing() {
		editingTaskId = null;
	}

	function saveEdits(task: Task) {
		if (editTitle.trim() === '') return;

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
			dispatch('delete', { taskId: task.id });
		}
	}

	// Handle assignee selection
	function handleAssigneeChange(
		task: Task,
		assigneeId: string | null,
		assigneeType: 'teacher' | 'student' | null = null
	) {
		dispatch('assign', {
			taskId: task.id,
			assigneeId,
			assigneeType,
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
		<!-- Tasks Table -->
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
									<span
										class={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(
											task.status
										)}`}
									>
										{task.status}
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if editingTaskId === task.id}
									<select
										class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										on:change={(e) => {
											const value = e.currentTarget.value;
											if (value === 'null') {
												handleAssigneeChange(task, null, null);
											} else {
												const [type, id] = value.split(':');
												handleAssigneeChange(task, id, type as 'teacher' | 'student');
											}
										}}
										value={task.assignee_type === 'teacher' && task.assignee_id
											? `teacher:${task.assignee_id}`
											: task.assignee_type === 'student' && task.student_assignee_id
												? `student:${task.student_assignee_id}`
												: 'null'}
									>
										<option value="null">Unassigned</option>
										<optgroup label="Teachers">
											{#each getTeacherOptions() as teacher}
												<option value={`teacher:${teacher.id}`}>
													{teacher.first_name}
													{teacher.last_name || ''} (Teacher)
												</option>
											{/each}
										</optgroup>
										<optgroup label="Students">
											{#each getStudentOptions() as student}
												<option value={`student:${student.id}`}>
													{student.first_name}
													{student.last_initial || ''} (Student)
												</option>
											{/each}
										</optgroup>
									</select>
								{:else}
									<div class="text-sm text-gray-900">
										{#if task.assignee_type === 'teacher' && task.assignee}
											<div class="flex items-center">
												<span class="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
												{task.assignee.first_name}
												{task.assignee.last_name || ''}
												<span class="ml-1 text-xs text-gray-500">(Teacher)</span>
											</div>
										{:else if task.assignee_type === 'student' && task.student_assignee}
											<div class="flex items-center">
												<span class="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
												{task.student_assignee.first_name}
												{task.student_assignee.last_initial || ''}
												<span class="ml-1 text-xs text-gray-500">(Student)</span>
											</div>
										{:else}
											<span class="text-gray-400">Unassigned</span>
										{/if}
										<button
											on:click={() => startEditingAssignee(task)}
											class="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
										>
											(change)
										</button>
									</div>
								{/if}
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

		<!-- Kanban View Toggle Button -->
		<div class="mt-4 text-right">
			<button
				class="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
				disabled
			>
				Switch to Kanban View (Coming Soon)
			</button>
		</div>
	{/if}
</div>
