
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let concepts = [];
  export let progress = {};
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle status update
  function updateStatus(conceptId, status) {
    dispatch('update', {
      conceptId,
      status
    });
  }
  
  // Group concepts by category
  $: conceptsByCategory = concepts.reduce((groups, concept) => {
    const category = concept.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(concept);
    return groups;
  }, {});
  
  // Calculate progress statistics
  $: stats = {
    total: concepts.length,
    mastered: concepts.filter(c => progress[c.id] === 'mastered').length,
    inProgress: concepts.filter(c => progress[c.id] === 'in-progress').length,
    notStarted: concepts.filter(c => progress[c.id] === 'not-started' || !progress[c.id]).length
  };
  
  $: masteredPercentage = Math.round((stats.mastered / stats.total) * 100) || 0;
  $: inProgressPercentage = Math.round((stats.inProgress / stats.total) * 100) || 0;
  $: notStartedPercentage = Math.round((stats.notStarted / stats.total) * 100) || 0;
  
  // Get concept status
  function getConceptStatus(conceptId) {
    return progress[conceptId] || 'not-started';
  }
  
  // Get status color
  function getStatusColor(status) {
    if (status === 'mastered') return '#28a745';
    if (status === 'in-progress') return '#ffc107';
    return '#dc3545';
  }
  
  // Toggle status (cycles through not-started -> in-progress -> mastered -> not-started)
  function toggleStatus(conceptId) {
    const currentStatus = getConceptStatus(conceptId);
    
    let newStatus;
    if (currentStatus === 'not-started') newStatus = 'in-progress';
    else if (currentStatus === 'in-progress') newStatus = 'mastered';
    else newStatus = 'not-started';
    
    updateStatus(conceptId, newStatus);
  }
</script>

<div class="progress-tracker">
  <div class="progress-summary">
    <div class="progress-bar">
      <div class="progress-segment" 
           style="width: {masteredPercentage}%; background-color: #28a745;"
           title="Mastered: {stats.mastered} concepts ({masteredPercentage}%)">
      </div>
      <div class="progress-segment" 
           style="width: {inProgressPercentage}%; background-color: #ffc107;"
           title="In Progress: {stats.inProgress} concepts ({inProgressPercentage}%)">
      </div>
      <div class="progress-segment" 
           style="width: {notStartedPercentage}%; background-color: #dc3545;"
           title="Not Started: {stats.notStarted} concepts ({notStartedPercentage}%)">
      </div>
    </div>
    
    <div class="progress-stats">
      <div class="stat-item" style="color: #28a745;">
        <span class="stat-value">{stats.mastered}</span>
        <span class="stat-label">Mastered</span>
      </div>
      <div class="stat-item" style="color: #ffc107;">
        <span class="stat-value">{stats.inProgress}</span>
        <span class="stat-label">In Progress</span>
      </div>
      <div class="stat-item" style="color: #dc3545;">
        <span class="stat-value">{stats.notStarted}</span>
        <span class="stat-label">Not Started</span>
      </div>
      <div class="stat-item" style="color: #6c757d;">
        <span class="stat-value">{stats.total}</span>
        <span class="stat-label">Total</span>
      </div>
    </div>
  </div>
  
  <div class="category-progress">
    <h4>Progress by Category</h4>
    
    <div class="categories-list">
      {#each Object.entries(conceptsByCategory) as [category, categoryConcepts]}
        <div class="category-item">
          <div class="category-header">
            <h5>{category}</h5>
            <div class="category-stats">
              <span>{categoryConcepts.filter(c => getConceptStatus(c.id) === 'mastered').length}/{categoryConcepts.length}</span>
            </div>
          </div>
          
          <div class="category-concepts">
            {#each categoryConcepts as concept}
              {@const status = getConceptStatus(concept.id)}
              <div class="concept-item" on:click={() => toggleStatus(concept.id)}>
                <div class="concept-status" 
                     style="background-color: {getStatusColor(status)}"
                     title="{status.charAt(0).toUpperCase() + status.slice(1)}">
                </div>
                <div class="concept-label">
                  {concept.label}
                  <span class="concept-id">{concept.id}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="progress-actions">
    <button class="export-button">Export Progress</button>
    <button class="reset-button">Reset Progress</button>
  </div>
</div>

<style>
  .progress-tracker {
    padding: 1rem;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .progress-summary {
    margin-bottom: 1.5rem;
  }
  
  .progress-bar {
    height: 24px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    margin-bottom: 0.5rem;
  }
  
  .progress-segment {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .progress-stats {
    display: flex;
    justify-content: space-between;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9rem;
  }
  
  .stat-value {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .category-progress {
    margin-bottom: 1.5rem;
  }
  
  .category-progress h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  
  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .category-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
  }
  
  .category-header h5 {
    margin: 0;
    font-size: 0.9rem;
  }
  
  .category-stats {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .category-concepts {
    padding: 0.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
  }
  
  .concept-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .concept-item:hover {
    background-color: #f8f9fa;
  }
  
  .concept-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
  
  .concept-label {
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .concept-id {
    color: #6c757d;
    font-size: 0.75rem;
    margin-left: 0.25rem;
  }
  
  .progress-actions {
    display: flex;
    justify-content: space-between;
  }
  
  .export-button, .reset-button {
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    border: none;
  }
  
  .export-button {
    background-color: #17a2b8;
    color: white;
  }
  
  .reset-button {
    background-color: #dc3545;
    color: white;
  }
