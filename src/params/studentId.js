/**
 * Parameter matcher for student IDs
 * Ensures the studentId is a valid UUID format
 */
export function match(param) {
	// UUID format validation regex
	const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidPattern.test(param);
}
