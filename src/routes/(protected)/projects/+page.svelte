<script>
	// Mock project data - expanded to 24 projects
	const projects = $state([
		{
			id: '1',
			title: 'Field Controller',
			task: { title: 'capture minecraft coords and link up more buttons', assignee: 'albeno' },
		},
		{
			id: '2',
			title: 'Revive Old Monitor',
			task: { title: 'find pin mapping', assignee: 'alfafa' },
		},
		{
			id: '3',
			title: 'Robot Code Demos',
			task: { title: 'code another routine', assignee: 'campma' },
		},
		{
			id: '4',
			title: 'Bot H2',
			task: { title: 'finish chassis', assignee: 'chachu' },
		},
		{
			id: '5',
			title: 'Field Controller',
			task: { title: 'get set up in mcpi', assignee: 'charsa' },
		},
		{
			id: '6',
			title: 'Bot H3',
			task: { title: 'record & compile video', assignee: 'drebvi' },
		},
		{
			id: '7',
			title: 'Bot H4',
			task: { title: 'video demo of AI vision', assignee: 'fielmo' },
		},
		{
			id: '8',
			title: 'CatapultBot',
			task: { title: 'attach launcher', assignee: 'hauzch' },
		},
		{
			id: '9',
			title: 'CatapultBot',
			task: { title: 'finish chassis', assignee: 'helmow' },
		},
		{
			id: '10',
			title: 'Better 3d Printer',
			task: { title: 'list tasks and needs', assignee: 'lapeha' },
		},
		{
			id: '11',
			title: 'Character Animations',
			task: { title: 'try out p5 editor', assignee: 'mcfaas' },
		},
		{
			id: '12',
			title: 'CatapultBot',
			task: { title: 'start building intake?', assignee: 'mcmity' },
		},
		{
			id: '13',
			title: '...',
			task: { title: ' ', assignee: 'murpke' },
		},
		{
			id: '14',
			title: 'Drag Race Car',
			task: { title: 'build chassis', assignee: 'stephu' },
		},
		{
			id: '15',
			title: 'Self-Balancing Robot',
			task: { title: 'test new motors', assignee: 'smith' },
		},
	]);

	// Project filter
	let searchQuery = $state('');

	// Filter projects based on search query
	const filteredProjects = $derived(
		projects.filter((project) => project.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// We no longer need the status color function since we removed status indicators
</script>

<div class="container-fluid p-2">
	<header class="mb-2 flex items-center justify-between">
		<h2 class="h2">Project Big Board</h2>

		<!-- Minimal Search -->
		<div class="w-64">
			<input class="input" type="text" placeholder="Search projects..." bind:value={searchQuery} />
		</div>
	</header>

	<!-- Projects Grid - 4 columns by default, 6 on large screens -->
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
		{#each filteredProjects as project}
			<div class="card bg-surface-100-900 p-2">
				<!-- Project Title - Allow full title to be read -->
				<h4 class="h5 mb-1">{project.title}</h4>

				<!-- Next Task Info - Very minimal -->
				<div class="text-xs">
					<div class="truncate font-medium">{project.task.title}</div>
					<div class="text-surface-700-300">{project.task.assignee}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
