<!-- src/lib/components/Resources/ResourceForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { RESOURCE_TYPES } from '$lib/constants';
	import type { Resource, Group } from '$lib/types';
	import ImageUploadWidget from './ImageUploadWidget.svelte';
	import type { CloudinaryUploadResult } from '$lib/utils/cloudinary';

	// Props
	interface Props {
		groups: Group[];
		initialResource?: Resource | null;
	}

	let { groups, initialResource = null }: Props = $props();

	// State
	let type: string = $state(initialResource?.type || RESOURCE_TYPES.LINK);
	let title: string = $state(initialResource?.title || '');
	let description: string = $state(initialResource?.description || '');
	let url: string = $state(initialResource?.url || '');
	let groupId: string = $state(initialResource?.group_id || '');
	let error: string | null = $state(null);
	let isSubmitting: boolean = $state(false);

	// Image upload specific state
	let uploadedImageUrl: string | null = $state(null);
	let hasImageUpload: boolean = $state(false);

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
			uploadedImageUrl = null;
			hasImageUpload = false;
		} else {
			type = RESOURCE_TYPES.LINK;
			title = '';
			description = '';
			url = '';
			groupId = '';
			uploadedImageUrl = null;
			hasImageUpload = false;
		}
	});

	// Watch type changes to reset form state appropriately
	$effect(() => {
		if (type === RESOURCE_TYPES.IMAGE) {
			// Clear URL when switching to image type
			if (!initialResource) {
				url = '';
			}
		} else if (type === RESOURCE_TYPES.LINK) {
			// Clear uploaded image when switching to link type
			uploadedImageUrl = null;
			hasImageUpload = false;
		}
	});

	// Computed values
	const isImageType = $derived(type === RESOURCE_TYPES.IMAGE);
	const currentImageUrl = $derived(
		isImageType ? uploadedImageUrl || initialResource?.url || null : null
	);

	// Methods
	function validateForm() {
		error = null;

		if (!title.trim()) {
			error = 'Resource title is required';
			return false;
		}

		if (type === RESOURCE_TYPES.LINK) {
			if (!url.trim()) {
				error = 'Resource URL is required';
				return false;
			}

			// Basic URL validation for LINK type
			try {
				new URL(url);
			} catch {
				error = 'Please enter a valid URL (e.g., https://example.com)';
				return false;
			}
		} else if (type === RESOURCE_TYPES.IMAGE) {
			// For new image resources, require an upload
			if (!initialResource && !uploadedImageUrl) {
				error = 'Please upload an image';
				return false;
			}
			// For existing image resources, either keep current or have new upload
			if (initialResource && !initialResource.url && !uploadedImageUrl) {
				error = 'Please upload an image';
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
			// For image resources, use the uploaded image URL or keep existing
			const finalUrl = isImageType ? uploadedImageUrl || initialResource?.url || '' : url;

			console.log('🔄 ResourceForm SUBMIT:', {
				resourceId: initialResource?.id,
				type,
				title,
				url: finalUrl,
				description,
				group_id: groupId,
			});

			await dispatch('submit', {
				resourceId: initialResource?.id,
				type,
				title,
				url: finalUrl,
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
				uploadedImageUrl = null;
				hasImageUpload = false;
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

	// Auto-format URL for links
	function handleUrlBlur() {
		if (url && type === RESOURCE_TYPES.LINK) {
			// Auto-add https:// if no protocol is specified
			if (!url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}
		}
	}

	// Handle image upload
	function handleImageUpload(event: CustomEvent<CloudinaryUploadResult>) {
		const result = event.detail;
		uploadedImageUrl = result.secure_url;
		hasImageUpload = true;
		error = null;

		// Auto-generate title from filename if title is empty
		if (!title.trim()) {
			// Extract filename from public_id
			const parts = result.public_id.split('/');
			const filename = parts[parts.length - 1];
			title = filename.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
		}
	}

	function handleImageUploadError(event: CustomEvent<string>) {
		error = event.detail;
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
					<option value={RESOURCE_TYPES.IMAGE}>Image</option>
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
					Global resources are visible to all users. Group resources are only visible to group
					members.
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
				placeholder={isImageType
					? 'Enter image title (auto-generated from filename)'
					: 'Enter resource title'}
				required
			/>
		</div>

		<!-- Conditional URL field for links or Image upload for images -->
		{#if isImageType}
			<div class="form-control">
				<label class="mb-1 block text-sm font-medium text-gray-700"> Image Upload </label>
				<ImageUploadWidget
					{currentImageUrl}
					buttonText={initialResource ? 'Replace Image' : 'Upload Image'}
					on:upload={handleImageUpload}
					on:error={handleImageUploadError}
				/>
				{#if hasImageUpload || currentImageUrl}
					<p class="mt-2 text-xs text-green-600">
						✓ {hasImageUpload ? 'New image uploaded successfully' : 'Current image will be used'}
					</p>
				{/if}
			</div>
		{:else}
			<div class="form-control">
				<label for="resource-url" class="mb-1 block text-sm font-medium text-gray-700"> URL </label>
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
					Enter a web URL (https:// will be added automatically if needed)
				</p>
			</div>
		{/if}

		<div class="form-control">
			<label for="resource-description" class="mb-1 block text-sm font-medium text-gray-700">
				Description (optional)
			</label>
			<textarea
				id="resource-description"
				bind:value={description}
				class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows="3"
				placeholder={isImageType
					? 'Describe what this image shows or how it should be used'
					: "Describe what this resource contains or why it's useful"}
			></textarea>
		</div>

		<div class="mt-6 flex justify-end space-x-3">
			{#if initialResource}
				<button
					type="button"
					on:click={handleCancel}
					class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					disabled={isSubmitting}
				>
					Cancel
				</button>
			{/if}
			<button
				type="submit"
				class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
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
