import { writable } from 'svelte/store';

// Hard-coded sections data for the p5.js conditional statements tutorial
const sections = [
	{
		id: 1,
		title: 'Introduction',
		startTime: '00:00',
		endTime: '01:43',
		description: 'Introduction to conditional statements in p5.js'
	},
	{
		id: 2,
		title: 'Boolean Expressions',
		startTime: '01:43',
		endTime: '03:14',
		description: 'Understanding true/false expressions'
	},
	{
		id: 3,
		title: 'Relational Operators',
		startTime: '03:14',
		endTime: '03:45',
		description: 'Comparing values with operators'
	},
	{
		id: 4,
		title: 'If Statements',
		startTime: '03:45',
		endTime: '06:30',
		description: 'Syntax and usage of if statements'
	},
	{
		id: 5,
		title: 'Code Example',
		startTime: '06:30',
		endTime: '07:12',
		description: 'Practical example with a changing circle'
	},
	{
		id: 6,
		title: 'Code Indentation',
		startTime: '07:12',
		endTime: '10:00',
		description: 'Using indentation to improve code readability'
	},
	{
		id: 7,
		title: 'Other Operators',
		startTime: '10:00',
		endTime: '11:29',
		description: 'Additional relational operators and conclusion'
	}
];

// Create the store with initial values
export const videoData = writable({
	videoId: '1Osb_iGDdjk',
	title: 'Introduction to Conditional Statements - p5.js Tutorial',
	sections
});

// Current section
export const currentSectionIndex = writable(0);
