/**
 * PARKED FEATURE: Concept Mapping Visualization
 *
 * This file contains data for the concept mapping visualization feature that is currently
 * on hold. It will be integrated in a future phase of development.
 *
 * Last updated: May 6, 2025
 */

// Enhanced concept map data for Big Idea 4: Computing Systems and Networks

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
	// ...existing code...
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
	// ...existing code...
];

// Connection types and their descriptions
export const connectionTypes = [
	{
		id: 'hierarchical',
		label: 'Hierarchical',
		description: 'One concept is a type/part of another concept',
	},
	// ...existing code...
];

// Type definitions for coloring/styling
export const nodeTypes = [
	{
		id: 'learning-objective',
		label: 'Learning Objective',
		color: '#3498db', // Blue
		size: 24,
	},
	// ...existing code...
];
