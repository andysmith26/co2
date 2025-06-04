<!-- src/lib/components/StudentList.svelte -->
<script lang="ts">
	import { studentStore } from '$lib/stores/students.svelte';
	import { onMount } from 'svelte';

	// Get students from the store
	const students = $derived(studentStore.getStudents());
	const loading = $derived(studentStore.loading);
	const error = $derived(studentStore.error);

	// Form state
	let firstName = $state('');
	let lastInitial = $state('');
	let formError = $state('');

	// Load data when component mounts
	onMount(() => {
		studentStore.fetchStudents();
	});

	// Handle form submission
	async function handleAddStudent() {
		console.log('🐛 DEBUG: handleAddStudent called');
		console.log('🐛 DEBUG: Form values:', { firstName, lastInitial });
		console.log('🐛 DEBUG: Trimmed values:', {
			firstName: firstName.trim(),
			lastInitial: lastInitial.trim(),
		});

		formError = '';

		if (!firstName.trim()) {
			console.log('🐛 DEBUG: Validation failed - firstName empty');
			formError = 'First name is required';
			return;
		}

		if (!lastInitial.trim()) {
			console.log('🐛 DEBUG: Validation failed - lastInitial empty');
			formError = 'Last initial is required';
			return;
		}

		console.log('🐛 DEBUG: Validation passed, calling studentStore.addStudent');

		try {
			const result = await studentStore.addStudent(firstName, lastInitial);
			console.log('🐛 DEBUG: studentStore.addStudent succeeded:', result);

			// Reset form
			firstName = '';
			lastInitial = '';
			console.log('🐛 DEBUG: Form reset');
		} catch (err: any) {
			console.error('🐛 DEBUG: studentStore.addStudent failed:', err);
			console.error('🐛 DEBUG: Error details:', {
				message: err.message,
				stack: err.stack,
				cause: err.cause,
				fullError: err,
			});
			formError = err.message;
		}
	}

	function handleToggleStatus(studentId: string) {
		console.log('🐛 DEBUG: handleToggleStatus called for:', studentId);
		studentStore.toggleStudentStatus(studentId);
	}
</script>

<div class="student-list">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-bold">Students</h2>
		<a 
			href="/students" 
			class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
		>
			View All Students →
		</a>
	</div>

	{#if error}
		<div class="error-message">
			<p>Error: {error}</p>
			<button on:click={() => studentStore.fetchStudents()}>Try Again</button>
		</div>
	{/if}

	<!-- Simple Add Student Form -->
	<div class="add-student-form">
		<h3>Add Student</h3>

		{#if formError}
			<div class="error-message">
				<p>{formError}</p>
			</div>
		{/if}

		<form on:submit|preventDefault={handleAddStudent}>
			<div class="form-group">
				<label for="firstName">First Name</label>
				<input type="text" id="firstName" bind:value={firstName} placeholder="Enter first name" />
			</div>

			<div class="form-group">
				<label for="lastInitial">Last Initial</label>
				<input
					type="text"
					id="lastInitial"
					bind:value={lastInitial}
					placeholder="Enter last initial"
					maxlength="1"
				/>
			</div>

			<button type="submit" class="add-button">Add Student</button>
		</form>
	</div>

	{#if loading && !students.length}
		<div class="loading-spinner">
			<span>Loading students...</span>
		</div>
	{:else if students.length === 0}
		<p>No students found. Add your first student using the form above.</p>
	{:else}
		<div class="student-grid">
			{#each students as student (student.id)}
				<div class="student-card {student.status === 'present' ? 'present' : 'absent'}">
					<div class="student-header">
						<h3>{student.first_name} {student.last_initial}</h3>
						<div class="student-actions">
							<a 
								href={`/students/${student.id}`}
								class="view-profile-button"
								title="View Profile"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</a>
						</div>
					</div>
					
					<div class="status-badge">{student.status}</div>
					
					<div class="student-actions-row">
						<button class="toggle-button" on:click={() => handleToggleStatus(student.id)}>
							Toggle Status
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Keep your existing styles */
	.student-list {
		width: 100%;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	h3 {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.loading-spinner {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100px;
	}

	.error-message {
		background-color: #fee2e2;
		color: #b91c1c;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-student-form {
		background-color: #f9fafb;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		font-size: 1rem;
	}

	.add-button {
		padding: 0.5rem 1rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
	}

	.add-button:hover {
		background-color: #2563eb;
	}

	.student-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.student-card {
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #d1d5db;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.student-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.student-card.present {
		border-left-color: #10b981;
	}

	.student-card.absent {
		border-left-color: #ef4444;
	}

	.student-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.student-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: bold;
		flex: 1;
	}

	.student-actions {
		margin-left: 0.5rem;
	}

	.view-profile-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background-color: #f3f4f6;
		color: #6b7280;
		border-radius: 0.375rem;
		transition: all 0.2s;
		text-decoration: none;
	}

	.view-profile-button:hover {
		background-color: #e5e7eb;
		color: #374151;
		transform: scale(1.05);
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-weight: bold;
		text-transform: capitalize;
		background-color: #f3f4f6;
		margin-bottom: 0.5rem;
	}

	.student-actions-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
	}

	.toggle-button {
		padding: 0.375rem 0.75rem;
		background-color: #e0f2fe;
		color: #0369a1;
		border: 1px solid #bae6fd;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-button:hover {
		background-color: #bae6fd;
		transform: translateY(-1px);
	}
</style>
