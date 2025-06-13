// src/lib/utils/navigation.ts
import type { NavItem } from '$lib/types/navigation.js';
import { NAVIGATION_MENU, MOBILE_BREAKPOINT } from '$lib/constants/navigation.js';

/**
 * Filter navigation items based on authentication and admin status
 */
export function getVisibleNavItems(isLoggedIn: boolean, isAdmin: boolean): NavItem[] {
	const items: NavItem[] = [];

	// Add public items, but filter login based on auth status
	const publicItems = NAVIGATION_MENU.public.filter(item => {
		// Show login only when not logged in
		if (item.href === '/login') {
			return !isLoggedIn;
		}
		// Show other public items always
		return true;
	});
	items.push(...publicItems);

	// Include user items if logged in
	if (isLoggedIn) {
		items.push(...NAVIGATION_MENU.user);
	}

	// Include admin items if user is admin
	if (isAdmin) {
		items.push(...NAVIGATION_MENU.admin);
	}

	return items;
}

/**
 * Check if current window size is mobile
 */
export function isMobileViewport(): boolean {
	if (typeof window === 'undefined') return false;
	return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Create a media query listener for responsive behavior
 */
export function createMobileListener(callback: (isMobile: boolean) => void): () => void {
	if (typeof window === 'undefined') {
		return () => {}; // No-op for SSR
	}

	const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
	
	// Initial call
	callback(mediaQuery.matches);
	
	// Add listener
	const handler = (e: MediaQueryListEvent) => callback(e.matches);
	mediaQuery.addEventListener('change', handler);
	
	// Return cleanup function
	return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Determine if a route is active
 */
export function isRouteActive(currentPath: string, itemPath: string): boolean {
	// Exact match for home page
	if (itemPath === '/') {
		return currentPath === '/';
	}
	
	// Prefix match for other routes
	return currentPath.startsWith(itemPath);
}

/**
 * Get navigation group for a specific route
 */
export function getRouteGroup(href: string): 'public' | 'user' | 'admin' | null {
	const allItems = [
		...NAVIGATION_MENU.public,
		...NAVIGATION_MENU.user,
		...NAVIGATION_MENU.admin
	];
	
	const item = allItems.find(item => item.href === href);
	return item?.group || null;
}