/**
 * Parameter matcher for learning path IDs
 * Ensures pathId is a valid alphanumeric slug
 */
export function match(param) {
	// Allow alphanumeric with hyphens and underscores (slug format)
	return /^[a-zA-Z0-9-_]+$/.test(param);
}
