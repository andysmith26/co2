<!-- src/lib/components/Tasks/TaskForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Task } from '../../types';
	import { TASK_STATUS, GROUP_MEMBER_ROLES } from '../../constants';

	// Props
	const {
		projectId = '',
		groupMembers = [],
		initialTask = null,
	} = $props<{
		projectId: string;
		groupMembers: any[];
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

	// Enhanced logging for debugging
	$effect(() => {
		console.log('🐛 TaskForm DEBUG - Enhanced Logging:');
		console.log('- projectId:', projectId);
		console.log('- groupMembers count:', groupMembers?.length);
		console.log('- initialTask:', initialTask);

		if (groupMembers && Array.isArray(groupMembers)) {
			const students = groupMembers.filter((m) => m.role === GROUP_MEMBER_ROLES.STUDENT);
			const teachers = groupMembers.filter((m) => m.role === GROUP_MEMBER_ROLES.TEACHER);

			console.log('- Teachers available:', teachers.length);
			console.log('- Students available:', students.length);

			// Log detailed structure for debugging
			if (students.length > 0) {
				console.log('- First student structure:', {
					id: students[0].id,
					student_id: students[0].student_id,
					user_id: students[0].user_id,
					first_name: students[0].first_name,
					last_initial: students[0].last_initial,
					role: students[0].role,
				});
			}

			if (teachers.length > 0) {
				console.log('- First teacher structure:', {
					id: teachers[0].id,
					user_id: teachers[0].user_id,
					student_id: teachers[0].student_id,
					first_name: teachers[0].first_name,
					last_name: teachers[0].last_name,
					role: teachers[0].role,
				});
			}

			// Validate data integrity
			const studentsWithoutStudentId = students.filter((s) => !s.student_id);
			const teachersWithoutUserId = teachers.filter((t) => !t.user_id);

			if (studentsWithoutStudentId.length > 0) {
				console.warn('⚠️ Students missing student_id:', studentsWithoutStudentId);
			}
			if (teachersWithoutUserId.length > 0) {
				console.warn('⚠️ Teachers missing user_id:', teachersWithoutUserId);
			}
		}

		// Log current form state
		console.log('- Current form state:', {
			assigneeId,
			assigneeType,
			title: title.substring(0, 20) + '...',
		});
	});

	// Helper functions with validation
	function getTeacherOptions() {
		if (!groupMembers || !Array.isArray(groupMembers)) {
			console.warn('⚠️ getTeacherOptions: groupMembers not available');
			return [];
		}

		const teachers = groupMembers.filter(
			(member) => member.role === GROUP_MEMBER_ROLES.TEACHER && member.user_id
		);

		console.log('🔍 getTeacherOptions: Found', teachers.length, 'valid teachers');
		return teachers;
	}

	function getStudentOptions() {
		if (!groupMembers || !Array.isArray(groupMembers)) {
			console.warn('⚠️ getStudentOptions: groupMembers not available');
			return [];
		}

		const students = groupMembers.filter(
			(member) => member.role === GROUP_MEMBER_ROLES.STUDENT && member.student_id
		);

		console.log('🔍 getStudentOptions: Found', students.length, 'valid students');
		return students;
	}

	// Methods
	function validateForm() {
		error = null;

		if (!title.trim()) {
			error = 'Task title is required';
			return false;
		}

		// Enhanced validation for assignments
		if (assigneeType && assigneeId) {
			if (assigneeType === 'teacher') {
				const teacher = getTeacherOptions().find((t) => t.user_id === assigneeId);
				if (!teacher) {
					console.error('❌ Validation failed: Teacher not found in group members', {
						assigneeId,
						availableTeachers: getTeacherOptions().map((t) => t.user_id),
					});
					error = 'Selected teacher is not available in this group';
					return false;
				}
			} else if (assigneeType === 'student') {
				const student = getStudentOptions().find((s) => s.student_id === assigneeId);
				if (!student) {
					console.error('❌ Validation failed: Student not found in group members', {
						assigneeId,
						availableStudents: getStudentOptions().map((s) => s.student_id),
					});
					error = 'Selected student is not available in this group';
					return false;
				}
			}
		}

		return true;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validateForm() || isSubmitting) return;

		isSubmitting = true;

		try {
			console.log('🔄 TaskForm SUBMIT - Enhanced Logging:');
			console.log('- Task operation:', initialTask ? 'UPDATE' : 'CREATE');
			console.log('- projectId:', projectId);
			console.log('- taskId:', initialTask?.id);
			console.log('- title:', title);
			console.log('- assigneeId:', assigneeId);
			console.log('- assigneeType:', assigneeType);
			console.log('- status:', status);

			// Additional validation logging
			if (assigneeType && assigneeId) {
				if (assigneeType === 'teacher') {
					const teacher = getTeacherOptions().find((t) => t.user_id === assigneeId);
					console.log('- Teacher validation:', teacher ? 'FOUND' : 'NOT FOUND');
					if (teacher) {
						console.log('- Teacher details:', {
							id: teacher.id,
							user_id: teacher.user_id,
							name: `${teacher.first_name} ${teacher.last_name || ''}`,
						});
					}
				} else if (assigneeType === 'student') {
					const student = getStudentOptions().find((s) => s.student_id === assigneeId);
					console.log('- Student validation:', student ? 'FOUND' : 'NOT FOUND');
					if (student) {
						console.log('- Student details:', {
							id: student.id,
							student_id: student.student_id,
							name: `${student.first_name} ${student.last_initial || ''}`,
						});
					}
				}
			}

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
				console.log('✅ TaskForm: Resetting form after successful creation');
				title = '';
				description = '';
				assigneeId = null;
				assigneeType = null;
				status = TASK_STATUS.TODO;
			}
		} catch (err) {
			console.error('❌ TaskForm: Submit failed:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
		} finally {
			isSubmitting = false;
		}
	}

	// Handle assignee selection with enhanced logging
	function handleAssigneeChange(selectedValue: string) {
		console.log('🔄 TaskForm: Assignee selection changed to:', selectedValue);

		if (selectedValue === 'null') {
			assigneeId = null;
			assigneeType = null;
			console.log('- Cleared assignee');
		} else {
			const [type, id] = selectedValue.split(':');
			assigneeId = id;
			assigneeType = type as 'teacher' | 'student';
			console.log('- Set assignee:', { assigneeId, assigneeType });

			// Validate the selection immediately
			if (assigneeType === 'teacher') {
				const teacher = getTeacherOptions().find((t) => t.user_id === assigneeId);
				console.log('- Teacher lookup result:', teacher ? 'FOUND' : 'NOT FOUND');
			} else if (assigneeType === 'student') {
				const student = getStudentOptions().find((s) => s.student_id === assigneeId);
				console.log('- Student lookup result:', student ? 'FOUND' : 'NOT FOUND');
			}
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
			<label for="task-description" class="mb-1 block text-sm font-medium text-gray-700">
				Description (optional)
			</label>
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
				<label for="task-assignee" class="mb-1 block text-sm font-medium text-gray-700">
					Assignee (optional)
				</label>
				<select
					id="task-assignee"
					on:change={(e) => handleAssigneeChange(e.currentTarget.value)}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					value={assigneeId && assigneeType ? `${assigneeType}:${assigneeId}` : 'null'}
				>
					<option value="null">Unassigned</option>

					<!-- Enhanced debugging info -->
					{#if getTeacherOptions().length === 0 && getStudentOptions().length === 0}
						<option disabled>⚠️ No group members available - check group setup</option>
					{/if}

					<!-- Teachers -->
					{#if getTeacherOptions().length > 0}
						<optgroup label="Teachers ({getTeacherOptions().length})">
							{#each getTeacherOptions() as teacher}
								<option value={`teacher:${teacher.user_id}`}>
									👨‍🏫 {teacher.first_name}
									{teacher.last_name || ''}
								</option>
							{/each}
						</optgroup>
					{:else}
						<optgroup label="Teachers">
							<option disabled>No teachers in this group</option>
						</optgroup>
					{/if}

					<!-- Students -->
					{#if getStudentOptions().length > 0}
						<optgroup label="Students ({getStudentOptions().length})">
							{#each getStudentOptions() as student}
								<option value={`student:${student.student_id}`}>
									👨‍🎓 {student.first_name}
									{student.last_initial || ''}
								</option>
							{/each}
						</optgroup>
					{:else}
						<optgroup label="Students">
							<option disabled>No students in this group</option>
						</optgroup>
					{/if}
				</select>

				<!-- Debug info for development -->
				{#if assigneeId && assigneeType}
					<div class="mt-1 text-xs text-gray-500">
						Selected: {assigneeType} ID {assigneeId}
					</div>
				{/if}
			</div>

			<div class="form-control">
				<label for="task-status" class="mb-1 block text-sm font-medium text-gray-700">Status</label>
				<select
					id="task-status"
					bind:value={status}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value={TASK_STATUS.TODO}>📝 To Do</option>
					<option value={TASK_STATUS.IN_PROGRESS}>🔄 In Progress</option>
					<option value={TASK_STATUS.COMPLETED}>✅ Completed</option>
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
