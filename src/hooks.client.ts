import type { HandleClientError } from '@sveltejs/kit';

// Client-side error handling hook
export const handleError: HandleClientError = ({ error, event }) => {
	console.error('Client-side error:', error);
	
	// You could add analytics tracking here
	// Example: trackError(error, event.url.pathname);
	
	// Return a user-friendly error for the UI
	return {
		message: 'An unexpected error occurred',
		code: (error as any)?.code || 'UNKNOWN'
	};
};