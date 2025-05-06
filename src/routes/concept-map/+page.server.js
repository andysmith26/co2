import { redirect } from '@sveltejs/kit';
import { FEATURES } from '$lib/constants';

export function load() {
	// If the concept mapping feature is disabled, redirect to the homepage
	if (!FEATURES.CONCEPT_MAPPING) {
		redirect(307, '/');
	}

	// Return empty data object
	return {};
}
