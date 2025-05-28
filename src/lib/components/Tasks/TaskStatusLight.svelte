<style>
	.task-status-light {
		min-width: 12px;
		min-height: 12px;
	}
</style>

<!-- src/lib/components/Tasks/TaskStatusLight.svelte -->
<script lang="ts">
	import { getTaskStatusType, getTaskStatusColor } from '$lib/utils/taskHelpers';

	// Props
	const { status } = $props<{
		status: string;
	}>();

	// Get status type and color
	const statusType = $derived(getTaskStatusType(status));
	const statusColor = $derived(getTaskStatusColor(status));
</script>

<div class="task-status-light inline-flex items-center justify-center" title={status}>
	{#if statusType === 'completed'}
		<!-- Black checkmark for completed -->
		<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" style="color: {statusColor}">
			<path
				fill-rule="evenodd"
				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else}
		<!-- Colored circle for todo/in-progress -->
		<div class="h-2 w-2 rounded-full" style="background-color: {statusColor}"></div>
	{/if}
</div>
