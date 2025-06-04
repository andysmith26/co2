<!-- src/lib/components/Projects/AnnouncementsSidebar.svelte -->
<script lang="ts">
	// Text size control
	let textSize = $state(14); // Default font size in pixels
	const minSize = 10;
	const maxSize = 20;

	function increaseTextSize() {
		if (textSize < maxSize) {
			textSize += 1;
		}
	}

	function decreaseTextSize() {
		if (textSize > minSize) {
			textSize -= 1;
		}
	}

	// Hardcoded announcements for now - will be replaced with database content later
	const announcements = [
		{
			id: 1,
			title: "VR & Computers",
			content: "You may only login if you have signed up with Mr. Smith",
			date: "2025-01-01",
			priority: "info"
		},
		{
			id: 2,
			title: "Friendly Comp",
			content: "versus high school robots on Monday June 9",
			date: "2025-01-15",
			priority: "update"
		},
	];

	// Priority styles
	function getPriorityStyles(priority: string): string {
		switch (priority) {
			case 'urgent':
				return 'border-l-red-500 bg-red-50';
			case 'update':
				return 'border-l-blue-500 bg-blue-50';
			case 'tip':
				return 'border-l-green-500 bg-green-50';
			default:
				return 'border-l-gray-500 bg-gray-50';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="announcements-sidebar flex h-full flex-col bg-white border-r border-gray-200">
	<!-- Header with text size controls -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200">
		<h2 class="text-lg font-semibold text-gray-900">Announcements</h2>
		
		<!-- Text size controls -->
		<div class="flex items-center space-x-1">
			<button
				on:click={decreaseTextSize}
				disabled={textSize <= minSize}
				class="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				title="Decrease text size"
				aria-label="Decrease text size"
			>
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
				</svg>
			</button>
			<button
				on:click={increaseTextSize}
				disabled={textSize >= maxSize}
				class="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				title="Increase text size"
				aria-label="Increase text size"
			>
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Announcements content -->
	<div class="flex-1 overflow-y-auto p-4">
		<div class="space-y-4">
			{#each announcements as announcement (announcement.id)}
				<div class="rounded-lg border-l-4 p-3 {getPriorityStyles(announcement.priority)}">
					<div class="mb-2 flex items-start justify-between">
						<h3 class="font-medium text-gray-900" style="font-size: {textSize + 2}px;">
							{announcement.title}
						</h3>
						<span class="ml-2 text-xs text-gray-500 whitespace-nowrap">
							{formatDate(announcement.date)}
						</span>
					</div>
					<p 
						class="leading-relaxed text-gray-700"
						style="font-size: {textSize}px; line-height: {textSize * 1.5}px;"
					>
						{announcement.content}
					</p>
				</div>
			{/each}
		</div>

		<!-- Placeholder for when no announcements -->
		{#if announcements.length === 0}
			<div class="flex h-32 items-center justify-center text-center">
				<div>
					<div class="mb-2 text-2xl">📢</div>
					<p class="text-sm text-gray-500">No announcements at this time</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer hint for future functionality -->
	<div class="border-t border-gray-200 p-3">
		<p class="text-xs text-gray-400 text-center">
			More announcements coming soon
		</p>
	</div>
</div>
