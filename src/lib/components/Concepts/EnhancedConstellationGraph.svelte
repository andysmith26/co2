
<script>
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { nodeTypes } from '../../lib/data/enhanced-concepts';
  
  // Props
  export let concepts = [];
  export let connections = [];
  export let progress = {};
  export let activeFilters = { types: ['learning-objective', 'vocabulary', 'protocol', 'technology', 'infrastructure'] };
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // References
  let svg;
  let width = 800;
  let height = 600;
  let zoomLevel = 1;
  
  // Data for visualization (will be copied from props)
  let nodes = [];
  let links = [];
  let simulation;
  
  // Filter nodes and links based on activeFilters
  $: filteredNodes = concepts.filter(concept => 
    activeFilters.types.includes(concept.type)
  );
  
  $: filteredLinks = connections.filter(connection => {
    const sourceNode = concepts.find(n => n.id === connection.source);
    const targetNode = concepts.find(n => n.id === connection.target);
    return sourceNode && targetNode && 
           activeFilters.types.includes(sourceNode.type) && 
           activeFilters.types.includes(targetNode.type);
  });
  
  // Initialize after component mounts
  onMount(() => {
    // Set dimensions based on container
    const container = svg.parentElement;
    width = container.clientWidth;
    height = container.clientHeight;
    
    // Initialize the visualization
    initializeGraph();
    
    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      updateGraph();
    });
    
    resizeObserver.observe(container);
    
    return () => {
      if (simulation) simulation.stop();
      resizeObserver.disconnect();
    };
  });
  
  // Update graph when filtered data changes
  $: if (svg && filteredNodes.length > 0) {
    updateGraph();
  }
  
  // Initialize the force-directed graph
  function initializeGraph() {
    // Create a zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        zoomLevel = event.transform.k;
        d3.select(svg).select('g.zoom-group')
          .attr('transform', event.transform);
      });
    
    // Apply zoom to SVG
    d3.select(svg)
      .call(zoom)
      .on("dblclick.zoom", null); // Disable double-click zoom
      
    // Create zoom group
    d3.select(svg)
      .append('g')
      .attr('class', 'zoom-group');
      
    // Initial update
    updateGraph();
  }
  
  // Update the graph visualization
  function updateGraph() {
    if (!svg) return;
    
    // Copy data to avoid mutating props
    nodes = filteredNodes.map(concept => ({
      ...concept,
      x: concept.x || width / 2 + (Math.random() - 0.5) * 200,
      y: concept.y || height / 2 + (Math.random() - 0.5) * 200,
    }));
    
    links = filteredLinks.map(connection => ({
      ...connection,
      source: nodes.find(n => n.id === connection.source) || connection.source,
      target: nodes.find(n => n.id === connection.target) || connection.target,
    }));
    
    // Stop previous simulation if running
    if (simulation) simulation.stop();
    
    // Create force simulation
    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          // Adjust distance based on node types
          const sourceType = d.source.type || 'vocabulary';
          const targetType = d.target.type || 'vocabulary';
          
          if (sourceType === 'learning-objective' && targetType === 'vocabulary') return 80;
          if (sourceType === 'vocabulary' && targetType === 'protocol') return 60;
          return 100; // Default distance
        })
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 5))
      .on('tick', ticked);
    
    // Create SVG elements
    const svgGroup = d3.select(svg).select('g.zoom-group');
    
    // Links
    const linkElements = svgGroup.selectAll('line.link')
      .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
      
    linkElements.exit().remove();
    
    const linkEnter = linkElements.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => getLinkColor(d))
      .attr('stroke-width', d => d.userCreated ? 2 : 1)
      .attr('opacity', d => d.userCreated ? 0.8 : 0.5);
      
    const linkMerge = linkEnter.merge(linkElements);
    
    // Nodes
    const nodeElements = svgGroup.selectAll('g.node')
      .data(nodes, d => d.id);
      
    nodeElements.exit().remove();
    
    const nodeEnter = nodeElements.enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      })
      .on('mouseover', (event, d) => {
        // Add hover effect
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('r', getNodeRadius(d) * 1.2);
          
        // Show tooltip
        const tooltip = d3.select('#tooltip');
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px')
          .style('display', 'block')
          .html(`
            <div class="tooltip-title">${d.label}</div>
            <div class="tooltip-id">${d.id}</div>
            <div class="tooltip-type">${getNodeTypeName(d.type)}</div>
            <div class="tooltip-desc">${d.description}</div>
          `);
      })
      .on('mouseout', (event, d) => {
        // Remove hover effect
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('r', getNodeRadius(d));
          
        // Hide tooltip
        d3.select('#tooltip').style('display', 'none');
      });
      
    // Node circles
    nodeEnter.append('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => getNodeStrokeColor(d))
      .attr('stroke-width', 2);
      
    // Node labels
    nodeEnter.append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', d => getLabelSize(d))
      .style('pointer-events', 'none')
      .text(d => d.label);
      
    const nodeMerge = nodeEnter.merge(nodeElements);
    
    // Update existing nodes
    nodeMerge.select('circle')
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => getNodeStrokeColor(d))
      .attr('r', d => getNodeRadius(d));
    
    // Update function for simulation ticks
    function ticked() {
      // Update link positions
      linkMerge
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      // Update node positions
      nodeMerge
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }
  }
  
  // Get node type name for display
  function getNodeTypeName(type) {
    const nodeType = nodeTypes.find(t => t.id === type);
    return nodeType ? nodeType.label : 'Unknown';
  }
  
  // Get node radius based on node type and importance
  function getNodeRadius(node) {
    const baseSize = nodeTypes.find(t => t.id === node.type)?.size || 16;
    return baseSize * (node.importance ? Math.sqrt(node.importance) / 2 : 1);
  }
  
  // Get label font size based on node type
  function getLabelSize(node) {
    if (node.type === 'learning-objective') return '12px';
    if (node.importance >= 5) return '10px';
    return '8px';
  }
  
  // Get node color based on type
  function getNodeColor(node) {
    const nodeType = nodeTypes.find(t => t.id === node.type);
    return nodeType ? nodeType.color : '#cccccc';
  }
  
  // Get node stroke color based on progress status
  function getNodeStrokeColor(node) {
    const status = progress[node.id];
    
    if (status === 'mastered') return '#28a745';  // Green
    if (status === 'in-progress') return '#ffc107';  // Yellow
    if (status === 'not-started') return '#dc3545';  // Red
    return '#ffffff';  // White (default)
  }
  
  // Get link color based on type
  function getLinkColor(link) {
    const colors = {
      'hierarchical': '#999999',
      'sequential': '#0066cc',
      'causal': '#cc3300',
      'comparative': '#009933',
      'functional': '#9900cc',
    };
    
    return colors[link.type] || '#999999';
  }
  
  // Drag event handlers
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  // Handle node click
  function handleNodeClick(node) {
    dispatch('select', node);
  }
