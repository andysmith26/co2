/**
 * Concept data for AP CSP Big Idea 4: Computing Systems and Networks
 */

export const conceptNodes = [
	// Learning Objectives
	{
		id: 'CSN-1.A',
		label: 'Network Basics',
		description: 'How computing devices work together in a network',
		bigIdea: 4,
		type: 'learning-objective',
		importance: 5,
	},
	{
		id: 'CSN-1.B',
		label: 'Internet Operation',
		description: 'How the Internet works',
		bigIdea: 4,
		type: 'learning-objective',
		importance: 5,
	},
	// ...more concept nodes...
];

// Initial starter connections between concepts
export const starterConnections = [
	// Learning Objective to Vocabulary connections
	{
		id: 'c1',
		source: 'CSN-1.A',
		target: 'computing-device',
		type: 'hierarchical',
		description: 'LO includes this concept',
		userCreated: false,
	},
	{
		id: 'c2',
		source: 'CSN-1.A',
		target: 'computing-system',
		type: 'hierarchical',
		description: 'LO includes this concept',
		userCreated: false,
	},
	// ...more connections...
];

// Connection types and their descriptions
export const connectionTypes = [
	{
		id: 'hierarchical',
		label: 'Hierarchical',
		description: 'One concept is a type/part of another concept',
	},
	{
		id: 'sequential',
		label: 'Sequential',
		description: 'One concept happens before another concept',
	},
	// ...more connection types...
];

// Type definitions for coloring/styling
export const nodeTypes = [
	{
		id: 'learning-objective',
		label: 'Learning Objective',
		color: '#3498db', // Blue
		size: 24,
	},
	{
		id: 'vocabulary',
		label: 'Vocabulary',
		color: '#e74c3c', // Red
		size: 18,
	},
	// ...more node types...
];
