<!-- src/lib/components/Navigation/MobileNav.svelte -->
<script lang="ts">
	import { navigationStore } from '$lib/stores/navigation.svelte.js';
	import type { SidebarProps } from '$lib/types/navigation.js';

	// Props destructuring with defaults
	const { isLoggedIn, userEmail = '' }: Pick<SidebarProps, 'isLoggedIn' | 'userEmail'> = $props();

	// Reactive store access
	const expanded = $derived(navigationStore.expanded);
	const mobile = $derived(navigationStore.mobile);

	// Toggle drawer state
	function toggleDrawer() {
		navigationStore.toggle();
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleDrawer();
		}
	}
</script>

<!-- Mobile top navigation - only visible on small screens -->
<header
	class="border-surface-300-600 bg-surface-50-950 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:hidden"
	aria-label="Mobile navigation"
>
	<!-- Left side: Hamburger menu and logo -->
	<div class="flex items-center space-x-3">
		<!-- Hamburger menu button -->
		<button
			class="hover:preset-tonal flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200"
			onclick={toggleDrawer}
			onkeydown={handleKeydown}
			aria-expanded={expanded}
			aria-controls="mobile-navigation-drawer"
			aria-label={expanded ? 'Close navigation menu' : 'Open navigation menu'}
		>
			<!-- Animated hamburger icon -->
			<div class="relative h-5 w-5">
				<span
					class="bg-surface-900-100 absolute top-1 left-0 h-0.5 w-5 transition-all duration-200 {expanded
						? 'translate-y-1.5 rotate-45'
						: ''}"
				></span>
				<span
					class="bg-surface-900-100 absolute top-2.5 left-0 h-0.5 w-5 transition-all duration-200 {expanded
						? 'opacity-0'
						: ''}"
				></span>
				<span
					class="bg-surface-900-100 absolute top-4 left-0 h-0.5 w-5 transition-all duration-200 {expanded
						? '-translate-y-1.5 -rotate-45'
						: ''}"
				></span>
			</div>
		</button>

		<!-- Mobile logo -->
		<div class="flex items-center">
			<div class="preset-filled-primary flex h-8 w-8 items-center justify-center rounded-lg">
				<i class="fas fa-atom text-sm text-white" aria-hidden="true"></i>
			</div>
			<span class="text-surface-900-100 ml-2 text-lg font-semibold"> CO₂ Platform </span>
		</div>
	</div>

	<!-- Right side: User info and actions -->
	<div class="flex items-center space-x-3">
		{#if isLoggedIn}
			<!-- User avatar -->
			<div class="flex items-center space-x-2">
				<div class="preset-filled-secondary flex h-8 w-8 items-center justify-center rounded-full">
					<i class="fas fa-user text-xs text-white" aria-hidden="true"></i>
				</div>
				<span class="text-surface-900-100 hidden max-w-32 truncate text-sm font-medium sm:block">
					{userEmail}
				</span>
			</div>
		{:else}
			<!-- Login button for non-authenticated users -->
			<a href="/login" class="btn preset-filled-primary px-4 py-2 text-sm"> Sign In </a>
		{/if}
	</div>
</header>
