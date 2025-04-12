import { writable } from 'svelte/store';

// Initial empty state
const initialPathsState = {
	paths: [],
	currentPath: null,
	loading: false,
	error: null
};

function createLearningPathStore() {
	const { subscribe, set, update } = writable(initialPathsState);

	return {
		subscribe,
		// Fetch learning paths (mock implementation)
		fetchPaths: async () => {
			update((state) => ({ ...state, loading: true }));

			try {
				// In a real app, this would be an API call
				// For now, we'll simulate with a timeout and mock data
				await new Promise((resolve) => setTimeout(resolve, 500));

				const mockPaths = [
					{
						id: 'web-dev',
						title: 'Web Development',
						description: 'Learn modern web development techniques',
						progress: 35,
						modules: [
							{
								id: 'html-basics',
								title: 'HTML Basics',
								type: 'video',
								completed: true
							},
							{
								id: 'css-styling',
								title: 'CSS Styling',
								type: 'video',
								completed: true
							},
							{
								id: 'js-intro',
								title: 'JavaScript Introduction',
								type: 'video',
								completed: false
							}
						]
					},
					{
						id: 'data-science',
						title: 'Data Science Fundamentals',
						description: 'Explore data analysis and machine learning',
						progress: 15,
						modules: [
							{
								id: 'python-basics',
								title: 'Python Basics',
								type: 'video',
								completed: true
							},
							{
								id: 'data-analysis',
								title: 'Data Analysis with Pandas',
								type: 'video',
								completed: false
							}
						]
					}
				];

				update((state) => ({
					...state,
					paths: mockPaths,
					loading: false,
					error: null
				}));
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: 'Failed to fetch learning paths'
				}));
			}
		},

		// Set current learning path
		setCurrentPath: (pathId) => {
			update((state) => {
				const currentPath = state.paths.find((p) => p.id === pathId) || null;
				return { ...state, currentPath };
			});
		},

		// Reset store
		reset: () => {
			set(initialPathsState);
		}
	};
}

export const learningPaths = createLearningPathStore();
