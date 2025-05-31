<!-- src/lib/components/Projects/ProjectsHeader.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	const {
		projectCount = 0,
		taskCount = 0,
		loading = false,
	} = $props<{
		projectCount?: number;
		taskCount?: number;
		loading?: boolean;
	}>();

	// Events
	const dispatch = createEventDispatcher();

	function handleRefresh() {
		dispatch('refresh');
	}
</script>

<header class="mb-4 flex flex-wrap items-center justify-between gap-2">
	<div>
		<h2 class="text-2xl font-bold text-gray-900">Projects</h2>
		<p class="text-sm text-gray-500">
			{projectCount} Project{projectCount !== 1 ? 's' : ''} • {taskCount} Task{taskCount !== 1
				? 's'
				: ''}
		</p>
	</div>

	<!-- Manual Refresh Button -->
	<button
		on:click={handleRefresh}
		class="btn btn-sm btn-circle btn-ghost"
		title="Refresh projects"
		aria-label="Refresh projects"
		disabled={loading}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5 {loading ? 'animate-spin' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
			/>
		</svg>
	</button>
</header>
