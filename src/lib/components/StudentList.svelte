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
		formError = '';

		if (!firstName.trim()) {
			formError = 'First name is required';
			return;
		}

		if (!lastInitial.trim()) {
			formError = 'Last initial is required';
			return;
		}

		try {
			await studentStore.addStudent(firstName, lastInitial);
			// Reset form
			firstName = '';
			lastInitial = '';
		} catch (err: any) {
			formError = err.message;
		}
	}

	function handleToggleStatus(studentId: string) {
		studentStore.toggleStudentStatus(studentId);
	}
</script>

<div class="student-list">
	<h2>Students</h2>

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
					<h3>{student.first_name} {student.last_initial}</h3>
					<div class="status-badge">{student.status}</div>
					<button class="toggle-button" on:click={() => handleToggleStatus(student.id)}>
						Toggle Status
					</button>
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
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.student-card {
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #d1d5db;
	}

	.student-card.present {
		border-left-color: #10b981;
	}

	.student-card.absent {
		border-left-color: #ef4444;
	}

	.student-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: bold;
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

	.toggle-button {
		padding: 0.25rem 0.5rem;
		background-color: #e0f2fe;
		color: #0369a1;
		border: 1px solid #bae6fd;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		cursor: pointer;
	}
</style>
