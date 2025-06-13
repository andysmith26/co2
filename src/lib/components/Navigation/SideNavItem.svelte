<!-- src/lib/components/Navigation/SideNavItem.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import type { SideNavItemProps } from '$lib/types/navigation.js';

	// Destructure props using Svelte 5 syntax
	const { item, isCollapsed, onClick }: SideNavItemProps = $props();

	// Reactive computation to check if this route is active
	const isActive = $derived(() => {
		const currentPath = page.url.pathname;

		// Exact match for home page
		if (item.href === '/') {
			return currentPath === '/';
		}

		// For other routes, check if current path starts with item href
		// But avoid false positives (e.g., /project shouldn't match /projects)
		return currentPath === item.href || currentPath.startsWith(item.href + '/');
	});

	// Handle click events
	function handleClick() {
		onClick?.();
	}

	// Handle keyboard navigation for accessibility
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<a
	href={item.href}
	class="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 {isActive()
		? 'preset-filled-primary'
		: 'text-surface-700-300 hover:preset-tonal hover:text-surface-900-100'}"
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeydown}
	aria-label={item.label}
	aria-current={isActive() ? 'page' : undefined}
>
	<!-- Icon container with consistent sizing -->
	<div class="flex h-5 w-5 flex-shrink-0 items-center justify-center">
		<i
			class="{item.icon} {isActive()
				? ''
				: 'text-surface-600-400 group-hover:text-surface-900-100'}"
			aria-hidden="true"
		></i>
	</div>

	<!-- Label with conditional display based on sidebar state -->
	{#if !isCollapsed}
		<span class="ml-3 transition-opacity duration-200">
			{item.label}
		</span>
	{/if}

	<!-- Tooltip for collapsed state -->
	{#if isCollapsed}
		<div class="absolute left-16 z-50 hidden group-hover:block">
			<div class="bg-surface-900-100 text-surface-100-900 rounded px-2 py-1 text-xs shadow-lg">
				{item.label}
				<div
					class="bg-surface-900-100 absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45"
				></div>
			</div>
		</div>
	{/if}
</a>
