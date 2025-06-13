// src/lib/stores/navigation.svelte.ts
import { browser } from '$app/environment';

/**
 * Navigation state interface - defines the shape of our navigation state
 */
interface NavigationState {
	expanded: boolean;
	mobile: boolean;
	activeRoute: string;
}

/**
 * Create navigation state with Svelte 5 runes
 * Using $state() creates reactive state that automatically triggers updates
 */
function createNavigationStore() {
	// Initialize with defaults - expanded by default, detect mobile, no active route yet
	const state = $state<NavigationState>({
		expanded: true,
		mobile: false,
		activeRoute: ''
	});

	// Load saved preferences from localStorage on browser load
	if (browser) {
		const saved = localStorage.getItem('nav-expanded');
		if (saved !== null) {
			state.expanded = JSON.parse(saved);
		}
	}

	return {
		// Expose current state as derived values (read-only access)
		get expanded() { return state.expanded; },
		get mobile() { return state.mobile; },
		get activeRoute() { return state.activeRoute; },

		// Actions to modify state
		toggle() {
			state.expanded = !state.expanded;
			if (browser) {
				localStorage.setItem('nav-expanded', JSON.stringify(state.expanded));
			}
		},

		setExpanded(expanded: boolean) {
			state.expanded = expanded;
			if (browser) {
				localStorage.setItem('nav-expanded', JSON.stringify(expanded));
			}
		},

		setMobile(mobile: boolean) {
			state.mobile = mobile;
			// Auto-collapse on mobile for better UX
			if (mobile && state.expanded) {
				state.expanded = false;
			}
		},

		setActiveRoute(route: string) {
			state.activeRoute = route;
		},

		// Mobile-specific actions
		openDrawer() {
			if (state.mobile) {
				state.expanded = true;
			}
		},

		closeDrawer() {
			if (state.mobile) {
				state.expanded = false;
			}
		}
	};
}

// Export singleton instance
export const navigationStore = createNavigationStore();