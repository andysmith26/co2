<!-- src/routes/(protected)/students/[studentId]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import StudentProfile from '$lib/components/Students/StudentProfile.svelte';
	import type { StudentProfileData } from '$lib/types/student';

	// Props from server load with proper typing
	let { data } = $props<{ data: StudentProfileData }>();

	// Reactive destructuring with proper typing
	let { student, groups, groupStats, tasks, collaborators, stats } = $derived(data);

	// Local state
	let error = $state<string | null>(null);
	let loading = $state(false);
	let pageTitle = $derived(`${student?.first_name || 'Student'} ${student?.last_initial || ''} | Profile`);

	// Get student ID from params
	const studentId = $derived($page.params.studentId);

	// Validation
	onMount(() => {
		if (!student) {
			error = 'Student data not found';
			return;
		}
		
		// Log for debugging
		console.log('🔍 Student Profile Page - Data loaded:', {
			studentId,
			studentName: `${student.first_name} ${student.last_initial}`,
			groupsCount: groups?.length || 0,
			tasksCount: tasks?.length || 0,
			collaboratorsCount: collaborators?.length || 0,
			statsData: stats
		});
	});

	// Event handlers with enhanced error handling
	async function handleUpdate(event: CustomEvent) {
		if (loading) return;
		
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
			data = {
				...data,
				student: updatedStudent
			};
			
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
		if (loading) return;
		
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
			data = {
				...data,
				student: updatedStudent
			};
			
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
		if (loading) return;
		
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

	// Helper function for error retry
	function retryAction() {
		error = null;
		// Could implement specific retry logic here
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content="Student profile for {student?.first_name} {student?.last_initial} - view tasks, groups, and collaboration data" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Enhanced Navigation -->
	<div class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<nav class="flex items-center space-x-4">
					<a 
						href="/students" 
						class="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
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
					
					<!-- Breadcrumb -->
					{#if student}
						<span class="text-gray-300">•</span>
						<span class="text-sm text-gray-700">
							{student.first_name} {student.last_initial}
						</span>
					{/if}
				</nav>
				
				<!-- Loading/Status Indicator -->
				<div class="flex items-center space-x-3">
					{#if loading}
						<div class="flex items-center text-sm text-gray-500">
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
							Saving...
						</div>
					{:else if student}
						<div class="flex items-center text-sm text-gray-500">
							<span class="mr-2">{stats?.total_tasks || 0} tasks</span>
							<span class="mr-2">•</span>
							<span class="mr-2">{groups?.length || 0} groups</span>
							{#if stats?.completion_rate !== undefined}
								<span class="mr-2">•</span>
								<span class="text-green-600 font-medium">{stats.completion_rate}% complete</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="rounded-lg bg-red-50 border border-red-200 p-4">
				<div class="flex items-start">
					<svg class="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path 
							fill-rule="evenodd" 
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
							clip-rule="evenodd"
						/>
					</svg>
					<div class="ml-3 flex-1">
						<h3 class="text-sm font-medium text-red-800">Error</h3>
						<p class="text-sm text-red-700 mt-1">{error}</p>
					</div>
					<div class="ml-3 flex-shrink-0 flex space-x-2">
						<button 
							onclick={retryAction}
							class="text-red-800 hover:text-red-900 text-sm font-medium underline"
						>
							Retry
						</button>
						<button 
							onclick={() => error = null}
							class="text-red-400 hover:text-red-500"
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
		</div>
	{/if}

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !student}
			<!-- Student Not Found State -->
			<div class="text-center py-16">
				<div class="mb-6">
					<svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h3>
				<p class="text-gray-600 mb-6 max-w-md mx-auto">
					The student you're looking for may have been removed or you don't have permission to view their profile.
				</p>
				<a 
					href="/students" 
					class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
					</svg>
					Back to Students
				</a>
			</div>
		{:else}
			<!-- Student Profile Component -->
			<StudentProfile 
				{student}
				{groups}
				{groupStats}
				{tasks}
				{collaborators}
				{stats}
				on:update={handleUpdate}
				on:statusUpdate={handleStatusUpdate}
				on:delete={handleDelete}
			/>
		{/if}
	</div>
</div>

<!-- Loading Overlay for Critical Operations -->
{#if loading}
	<div class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 flex items-center space-x-3">
			<div class="h-6 w-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600"></div>
			<span class="text-gray-700 font-medium">Processing...</span>
		</div>
	</div>
{/if}