</script>

<div class="graph-container">
  <svg bind:this={svg} width="100%" height="100%">
    <!-- D3 will populate this with a zoom group -->
  </svg>
  
  <!-- Tooltip for node hover -->
  <div id="tooltip" class="tooltip">
    <!-- Tooltip content will be populated by D3 -->
  </div>
  
  <!-- Type filters -->
  <div class="type-filters">
    <h4>Filter Concept Types</h4>
    <div class="filter-options">
      {#each nodeTypes as type}
        <label class="filter-option" style="--type-color: {type.color}">
          <input 
            type="checkbox" 
            checked={activeFilters.types.includes(type.id)}
            on:change={(e) => {
              const checked = e.target.checked;
              if (checked) {
                activeFilters.types = [...activeFilters.types, type.id];
              } else {
                activeFilters.types = activeFilters.types.filter(t => t !== type.id);
              }
              activeFilters = activeFilters; // Trigger reactivity
            }}
          />
          <span class="type-indicator" style="background-color: {type.color}"></span>
          {type.label}
        </label>
      {/each}
    </div>
  </div>
  
  <div class="zoom-controls">
    <button on:click={() => {
      const transform = d3.zoomIdentity.scale(zoomLevel * 1.2);
      d3.select(svg).transition().duration(300).call(d3.zoom().transform, transform);
    }}>+</button>
    
    <button on:click={() => {
      const transform = d3.zoomIdentity.scale(zoomLevel / 1.2);
      d3.select(svg).transition().duration(300).call(d3.zoom().transform, transform);
    }}>-</button>
    
    <button on:click={() => {
      const transform = d3.zoomIdentity;
      d3.select(svg).transition().duration(300).call(d3.zoom().transform, transform);
    }}>Reset</button>
  </div>
  
  <div class="connection-legend">
    <h4>Connection Types</h4>
    <div class="legend-items">
      <div class="legend-item">
        <span class="line" style="background-color: #999999;"></span>
        <span>Hierarchical</span>
      </div>
      <div class="legend-item">
        <span class="line" style="background-color: #0066cc;"></span>
        <span>Sequential</span>
      </div>
      <div class="legend-item">
        <span class="line" style="background-color: #cc3300;"></span>
        <span>Causal</span>
      </div>
      <div class="legend-item">
        <span class="line" style="background-color: #009933;"></span>
        <span>Comparative</span>
      </div>
      <div class="legend-item">
        <span class="line" style="background-color: #9900cc;"></span>
        <span>Functional</span>
      </div>
    </div>
  </div>
</div>

<style>
  .graph-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background-color: #ffffff;
  }
  
  svg {
    cursor: move;
  }
  
  .tooltip {
    position: absolute;
    display: none;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    max-width: 250px;
    pointer-events: none;
    z-index: 100;
  }
  
  .tooltip-title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 3px;
  }
  
  .tooltip-id {
    font-size: 10px;
    color: #ccc;
    margin-bottom: 3px;
  }
  
  .tooltip-type {
    font-size: 11px;
    margin-bottom: 5px;
    font-style: italic;
  }
  
  .tooltip-desc {
    font-size: 11px;
    line-height: 1.4;
  }
  
  .type-filters {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
    max-width: 200px;
    z-index: 10;
  }
  
  .type-filters h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
  }
  
  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .filter-option {
    display: flex;
    align-items: center;
    font-size: 12px;
    cursor: pointer;
  }
  
  .type-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin: 0 5px;
    display: inline-block;
  }
  
  .zoom-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    z-index: 10;
  }
  
  .zoom-controls button {
    width: 30px;
    height: 30px;
    margin-bottom: 5px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .zoom-controls button:hover {
    background-color: #f5f5f5;
  }
  
  .connection-legend {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 12px;
    max-width: 180px;
    z-index: 10;
  }
  
  .connection-legend h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
  }
  
  .legend-items {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
  }
  
  .line {
    width: 20px;
    height: 2px;
    margin-right: 5px;
    display: inline-block;
  }
</style>
