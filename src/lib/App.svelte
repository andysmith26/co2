<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';
  import EnhancedConstellationGraph from './components/Graph/EnhancedConstellationGraph.svelte';
  import ConceptDetail from './components/Details/ConceptDetail.svelte';
  import ConnectionCreator from './components/Creation/ConnectionCreator.svelte';
  import { conceptNodes, starterConnections, nodeTypes } from './lib/data/enhanced-concepts';
  import { writable } from 'svelte/store';
  
  // Reactive stores
  const conceptsStore = writable(conceptNodes);
  const connectionsStore = writable(starterConnections);
  
  // Set up progress store and load from localStorage if available
  let progressStore;
  onMount(() => {
    const savedProgress = localStorage.getItem('ap-csp-progress');
    progressStore = writable(savedProgress ? JSON.parse(savedProgress) : {});
    
    // Save progress to localStorage whenever it changes
    progressStore.subscribe(value => {
      localStorage.setItem('ap-csp-progress', JSON.stringify(value));
    });
    
    // Load user-created connections if available
    const savedConnections = localStorage.getItem('ap-csp-connections');
    if (savedConnections) {
      const userConnections = JSON.parse(savedConnections);
      connectionsStore.update(connections => [...connections, ...userConnections]);
    }
  });
  
  // Selected concept state
  let selectedConcept = null;
  
  // Handle selecting a concept
  function handleConceptSelect(event) {
    selectedConcept = event.detail;
  }
  
  // Handle creating a new connection
  function handleNewConnection(event) {
    const newConnection = event.detail;
    connectionsStore.update(connections => {
      const updatedConnections = [...connections, newConnection];
      localStorage.setItem('ap-csp-connections', JSON.stringify(
        updatedConnections.filter(c => c.userCreated)
      ));
      return updatedConnections;
    });
  }
  
  // Handle updating progress
  function handleProgressUpdate(event) {
    const { conceptId, status } = event.detail;
    progressStore.update(progress => {
      return { ...progress, [conceptId]: status };
    });
  }
  
  // Filter options
  let typeFilters = nodeTypes.map(type => type.id);
  let searchTerm = '';
  
  // Count connections for a concept
  function countConnections(conceptId) {
    let count = 0;
    if (!$connectionsStore) return count;
    
    $connectionsStore.forEach(conn => {
      if (conn.source === conceptId || conn.source.id === conceptId || 
          conn.target === conceptId || conn.target.id === conceptId) {
        count++;
      }
    });
    return count;
  }
  
  // Get connected concepts for a given concept
  function getConnectedConcepts(conceptId) {
    const connected = [];
    if (!$connectionsStore) return connected;
    
    $connectionsStore.forEach(conn => {
      if (conn.source === conceptId || conn.source.id === conceptId) {
        const targetId = typeof conn.target === 'string' ? conn.target : conn.target.id;
        const concept = $conceptsStore.find(c => c.id === targetId);
        if (concept) connected.push({
          concept,
          connectionType: conn.type,
          description: conn.description
        });
      } else if (conn.target === conceptId || conn.target.id === conceptId) {
        const sourceId = typeof conn.source === 'string' ? conn.source : conn.source.id;
        const concept = $conceptsStore.find(c => c.id === sourceId);
        if (concept) connected.push({
          concept,
          connectionType: conn.type,
          description: conn.description,
          isIncoming: true
        });
      }
    });
    
    return connected;
  }
</script>

