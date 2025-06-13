<!-- src/lib/components/Navigation/Sidebar.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { navigationStore } from '$lib/stores/navigation.svelte.js';
	import { getVisibleNavItems } from '$lib/utils/navigation.js';
	import SideNavItem from './SideNavItem.svelte';
	import type { SidebarProps } from '$lib/types/navigation.js';

	// Props with destructuring and defaults
	const { isLoggedIn, isAdmin, userEmail = '' }: SidebarProps = $props();

	// Get visible navigation items based on auth status
	const navItems = $derived(getVisibleNavItems(isLoggedIn, isAdmin));

	// Access navigation state
	const expanded = $derived(navigationStore.expanded);
	const mobile = $derived(navigationStore.mobile);

	// Close drawer on mobile when nav item is clicked
	function handleNavItemClick() {
		if (mobile) {
			navigationStore.closeDrawer();
		}
	}
</script>

<!-- Semantic aside element for accessibility -->
<aside
	class="bg-surface-50-950 border-surface-300-600 fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 {mobile
		? expanded
			? 'w-64 translate-x-0'
			: 'w-64 -translate-x-full'
		: expanded
			? 'w-64'
			: 'w-16'}"
	aria-label="Main navigation"
>
	<!-- Header Section -->
	<div class="border-surface-300-600 flex h-16 items-center border-b px-4">
		{#if expanded}
			<div class="flex items-center">
				<div class="preset-filled-primary flex h-8 w-8 items-center justify-center rounded-lg">
					<i class="fas fa-atom text-sm text-white" aria-hidden="true"></i>
				</div>
				<span class="text-surface-900-100 ml-3 text-lg font-semibold"> CO2 Platform </span>
			</div>
		{:else}
			<div class="flex w-full justify-center">
				<div class="preset-filled-primary flex h-8 w-8 items-center justify-center rounded-lg">
					<i class="fas fa-atom text-sm text-white" aria-hidden="true"></i>
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation Section -->
	<nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">
		{#each navItems as item (item.href)}
			<SideNavItem {item} isCollapsed={!expanded} onClick={handleNavItemClick} />
		{/each}
	</nav>

	<!-- User Section -->
	{#if isLoggedIn}
		<div class="border-surface-300-600 border-t p-4">
			{#if expanded}
				<div class="mb-3 flex items-center">
					<div
						class="preset-filled-secondary flex h-8 w-8 items-center justify-center rounded-full"
					>
						<i class="fas fa-user text-sm text-white" aria-hidden="true"></i>
					</div>
					<div class="ml-3 min-w-0 flex-1">
						<p class="text-surface-900-100 truncate text-sm font-medium">
							{userEmail}
						</p>
					</div>
				</div>

				<!-- Enhanced sign out form -->
				<form action="/signout" method="POST" use:enhance class="w-full">
					<button
						type="submit"
						class="text-surface-700-300 hover:preset-tonal hover:text-surface-900-100 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
					>
						<i class="fas fa-sign-out-alt text-surface-600-400" aria-hidden="true"></i>
						<span class="ml-3">Sign Out</span>
					</button>
				</form>
			{:else}
				<!-- Collapsed user section -->
				<div class="flex justify-center">
					<form action="/signout" method="POST" use:enhance>
						<button
							type="submit"
							class="hover:preset-tonal flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
							title="Sign Out"
							aria-label="Sign Out"
						>
							<i class="fas fa-sign-out-alt text-surface-600-400" aria-hidden="true"></i>
						</button>
					</form>
				</div>
			{/if}
		</div>
	{/if}
</aside>

<!-- Mobile overlay -->
{#if mobile && expanded}
	<div
		class="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity duration-200"
		onclick={() => navigationStore.closeDrawer()}
		onkeydown={(e) => e.key === 'Escape' && navigationStore.closeDrawer()}
		role="button"
		tabindex="0"
		aria-label="Close navigation"
	></div>
{/if}
