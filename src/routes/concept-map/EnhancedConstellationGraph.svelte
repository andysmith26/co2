<style>
	.graph-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
		background-color: #fafafa;
		border-radius: 4px;
		overflow: hidden;
	}

	.placeholder-message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: #666;
	}

	.type-filters {
		position: absolute;
		top: 20px;
		left: 20px;
		background-color: rgba(255, 255, 255, 0.9);
		padding: 8px;
		border-radius: 4px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.filter-option {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
	}

	.filter-option:last-child {
		margin-bottom: 0;
	}

	.filter-option label {
		display: flex;
		align-items: center;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.type-indicator {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--type-color, #999);
		margin-right: 6px;
	}
</style>

<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { nodeTypes } from './data/concepts';

	// Props
	let { concepts = [], connections = [], progress = {}, activeFilters = { types: [] } } = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Local state
	let graphContainer;
	let simulation;
	let svg;
	let width = 800;
	let height = 600;
	let selectedNode = $state(null);

	// We'll use a simplified D3-like visualization approach
	// In a real implementation, you'd want to use D3.js for this

	onMount(() => {
		// Initialize graph visualization
		initGraph();

		// Handle window resize
		const handleResize = () => {
			if (graphContainer) {
				width = graphContainer.clientWidth;
				height = graphContainer.clientHeight;
				updateGraph();
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
			if (simulation) {
				simulation.stop();
			}
		};
	});

	// Watch for changes to concepts, connections or filters
	$effect(() => {
		if (svg) {
			updateGraph();
		}
	});

	function initGraph() {
		// In a real implementation, we would:
		// 1. Set up D3 force simulation
		// 2. Create SVG elements for nodes and links
		// 3. Add zoom and drag behaviors
		// 4. Set up event listeners

		// For this simplified version, we'll just create a placeholder
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', width);
		svg.setAttribute('height', height);

		graphContainer.appendChild(svg);

		// Add a colored circle for each concept
		updateGraph();
	}

	function updateGraph() {
		if (!svg) return;

		// Clear existing visualization
		while (svg.firstChild) {
			svg.removeChild(svg.firstChild);
		}

		// Filter concepts based on active filters
		const filteredConcepts = concepts.filter((concept) =>
			activeFilters.types.includes(concept.type)
		);

		// Filter connections to only include filtered concepts
		const filteredConnections = connections.filter((conn) => {
			const sourceId = typeof conn.source === 'string' ? conn.source : conn.source.id;
			const targetId = typeof conn.target === 'string' ? conn.target : conn.target.id;

			const sourceIncluded = filteredConcepts.some((c) => c.id === sourceId);
			const targetIncluded = filteredConcepts.some((c) => c.id === targetId);

			return sourceIncluded && targetIncluded;
		});

		// Create a simple force-directed layout
		// In a real implementation, this would use D3's force simulation
		const nodePositions = {};

		// Simple node positioning in a grid layout
		const cols = Math.ceil(Math.sqrt(filteredConcepts.length));
		const cellWidth = width / cols;
		const cellHeight = height / Math.ceil(filteredConcepts.length / cols);

		filteredConcepts.forEach((concept, i) => {
			const col = i % cols;
			const row = Math.floor(i / cols);

			// Add some randomness to positions
			const x = (col + 0.5) * cellWidth + (Math.random() - 0.5) * cellWidth * 0.5;
			const y = (row + 0.5) * cellHeight + (Math.random() - 0.5) * cellHeight * 0.5;

			nodePositions[concept.id] = { x, y };
		});

		// Draw connections
		filteredConnections.forEach((conn) => {
			const sourceId = typeof conn.source === 'string' ? conn.source : conn.source.id;
			const targetId = typeof conn.target === 'string' ? conn.target : conn.target.id;

			const sourcePos = nodePositions[sourceId];
			const targetPos = nodePositions[targetId];

			if (sourcePos && targetPos) {
				const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', sourcePos.x);
				line.setAttribute('y1', sourcePos.y);
				line.setAttribute('x2', targetPos.x);
				line.setAttribute('y2', targetPos.y);
				line.setAttribute('stroke', conn.userCreated ? '#ff9800' : '#999');
				line.setAttribute('stroke-width', conn.userCreated ? 2 : 1);
				line.setAttribute('opacity', 0.6);

				svg.appendChild(line);
			}
		});

		// Draw nodes
		filteredConcepts.forEach((concept) => {
			const pos = nodePositions[concept.id];
			if (!pos) return;

			// Find node type config
			const nodeType = nodeTypes.find((t) => t.id === concept.type) || {
				color: '#999',
				size: 12,
			};

			// Get progress status
			const nodeProgress = progress[concept.id] || 'not-started';

			// Draw node
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', pos.x);
			circle.setAttribute('cy', pos.y);
			circle.setAttribute('r', nodeType.size || 10);
			circle.setAttribute('fill', nodeType.color || '#999');

			// Add a different stroke based on progress
			if (nodeProgress === 'mastered') {
				circle.setAttribute('stroke', '#28a745');
				circle.setAttribute('stroke-width', 3);
			} else if (nodeProgress === 'in-progress') {
				circle.setAttribute('stroke', '#ffc107');
				circle.setAttribute('stroke-width', 3);
			}

			// Add click handler
			circle.addEventListener('click', () => handleNodeClick(concept));

			// Add hover styles
			circle.addEventListener('mouseenter', () => {
				circle.setAttribute('r', (nodeType.size || 10) * 1.2);
				circle.style.cursor = 'pointer';
			});

			circle.addEventListener('mouseleave', () => {
				circle.setAttribute('r', nodeType.size || 10);
			});

			svg.appendChild(circle);

			// Add label
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', pos.x);
			text.setAttribute('y', pos.y + nodeType.size + 10);
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('font-size', '10px');
			text.textContent = concept.label;

			svg.appendChild(text);
		});
	}

	function handleNodeClick(concept) {
		selectedNode = concept;
		dispatch('select', concept);
	}
</script>

<div class="graph-container" bind:this={graphContainer}>
	<!-- SVG will be created here dynamically -->
	<div class="placeholder-message">
		<p>
			{#if concepts.length === 0}
				No concepts available.
			{:else if connections.length === 0}
				No connections between concepts.
			{:else}
				Loading concept visualization...
			{/if}
		</p>
	</div>

	<div class="type-filters">
		{#each nodeTypes as type}
			<div class="filter-option">
				<input
					type="checkbox"
					id={`filter-${type.id}`}
					checked={activeFilters.types.includes(type.id)}
					onclick={() => {
						if (activeFilters.types.includes(type.id)) {
							activeFilters.types = activeFilters.types.filter((t) => t !== type.id);
						} else {
							activeFilters.types = [...activeFilters.types, type.id];
						}
					}}
				/>
				<label for={`filter-${type.id}`} style={`--type-color: ${type.color}`}>
					<span class="type-indicator"></span>
					{type.label}
				</label>
			</div>
		{/each}
	</div>
</div>
