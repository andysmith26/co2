<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

<!-- src/lib/components/Resources/ResourceList.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Resource } from '../../types';
	import { RESOURCE_TYPES } from '../../constants';

	// Props
	const { resources = [], loading = false } = $props<{
		resources: Resource[];
		loading?: boolean;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	// Local state
	let editingResourceId = $state<string | null>(null);
	let searchQuery = $state('');

	// Filter resources based on search query
	const filteredResources = $derived(
		resources.filter(
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
	function handleEdit(resource: Resource) {
		editingResourceId = resource.id;
		dispatch('edit', resource);
	}

	function handleDelete(resource: Resource) {
		if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
			dispatch('delete', { resourceId: resource.id });
		}
	}

	function handleCopy(url: string, title: string) {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				// Could add a toast notification here
				console.log(`Copied ${title} URL to clipboard`);
			})
			.catch(() => {
				console.error('Failed to copy URL to clipboard');
			});
	}
</script>

<div class="resource-list">
	<!-- Search Bar -->
	{#if resources.length > 0}
		<div class="mb-4">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search resources..."
					class="w-full rounded-md border px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
				/>
				<span class="absolute top-2.5 right-3 text-gray-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</span>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if filteredResources.length === 0}
		<div class="rounded-lg bg-gray-50 py-12 text-center">
			<div class="mb-4 text-4xl">🔗</div>
			<h3 class="mb-2 text-lg font-medium text-gray-700">
				{resources.length > 0 ? 'No Resources Found' : 'No Resources Yet'}
			</h3>
			<p class="text-gray-500">
				{resources.length > 0
					? 'Try a different search term.'
					: 'Add your first resource to help students access important links and materials.'}
			</p>
		</div>
	{:else}
		<!-- Resources List -->
		<div class="space-y-4">
			{#each filteredResources as resource (resource.id)}
				<div
					class="resource-item rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex items-start justify-between">
						<!-- Resource Content -->
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex items-center gap-2">
								<span class="text-lg" title={resource.type}>
									{getResourceIcon(resource.type)}
								</span>
								<h4 class="truncate text-lg font-medium text-gray-900">
									{resource.title}
								</h4>
								<span
									class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
								>
									{resource.type}
								</span>
							</div>

							{#if resource.description}
								<p class="mb-3 line-clamp-2 text-gray-600">
									{resource.description}
								</p>
							{/if}

							<div class="flex items-center gap-4 text-sm text-gray-500">
								<button
									on:click={() => openResource(resource.url)}
									class="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800"
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
										class="h-4 w-4"
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

								<span class="flex items-center gap-1">
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
											d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z"
										/>
									</svg>
									{formatDate(resource.created_at)}
								</span>

								{#if resource.creator}
									<span class="flex items-center gap-1">
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
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										{resource.creator.first_name}
										{resource.creator.last_name}
									</span>
								{/if}
							</div>
						</div>

						<!-- Actions -->
						<div class="ml-4 flex items-center gap-2">
							<button
								on:click={() => handleEdit(resource)}
								class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
								title="Edit resource"
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
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>

							<button
								on:click={() => handleDelete(resource)}
								class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
								title="Delete resource"
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
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Resources Summary -->
		{#if resources.length > 0}
			<div class="mt-6 text-center text-sm text-gray-500">
				Showing {filteredResources.length} of {resources.length} resources
			</div>
		{/if}
	{/if}
</div>
