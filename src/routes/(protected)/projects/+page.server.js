import { redirect } from '@sveltejs/kit';

export function load() {
	// NOTE: You would typically check authentication here
	// For the prototype, we're not implementing actual auth checks
	// const session = await locals.getSession();
	// if (!session) {
	//   throw redirect(303, '/login');
	// }

	// In a real application, we would fetch projects from a database
	// For now, we're using mock data in the client component

	// Return empty data object - client handles mock data
	return {};
}
