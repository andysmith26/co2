<!-- src/lib/components/Tasks/TaskBadge.svelte -->
<script lang="ts">
  import { TASK_STATUS } from "$lib/constants";
  import type { Task } from "$lib/types";

  // Props
  const { task, compact = true } = $props<{
    task: Task;
    compact?: boolean;
  }>();

  // Get appropriate status color
  function getStatusColor(status: string): string {
    switch (status) {
      case TASK_STATUS.TODO:
        return "bg-gray-100 text-gray-800";
      case TASK_STATUS.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TASK_STATUS.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
</script>

<div class="task-badge flex items-center gap-2">
  <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
    {task.status}
  </span>
  <span class="text-sm font-medium truncate" title={task.title}>
    {task.title}
  </span>
  {#if !compact && task.assignee}
    <span class="text-xs text-gray-500 ml-auto">
      {task.assignee.first_name} {task.assignee.last_initial || ''}
    </span>
  {/if}
  {#if !compact}
    <span class="text-xs text-gray-400 ml-auto">
      {formatDate(task.updated_at)}
    </span>
  {/if}
</div>
