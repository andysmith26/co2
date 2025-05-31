<!-- src/lib/components/Resources/ResourceForm.svelte - UPDATED for independent resources -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Resource, Group } from '../../types';
	import { RESOURCE_TYPES } from '../../constants';

	// Props
	const {
		groups = [],
		initialResource = null,
	} = $props<{
		groups?: Group[];
		initialResource?: Resource | null;
	}>();

	// State
	let type: string = $state(initialResource?.type || RESOURCE_TYPES.LINK);
	let title: string = $state(initialResource?.title || '');
	let description: string = $state(initialResource?.description || '');
	let url: string = $state(initialResource?.url || '');
	let groupId: string = $state(initialResource?.group_id || '');
	let error: string | null = $state(null);
	let isSubmitting: boolean = $state(false);

	// Events
	const dispatch = createEventDispatcher();

	// Reset form when initialResource changes
	$effect(() => {
		if (initialResource) {
			type = initialResource.type;
			title = initialResource.title;
			description = initialResource.description || '';
			url = initialResource.url;
			groupId = initialResource.group_id || '';
		} else {
			type = RESOURCE_TYPES.LINK;
			title = '';
			description = '';
			url = '';
			groupId = '';
		}
	});

	// Methods
	function validateForm() {
		error = null;
		
		if (!title.trim()) {
			error = 'Resource title is required';
			return false;
		}
		
		if (!url.trim()) {
			error = 'Resource URL is required';
			return false;
		}
		
		// Basic URL validation for LINK type
		if (type === RESOURCE_TYPES.LINK) {
			try {
				new URL(url);
			} catch {
				error = 'Please enter a valid URL (e.g., https://example.com)';
				return false;
			}
		}
		
		return true;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validateForm() || isSubmitting) return;

		isSubmitting = true;

		try {
			console.log('🔄 ResourceForm SUBMIT:', {
				resourceId: initialResource?.id,
				type,
				title,
				url,
				description,
				group_id: groupId
			});

			await dispatch('submit', {
				resourceId: initialResource?.id,
				type,
				title,
				url,
				description: description || undefined,
				group_id: groupId || undefined,
			});

			// If this is a new resource, reset the form
			if (!initialResource) {
				title = '';
				description = '';
				url = '';
				groupId = '';
				type = RESOURCE_TYPES.LINK;
			}
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
			console.error('Error submitting resource form:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	// Auto-format URL
	function handleUrlBlur() {
		if (url && type === RESOURCE_TYPES.LINK) {
			// Auto-add https:// if no protocol is specified
			if (!url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}
		}
	}
</script>

<div class="resource-form rounded-lg bg-white p-6 shadow">
	<h3 class="mb-4 text-lg font-medium">
		{initialResource ? 'Edit Resource' : 'Add New Resource'}
	</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		{#if error}
			<div class="rounded-md bg-red-100 p-3 text-red-700">
				{error}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="form-control">
				<label for="resource-type" class="mb-1 block text-sm font-medium text-gray-700">
					Resource Type
				</label>
				<select
					id="resource-type"
					bind:value={type}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					disabled={!!initialResource} 
				>
					<option value={RESOURCE_TYPES.LINK}>Link</option>
					<!-- Future resource types can be added here -->
				</select>
				{#if initialResource}
					<p class="mt-1 text-xs text-gray-500">Resource type cannot be changed after creation</p>
				{/if}
			</div>

			<div class="form-control">
				<label for="resource-group" class="mb-1 block text-sm font-medium text-gray-700">
					Scope
				</label>
				<select
					id="resource-group"
					bind:value={groupId}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value="">Global (visible to everyone)</option>
					{#each groups as group}
						<option value={group.id}>{group.name} (group only)</option>
					{/each}
				</select>
				<p class="mt-1 text-xs text-gray-500">
					Global resources are visible to all users. Group resources are only visible to group members.
				</p>
			</div>
		</div>

		<div class="form-control">
			<label for="resource-title" class="mb-1 block text-sm font-medium text-gray-700">
				Title
			</label>
			<input
				id="resource-title"
				type="text"
				bind:value={title}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="Enter resource title"
				required
			/>
		</div>

		<div class="form-control">
			<label for="resource-url" class="mb-1 block text-sm font-medium text-gray-700">
				URL
			</label>
			<input
				id="resource-url"
				type="url"
				bind:value={url}
				on:blur={handleUrlBlur}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="https://example.com"
				required
			/>
			<p class="mt-1 text-xs text-gray-500">
				{#if type === RESOURCE_TYPES.LINK}
					Enter a web URL (https:// will be added automatically if needed)
				{/if}
			</p>
		</div>

		<div class="form-control">
			<label for="resource-description" class="mb-1 block text-sm font-medium text-gray-700">
				Description (optional)
			</label>
			<textarea
				id="resource-description"
				bind:value={description}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows="3"
				placeholder="Describe what this resource contains or why it's useful"
			></textarea>
		</div>

		<div class="flex justify-end space-x-3 mt-6">
			{#if initialResource}
				<button
					type="button"
					on:click={handleCancel}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					disabled={isSubmitting}
				>
					Cancel
				</button>
			{/if}
			<button
				type="submit"
				class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				disabled={isSubmitting}
			>
				{isSubmitting
					? initialResource
						? 'Updating...'
						: 'Adding...'
					: initialResource
						? 'Update Resource'
						: 'Add Resource'}
			</button>
		</div>
	</form>
</div><!-- src/lib/components/Resources/ResourceForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Resource } from '../../types';
	import { RESOURCE_TYPES } from '../../constants';

	// Props
	const {
		projectId = '',
		initialResource = null,
	} = $props<{
		projectId: string;
		initialResource?: Resource | null;
	}>();

	// State
	let type: string = $state(initialResource?.type || RESOURCE_TYPES.LINK);
	let title: string = $state(initialResource?.title || '');
	let description: string = $state(initialResource?.description || '');
	let url: string = $state(initialResource?.url || '');
	let error: string | null = $state(null);
	let isSubmitting: boolean = $state(false);

	// Events
	const dispatch = createEventDispatcher();

	// Reset form when initialResource changes
	$effect(() => {
		if (initialResource) {
			type = initialResource.type;
			title = initialResource.title;
			description = initialResource.description || '';
			url = initialResource.url;
		} else {
			type = RESOURCE_TYPES.LINK;
			title = '';
			description = '';
			url = '';
		}
	});

	// Methods
	function validateForm() {
		error = null;
		
		if (!title.trim()) {
			error = 'Resource title is required';
			return false;
		}
		
		if (!url.trim()) {
			error = 'Resource URL is required';
			return false;
		}
		
		// Basic URL validation for LINK type
		if (type === RESOURCE_TYPES.LINK) {
			try {
				new URL(url);
			} catch {
				error = 'Please enter a valid URL (e.g., https://example.com)';
				return false;
			}
		}
		
		return true;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validateForm() || isSubmitting) return;

		isSubmitting = true;

		try {
			console.log('🔄 ResourceForm SUBMIT:', {
				projectId,
				resourceId: initialResource?.id,
				type,
				title,
				url,
				description
			});

			await dispatch('submit', {
				projectId,
				resourceId: initialResource?.id,
				type,
				title,
				url,
				description: description || undefined,
			});

			// If this is a new resource, reset the form
			if (!initialResource) {
				title = '';
				description = '';
				url = '';
				type = RESOURCE_TYPES.LINK;
			}
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
			console.error('Error submitting resource form:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	// Auto-format URL
	function handleUrlBlur() {
		if (url && type === RESOURCE_TYPES.LINK) {
			// Auto-add https:// if no protocol is specified
			if (!url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}
		}
	}
</script>

<div class="resource-form rounded-lg bg-white p-4 shadow">
	<h3 class="mb-4 text-lg font-medium">
		{initialResource ? 'Edit Resource' : 'Add New Resource'}
	</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		{#if error}
			<div class="rounded-md bg-red-100 p-3 text-red-700">
				{error}
			</div>
		{/if}

		<div class="form-control">
			<label for="resource-type" class="mb-1 block text-sm font-medium text-gray-700">
				Resource Type
			</label>
			<select
				id="resource-type"
				bind:value={type}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				disabled={!!initialResource} 
			>
				<option value={RESOURCE_TYPES.LINK}>Link</option>
				<!-- Future resource types can be added here -->
			</select>
			{#if initialResource}
				<p class="mt-1 text-xs text-gray-500">Resource type cannot be changed after creation</p>
			{/if}
		</div>

		<div class="form-control">
			<label for="resource-title" class="mb-1 block text-sm font-medium text-gray-700">
				Title
			</label>
			<input
				id="resource-title"
				type="text"
				bind:value={title}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="Enter resource title"
				required
			/>
		</div>

		<div class="form-control">
			<label for="resource-url" class="mb-1 block text-sm font-medium text-gray-700">
				URL
			</label>
			<input
				id="resource-url"
				type="url"
				bind:value={url}
				on:blur={handleUrlBlur}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="https://example.com"
				required
			/>
			<p class="mt-1 text-xs text-gray-500">
				{#if type === RESOURCE_TYPES.LINK}
					Enter a web URL (https:// will be added automatically if needed)
				{/if}
			</p>
		</div>

		<div class="form-control">
			<label for="resource-description" class="mb-1 block text-sm font-medium text-gray-700">
				Description (optional)
			</label>
			<textarea
				id="resource-description"
				bind:value={description}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows="3"
				placeholder="Describe what this resource contains or why it's useful"
			></textarea>
		</div>

		<div class="flex justify-end space-x-3 mt-6">
			{#if initialResource}
				<button
					type="button"
					on:click={handleCancel}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					disabled={isSubmitting}
				>
					Cancel
				</button>
			{/if}
			<button
				type="submit"
				class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				disabled={isSubmitting}
			>
				{isSubmitting
					? initialResource
						? 'Updating...'
						: 'Adding...'
					: initialResource
						? 'Update Resource'
						: 'Add Resource'}
			</button>
		</div>
	</form>
</div>