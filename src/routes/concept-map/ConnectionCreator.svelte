<style>
	.connection-creator {
		background-color: #f9f9f9;
		padding: 1rem;
		border-radius: 4px;
		margin-top: 1.5rem;
	}

	h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
	}

	select,
	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.create-button {
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
		cursor: pointer;
		width: 100%;
		transition: background-color 0.2s;
	}

	.create-button:hover {
		background-color: #2980b9;
	}

	.create-button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}
</style>

<script>
	import { createEventDispatcher } from 'svelte';
	import { connectionTypes } from './data/concepts';

	// Props
	let { concepts, selectedConcept } = $props();

	// Local state
	let targetConceptId = $state('');
	let connectionType = $state(connectionTypes[0]?.id || '');
	let connectionDescription = $state('');

	// Event dispatcher to communicate with parent component
	const dispatch = createEventDispatcher();

	// Filter concepts to remove the currently selected one
	const availableConcepts = $derived(
		concepts
			.filter((c) => c.id !== selectedConcept?.id)
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	// Create a new connection between concepts
	function createConnection() {
		if (!targetConceptId || !connectionType) return;

		// Create the connection object
		const newConnection = {
			id: `user-${Date.now()}`,
			source: selectedConcept.id,
			target: targetConceptId,
			type: connectionType,
			description: connectionDescription || 'Related concepts',
			userCreated: true,
		};

		// Dispatch the event to the parent
		dispatch('create', newConnection);

		// Reset form
		targetConceptId = '';
		connectionDescription = '';
	}
</script>

<div class="connection-creator">
	<h3>Create New Connection</h3>

	<div class="form-group">
		<label for="target-concept">Connect to:</label>
		<select id="target-concept" bind:value={targetConceptId} required>
			<option value="">Select a concept...</option>
			{#each availableConcepts as concept}
				<option value={concept.id}>{concept.label}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="connection-type">Relationship type:</label>
		<select id="connection-type" bind:value={connectionType} required>
			{#each connectionTypes as type}
				<option value={type.id}>{type.label} - {type.description}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="connection-description">Description (optional):</label>
		<input
			id="connection-description"
			type="text"
			placeholder="Describe how these concepts are related"
			bind:value={connectionDescription}
		/>
	</div>

	<button
		class="create-button"
		onclick={createConnection}
		disabled={!targetConceptId || !connectionType}
	>
		Create Connection
	</button>
</div>