<main>
  <header>
    <h1>AP CSP Review: Concept Constellation</h1>
    <div class="search">
      <input 
        type="text" 
        placeholder="Search concepts..." 
        bind:value={searchTerm}
      />
    </div>
  </header>
  
  <div class="constellation-container">
    <EnhancedConstellationGraph 
      concepts={$conceptsStore.filter(c => 
        searchTerm === '' || 
        c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )}
      connections={$connectionsStore}
      progress={$progressStore}
      activeFilters={{ types: typeFilters }}
      on:select={handleConceptSelect}
    />
    
    <div class="sidebar" class:active={selectedConcept}>
      {#if selectedConcept}
        <div class="sidebar-header">
          <button class="close-button" on:click={() => selectedConcept = null}>×</button>
        </div>
        
        <ConceptDetail 
          concept={selectedConcept}
          progress={$progressStore[selectedConcept.id] || 'not-started'}
          on:progressUpdate={handleProgressUpdate}
        />
        
        <!-- Connected Concepts Section -->
        <div class="connected-concepts">
          <h3>Connected Concepts ({countConnections(selectedConcept.id)})</h3>
          
          {#if countConnections(selectedConcept.id) === 0}
            <p class="no-connections">No connections yet. Create a connection below.</p>
          {:else}
            <div class="connection-list">
              {#each getConnectedConcepts(selectedConcept.id) as item}
                <div class="connection-item" on:click={() => selectedConcept = item.concept}>
                  <div class="connection-direction">
                    {#if item.isIncoming}
                      <span class="direction incoming">←</span>
                    {:else}
                      <span class="direction outgoing">→</span>
                    {/if}
                  </div>
                  <div class="connection-info">
                    <div class="connected-concept">
                      <span class="concept-type-indicator" 
                            style="background-color: {nodeTypes.find(t => t.id === item.concept.type)?.color}">
                      </span>
                      <span class="concept-label">{item.concept.label}</span>
                    </div>
                    <div class="connection-type">
                      {item.connectionType}: {item.description}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
        
        <ConnectionCreator 
          concepts={$conceptsStore}
          selectedConcept={selectedConcept}
          on:create={handleNewConnection}
        />
      {:else}
        <div class="intro-message">
          <h2>AP CSP Big Idea 4: Computing Systems and Networks</h2>
          <p>This concept map visualizes the key ideas, vocabulary, and technologies related to computing systems and networks.</p>
          <p>Click on any node to see details and explore connections.</p>
          <p>Create your own connections between concepts to build your understanding.</p>
          <h3>How to Use This Tool</h3>
          <ul>
            <li><strong>Explore:</strong> Click on concepts to view details</li>
            <li><strong>Connect:</strong> Create meaningful connections between concepts</li>
            <li><strong>Track:</strong> Mark your understanding level for each concept</li>
            <li><strong>Filter:</strong> Use the filters to focus on specific concept types</li>
            <li><strong>Search:</strong> Find specific concepts using the search box</li>
          </ul>
          <p class="tip"><strong>Tip:</strong> Pay special attention to how concepts connect across different categories - these relationships are often tested on the AP exam!</p>
        </div>
      {/if}
    </div>
  </div>
  
  <footer>
    <div class="progress-summary">
      <h3>Your Progress</h3>
      <div class="progress-bar">
        <div class="progress-segment mastered" 
             style="width: {($conceptsStore.filter(c => $progressStore[c.id] === 'mastered').length / $conceptsStore.length * 100) || 0}%">
        </div>
        <div class="progress-segment in-progress" 
             style="width: {($conceptsStore.filter(c => $progressStore[c.id] === 'in-progress').length / $conceptsStore.length * 100) || 0}%">
        </div>
      </div>
      <div class="progress-stats">
        <div class="stat">
          <span class="stat-value">{$conceptsStore.filter(c => $progressStore[c.id] === 'mastered').length}</span>
          <span class="stat-label">Mastered</span>
        </div>
        <div class="stat">
          <span class="stat-value">{$conceptsStore.filter(c => $progressStore[c.id] === 'in-progress').length}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat">
          <span class="stat-value">{$conceptsStore.filter(c => !$progressStore[c.id] || $progressStore[c.id] === 'not-started').length}</span>
          <span class="stat-label">Not Started</span>
        </div>
        <div class="stat">
          <span class="stat-value">{Object.values($connectionsStore).filter(c => c.userCreated).length}</span>
          <span class="stat-label">Your Connections</span>
        </div>
      </div>
    </div>
  </footer>
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
    color: #333;
    overflow: hidden;
  }
  
  header {
    padding: 1rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
  }
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .search input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 250px;
    font-size: 0.9rem;
  }
  
  .constellation-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }
  
  .sidebar {
    position: absolute;
    right: -400px;
    top: 0;
    bottom: 0;
    width: 380px;
    background-color: white;
    border-left: 1px solid #ddd;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
    padding: 1rem;
    overflow-y: auto;
    transition: right 0.3s ease;
    z-index: 20;
  }
  
  .sidebar.active {
    right: 0;
  }
  
  .sidebar-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .connected-concepts {
    margin-top: 1.5rem;
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .connected-concepts h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  .no-connections {
    font-style: italic;
    color: #666;
  }
  
  .connection-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .connection-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .connection-item:hover {
    background-color: #f0f0f0;
  }
  
  .connection-direction {
    margin-right: 0.75rem;
    font-size: 1.2rem;
    color: #666;
  }
  
  .direction.incoming {
    color: #0066cc;
  }
  
  .direction.outgoing {
    color: #cc3300;
  }
  
  .connection-info {
    flex: 1;
  }
  
  .connected-concept {
    display: flex;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  
  .concept-type-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.5rem;
  }
  
  .concept-label {
    font-weight: 500;
  }
  
  .connection-type {
    font-size: 0.85rem;
    color: #666;
  }
  
  .intro-message {
    padding: 1rem;
  }
  
  .intro-message h2 {
    margin-top: 0;
    color: #333;
    font-size: 1.4rem;
  }
  
  .intro-message h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  .intro-message p {
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .intro-message ul {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .intro-message li {
    margin-bottom: 0.5rem;
  }
  
  .tip {
    background-color: #e6f7ff;
    padding: 0.75rem;
    border-left: 3px solid #1890ff;
    border-radius: 0 4px 4px 0;
  }
  
  footer {
    padding: 1rem;
    background-color: #f5f5f5;
    border-top: 1px solid #ddd;
  }
  
  .progress-summary h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .progress-bar {
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    display: flex;
  }
  
  .progress-segment {
    height: 100%;
  }
  
  .progress-segment.mastered {
    background-color: #28a745;
  }
  
  .progress-segment.in-progress {
    background-color: #ffc107;
  }
  
  .progress-stats {
    display: flex;
    justify-content: space-between;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.8rem;
  }
  
  .stat-value {
    font-weight: bold;
    font-size: 1rem;
  }
  
  .stat-label {
    color: #666;
  }
</style>
