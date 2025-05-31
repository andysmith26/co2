<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

<!-- src/lib/components/Resources/ProjectResourceLinker.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Resource } from '../../types';
	import { RESOURCE_TYPES } from '../../constants';

	// Props
	const {
		availableResources = [],
		linkedResources = [],
		loading = false,
		projectId = '',
	} = $props<{
		availableResources: Resource[];
		linkedResources: Resource[];
		loading?: boolean;
		projectId: string;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let searchQuery = $state('');
	let selectedResourceId = $state('');
	let showLinkForm = $state(false);

	// Filter available resources based on search
	const filteredAvailableResources = $derived(
		availableResources.filter(
			(resource) =>
				resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(resource.description &&
					resource.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
				resource.url.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Helper functions
	function getResourceIcon(type: string): string {
		switch (type) {
			case RESOURCE_TYPES.LINK:
				return '🔗';
			default:
				return '📄';
		}
	}

	function formatUrl(url: string): string {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
		} catch {
			return url;
		}
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	function openResource(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	// Event handlers
	function handleLinkResource() {
		if (!selectedResourceId) return;

		dispatch('link', {
			projectId,
			resourceId: selectedResourceId,
		});

		// Reset form
		selectedResourceId = '';
		showLinkForm = false;
		searchQuery = '';
	}

	function handleUnlinkResource(resourceId: string) {
		if (confirm('Are you sure you want to remove this resource from the project?')) {
			dispatch('unlink', {
				projectId,
				resourceId,
			});
		}
	}

	function handleCopy(url: string, title: string) {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				console.log(`Copied ${title} URL to clipboard`);
			})
			.catch(() => {
				console.error('Failed to copy URL to clipboard');
			});
	}
</script>

<div class="project-resource-linker">
	<!-- Header with Link Resource Button -->
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-lg font-medium">Project Resources</h3>

		{#if !showLinkForm && availableResources.length > 0}
			<button
				on:click={() => (showLinkForm = true)}
				class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
					/>
				</svg>
				Link Resource
			</button>
		{/if}
	</div>

	<!-- Link Resource Form -->
	{#if showLinkForm}
		<div class="mb-6 rounded-lg bg-gray-50 p-4">
			<h4 class="mb-3 font-medium">Link Existing Resource</h4>

			<!-- Search available resources -->
			<div class="mb-3">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search available resources..."
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				/>
			</div>

			<!-- Resource selection -->
			<div class="mb-4">
				<select
					bind:value={selectedResourceId}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value="">Select a resource to link...</option>
					{#each filteredAvailableResources as resource}
						<option value={resource.id}>
							{resource.title} - {formatUrl(resource.url)}
						</option>
					{/each}
				</select>
			</div>

			<!-- Actions -->
			<div class="flex justify-end space-x-2">
				<button
					on:click={() => {
						showLinkForm = false;
						selectedResourceId = '';
						searchQuery = '';
					}}
					class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					on:click={handleLinkResource}
					disabled={!selectedResourceId || loading}
					class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
				>
					{loading ? 'Linking...' : 'Link Resource'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Linked Resources List -->
	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if linkedResources.length === 0}
		<div class="rounded-lg bg-gray-50 py-8 text-center">
			<div class="mb-3 text-3xl">🔗</div>
			<h4 class="mb-2 text-lg font-medium text-gray-700">No Resources Linked</h4>
			<p class="mb-4 text-gray-500">
				{availableResources.length > 0
					? 'Link relevant resources to help students access important materials.'
					: 'Create resources in the main Resources area first, then link them to projects.'}
			</p>
			{#if availableResources.length === 0}
				<a href="/resources" class="text-indigo-600 hover:text-indigo-800"> Go to Resources → </a>
			{/if}
		</div>
	{:else}
		<div class="space-y-3">
			{#each linkedResources as resource (resource.id)}
				<div
					class="resource-item rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
				>
					<div class="flex items-start justify-between">
						<!-- Resource Content -->
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex items-center gap-2">
								<span class="text-base" title={resource.type}>
									{getResourceIcon(resource.type)}
								</span>
								<h5 class="truncate font-medium text-gray-900">
									{resource.title}
								</h5>
								<span
									class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
								>
									{resource.type}
								</span>
							</div>

							{#if resource.description}
								<p class="mb-2 line-clamp-1 text-sm text-gray-600">
									{resource.description}
								</p>
							{/if}

							<div class="flex items-center gap-3 text-sm text-gray-500">
								<button
									on:click={() => openResource(resource.url)}
									class="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
									{formatUrl(resource.url)}
								</button>

								<button
									on:click={() => handleCopy(resource.url, resource.title)}
									class="flex items-center gap-1 text-gray-500 hover:text-gray-700"
									title="Copy URL"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
									Copy
								</button>

								{#if resource.linked_at}
									<span class="flex items-center gap-1 text-xs">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
											/>
										</svg>
										Linked {formatDate(resource.linked_at)}
									</span>
								{/if}
							</div>
						</div>

						<!-- Unlink Action -->
						<div class="ml-4">
							<button
								on:click={() => handleUnlinkResource(resource.id)}
								class="rounded p-1 text-gray-400 hover:text-red-600"
								title="Remove from project"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
