// src/lib/constants/navigation.ts
import type { NavigationMenu } from '$lib/types/navigation.js';

/**
 * Responsive breakpoint for mobile detection
 * Matches Tailwind's 'lg' breakpoint (1024px)
 */
export const MOBILE_BREAKPOINT = 1024;

/**
 * Navigation menu structure with all available routes
 * Organized by access level for easy filtering
 */
export const NAVIGATION_MENU: NavigationMenu = {
	public: [
		{
			href: '/',
			label: 'Home',
			icon: 'fas fa-home',
			requiresAuth: false,
			adminOnly: false,
			group: 'public'
		},
		{
			href: '/learn',
			label: 'Learning',
			icon: 'fas fa-graduation-cap',
			requiresAuth: false,
			adminOnly: false,
			group: 'public'
		},
		{
			href: '/login',
			label: 'Sign In',
			icon: 'fas fa-sign-in-alt',
			requiresAuth: false,
			adminOnly: false,
			group: 'public'
		}
	],
	user: [
		{
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'fas fa-tachometer-alt',
			requiresAuth: true,
			adminOnly: false,
			group: 'user'
		},
		{
			href: '/projects',
			label: 'Projects',
			icon: 'fas fa-folder-open',
			requiresAuth: true,
			adminOnly: false,
			group: 'user'
		},
		{
			href: '/groups',
			label: 'Groups',
			icon: 'fas fa-users',
			requiresAuth: true,
			adminOnly: false,
			group: 'user'
		},
		{
			href: '/students',
			label: 'Students',
			icon: 'fas fa-user-graduate',
			requiresAuth: true,
			adminOnly: false,
			group: 'user'
		},
        		{
			href: '/resources',
			label: 'Resources',
			icon: 'fas fa-book',
			requiresAuth: true,
			adminOnly: false,
			group: 'user'
		},
		{
			href: '/profile',
			label: 'Profile',
			icon: 'fas fa-user',
			requiresAuth: true,
			adminOnly: false,
			group: 'user'
		}
	],
	admin: [
		{
			href: '/admin',
			label: 'Admin Panel',
			icon: 'fas fa-cog',
			requiresAuth: true,
			adminOnly: true,
			group: 'admin'
		}
	]
};

/**
 * Animation duration constants for consistency
 */
export const ANIMATION_DURATION = {
	sidebar: 200,
	drawer: 300,
	fade: 150
} as const;