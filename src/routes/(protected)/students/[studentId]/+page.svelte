<!-- src/routes/(protected)/students/[studentId]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StudentProfile from '$lib/components/Students/StudentProfile.svelte';

	// Props from server load
	let { data } = $props();
	let { student, groups, projects, tasks } = $derived(data);

	// Local state
	let error = $state<string | null>(null);
	let loading = $state(false);

	// Get student ID from params
	const studentId = $derived($page.params.studentId);

	// Event handlers
	async function handleUpdate(event: CustomEvent) {
		loading = true;
		error = null;

		try {
			const { first_name, last_initial } = event.detail;
			
			console.log('🔄 Updating student:', { studentId, first_name, last_initial });
			
			const response = await fetch(`/api/students/${studentId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ first_name, last_initial })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update student');
			}

			const updatedStudent = await response.json();
			console.log('✅ Student updated successfully:', updatedStudent);

			// Update local data
			student = updatedStudent;
			
		} catch (err) {
			console.error('❌ Error updating student:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update student';
			}
		} finally {
			loading = false;
		}
	}

	async function handleStatusUpdate(event: CustomEvent) {
		loading = true;
		error = null;

		try {
			const { status } = event.detail;
			
			console.log('🔄 Updating student status:', { studentId, status });
			
			const response = await fetch(`/api/students/${studentId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update student status');
			}

			const updatedStudent = await response.json();
			console.log('✅ Student status updated successfully:', updatedStudent);

			// Update local data
			student = updatedStudent;
			
		} catch (err) {
			console.error('❌ Error updating student status:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update student status';
			}
		} finally {
			loading = false;
		}
	}

	async function handleDelete(event: CustomEvent) {
		loading = true;
		error = null;

		try {
			console.log('🔄 Deleting student:', { studentId });
			
			const response = await fetch(`/api/students/${studentId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete student');
			}

			console.log('✅ Student deleted successfully');

			// Navigate back to students list
			goto('/students');
			
		} catch (err) {
			console.error('❌ Error deleting student:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete student';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{student.first_name} {student.last_initial} | Student Profile</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<div class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<nav class="flex items-center space-x-4">
					<a 
						href="/students" 
						class="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						<svg 
							class="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path 
								stroke-linecap="round" 
								stroke-linejoin="round" 
								stroke-width="2" 
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back to Students
					</a>
				</nav>
				
				{#if loading}
					<div class="flex items-center text-sm text-gray-500">
						<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
						Saving...
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="rounded-md bg-red-50 p-4">
				<div class="flex">
					<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
						<path 
							fill-rule="evenodd" 
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
							clip-rule="evenodd"
						/>
					</svg>
					<div class="ml-3">
						<p class="text-sm font-medium text-red-800">{error}</p>
					</div>
					<button 
						on:click={() => error = null}
						class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
					>
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path 
								fill-rule="evenodd" 
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<StudentProfile 
			{student}
			{groups}
			{projects}
			{tasks}
			on:update={handleUpdate}
			on:statusUpdate={handleStatusUpdate}
			on:delete={handleDelete}
		/>
	</div>
</div>
