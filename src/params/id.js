/**
 * Parameter matcher for video IDs
 * Ensures video ID is numeric or a valid format
 */
export function match(param) {
	// Allow numeric IDs or alphanumeric IDs with optional hyphens
	return /^[a-zA-Z0-9-_]+$/.test(param);
}
