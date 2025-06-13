<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { navigationStore } from '$lib/stores/navigation.svelte.js';
	import { createMobileListener } from '$lib/utils/navigation.js';
	import Sidebar from '$lib/components/Navigation/Sidebar.svelte';
	import MobileNav from '$lib/components/Navigation/MobileNav.svelte';

	// Props from layout data
	let { data } = $props();
	let { supabase, session, user } = $derived(data);

	// Admin status state
	let isAdmin = $state(false);

	// Reactive values for authentication
	const isLoggedIn = $derived(!!session);
	const userEmail = $derived(user?.email || '');

	// Update active route when page changes
	$effect(() => {
		navigationStore.setActiveRoute(page.url.pathname);
	});

	// Check admin status
	async function checkAdminStatus() {
		if (!session) {
			isAdmin = false;
			return;
		}

		try {
			const response = await fetch('/api/test-admin');
			const data = await response.json();
			isAdmin = data.admin === true;
		} catch (err) {
			console.error('Failed to check admin status:', err);
			isAdmin = false;
		}
	}

	// Setup mobile detection and admin check
	onMount(() => {
		// Setup responsive behavior
		const cleanupMobileListener = createMobileListener((isMobile) => {
			navigationStore.setMobile(isMobile);
		});

		// Setup auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Check admin status after mount
		if (session) {
			setTimeout(checkAdminStatus, 100);
		}

		// Cleanup function
		return () => {
			cleanupMobileListener();
			subscription.unsubscribe();
		};
	});

	// Re-check admin status when session changes
	$effect(() => {
		if (session) {
			setTimeout(checkAdminStatus, 100);
		} else {
			isAdmin = false;
		}
	});

	// Derived values for layout
	const mobile = $derived(navigationStore.mobile);
	const expanded = $derived(navigationStore.expanded);
	const sidebarWidth = $derived(mobile ? 0 : expanded ? 256 : 64); // 16rem = 256px, 4rem = 64px
</script>

<!-- Main application container using CSS Grid for layout -->
<div class="bg-surface-50-950 relative min-h-screen">
	<!-- Mobile Navigation Header -->
	<MobileNav {isLoggedIn} {userEmail} />

	<!-- Desktop Sidebar -->
	<Sidebar {isLoggedIn} {isAdmin} {userEmail} />

	<!-- Main Content Area -->
	<main
		class="transition-all duration-200 {mobile
			? 'ml-0'
			: expanded
				? 'ml-64'
				: 'ml-16'} flex min-h-screen flex-col"
		style="padding-top: {mobile ? '4rem' : '0'}"
	>
		<!-- Toggle Button for Desktop -->
		{#if !mobile}
			<div class="sticky top-4 z-20 mt-4 ml-4">
				<button
					class="preset-tonal hover:preset-filled flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200"
					onclick={() => navigationStore.toggle()}
					aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
					title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
				>
					<i
						class="fas fa-{expanded ? 'angle-left' : 'angle-right'} text-surface-700-300"
						aria-hidden="true"
					></i>
				</button>
			</div>
		{/if}

		<!-- Page Content -->
		<div class="flex-1 p-6">
			<slot />
		</div>
	</main>
</div>
