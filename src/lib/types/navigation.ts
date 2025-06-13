// src/lib/types/navigation.ts

/**
 * Represents a single navigation item
 */
export interface NavItem {
	href: string;
	label: string;
	icon: string; // Font Awesome class name
	requiresAuth: boolean;
	adminOnly: boolean;
	group?: 'public' | 'user' | 'admin';
}

/**
 * Navigation menu structure
 */
export interface NavigationMenu {
	public: NavItem[];
	user: NavItem[];
	admin: NavItem[];
}

/**
 * Props for SideNavItem component
 */
export interface SideNavItemProps {
	item: NavItem;
	isActive: boolean;
	isCollapsed: boolean;
	onClick?: () => void;
}

/**
 * Props for Sidebar component
 */
export interface SidebarProps {
	isLoggedIn: boolean;
	isAdmin: boolean;
	userEmail?: string;
}

/**
 * Mobile navigation state
 */
export interface MobileNavState {
	isOpen: boolean;
	hasOverlay: boolean;
}