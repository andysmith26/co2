<script>
	// Mock project data - expanded to 24 projects
	const projects = $state([
		{
			id: '1',
			title: 'Carbon Capture Research',
			task: { title: 'Analyze cost effectiveness data', assignee: 'John Smith' },
		},
		{
			id: '2',
			title: 'Classroom CO2 Monitors',
			task: { title: 'Test monitor accuracy', assignee: 'Michael Chen' },
		},
		{
			id: '3',
			title: 'Community Emission Reduction',
			task: { title: 'Identify community stakeholders', assignee: 'David Parker' },
		},
		{
			id: '4',
			title: 'Solar Panel Installation',
			task: { title: 'Site assessment', assignee: 'Emma Lee' },
		},
		{
			id: '5',
			title: 'Green Transportation Initiative',
			task: { title: 'Research EV charging stations', assignee: 'Tyler Johnson' },
		},
		{
			id: '6',
			title: 'Waste Reduction Program',
			task: { title: 'Develop sorting guidelines', assignee: 'Samantha Lopez' },
		},
		{
			id: '7',
			title: 'Energy Efficiency Audit',
			task: { title: 'Collect baseline measurements', assignee: 'Alex Wilson' },
		},
		{
			id: '8',
			title: 'Water Conservation Project',
			task: { title: 'Identify high usage areas', assignee: 'Jamal Brown' },
		},
		{
			id: '9',
			title: 'Tree Planting Initiative',
			task: { title: 'Secure planting sites', assignee: 'Maria Garcia' },
		},
		{
			id: '10',
			title: 'Carbon Footprint Calculator',
			task: { title: 'Develop user interface', assignee: 'Chris Taylor' },
		},
		{
			id: '11',
			title: 'Sustainable Food Program',
			task: { title: 'Contact local farmers', assignee: 'Leila Ahmed' },
		},
		{
			id: '12',
			title: 'Climate Education Workshop',
			task: { title: 'Create presentation materials', assignee: 'Daniel Kim' },
		},
		{
			id: '13',
			title: 'Renewable Energy Integration',
			task: { title: 'Assess grid capacity', assignee: 'Sanjay Patel' },
		},
		{
			id: '14',
			title: 'Zero Waste Campus Initiative',
			task: { title: 'Conduct waste audit', assignee: 'Rachel Green' },
		},
		{
			id: '15',
			title: 'Electric Vehicle Incentives',
			task: { title: 'Research tax benefits', assignee: 'Marcus Johnson' },
		},
		{
			id: '16',
			title: 'Sustainable Construction',
			task: { title: 'Evaluate green materials', assignee: 'Ava Richardson' },
		},
		{
			id: '17',
			title: 'Community Garden Project',
			task: { title: 'Identify potential locations', assignee: 'Priya Sharma' },
		},
		{
			id: '18',
			title: 'Low Carbon Diet Program',
			task: { title: 'Calculate food carbon footprint', assignee: 'Thomas Wright' },
		},
		{
			id: '19',
			title: 'Bike Sharing Program',
			task: { title: 'Map station locations', assignee: 'Lin Zhang' },
		},
		{
			id: '20',
			title: 'Climate Resilience Planning',
			task: { title: 'Identify vulnerable areas', assignee: 'Elena Rodriguez' },
		},
		{
			id: '21',
			title: 'Green Roof Installation',
			task: { title: 'Assess structural requirements', assignee: 'Omar Hassan' },
		},
		{
			id: '22',
			title: 'Water Reclamation System',
			task: { title: 'Calculate potential savings', assignee: 'Naomi Campbell' },
		},
		{
			id: '23',
			title: 'Native Species Restoration',
			task: { title: 'Catalog indigenous plants', assignee: 'Kenji Tanaka' },
		},
		{
			id: '24',
			title: 'Smart Building Technology',
			task: { title: 'Evaluate energy management systems', assignee: 'Sophie Martin' },
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
