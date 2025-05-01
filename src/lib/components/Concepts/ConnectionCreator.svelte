<!-- components/Creation/ConnectionCreator.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { connectionTypes, nodeTypes } from '../../lib/data/enhanced-concepts';
  
  // Props
  export let concepts = [];
  export let selectedConcept = null;
  
  // Local state
  let showForm = false;
  let sourceId = '';
  let targetId = '';
  let connectionType = connectionTypes[0].id;
  let description = '';
  let errorMessage = '';
  
  // Update source when selectedConcept changes
  $: if (selectedConcept && selectedConcept.id) {
    sourceId = selectedConcept.id;
  }
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Toggle form visibility
  function toggleForm() {
    showForm = !showForm;
    resetForm();
  }
  
  // Reset the form
  function resetForm() {
    // If we have a selected concept, keep it as source
    if (selectedConcept) {
      sourceId = selectedConcept.id;
    } else {
      sourceId = '';
    }
    targetId = '';
    connectionType = connectionTypes[0].id;
    description = '';
    errorMessage = '';
  }
  
  // Create a new connection
  function createConnection() {
    // Validate form
    if (!sourceId || !targetId) {
      errorMessage = 'Please select both source and target concepts.';
      return;
    }
    
    if (sourceId === targetId) {
      errorMessage = 'Source and target concepts must be different.';
      return;
    }
    
    if (!connectionType) {
      errorMessage = 'Please select a connection type.';
      return;
    }
    
    if (!description.trim()) {
      errorMessage = 'Please describe the relationship between concepts.';
      return;
    }
    
    // Create connection object
    const newConnection = {
      id: `user-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: connectionType,
      description,
      userCreated: true
    };
    
    // Dispatch event
    dispatch('create', newConnection);
    
    // Reset and close form
    resetForm();
    showForm = false;
  }
  
  // Group concepts by type for better organization
  $: conceptsByType = concepts.reduce((groups, concept) => {
    const type = concept.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(concept);
    return groups;
  }, {});
  
  // Get the selected source and target concepts
  $: selectedSource = concepts.find(c => c.id === sourceId);
  $: selectedTarget = concepts.find(c => c.id === targetId);
  
  // Get the selected connection type
  $: selectedConnectionType = connectionTypes.find(t => t.id === connectionType);
  
  // Learning objectives related to selected concept
  $: relatedLO = selectedSource && selectedSource.relatedLO ? 
    concepts.find(c => c.id === selectedSource.relatedLO) : null;
  
  // Filter concepts to exclude already selected source
  $: filteredConcepts = concepts.filter(c => c.id !== sourceId);
  
  // Generate a connection description suggestion based on source, target, and connection type
  $: suggestionPrompt = generateSuggestionPrompt(selectedSource, selectedTarget, selectedConnectionType);
  
  function generateSuggestionPrompt(source, target, connType) {
    if (!source || !target || !connType) return "";
    
    switch (connType.id) {
      case 'hierarchical':
        return `Example: "${target.label} is a type/component/part of ${source.label} because..."`;
      case 'sequential':
        return `Example: "${source.label} happens before ${target.label} because..."`;
      case 'causal':
        return `Example: "${source.label} causes or enables ${target.label} because..."`;
      case 'comparative':
        return `Example: "${source.label} and ${target.label} are similar but differ in..."`;
      case 'functional':
        return `Example: "${source.label} works with ${target.label} to accomplish..."`;
      default:
        return "Describe how these concepts are related...";
    }
  }
  
  // Filter function to sort concepts within each type by importance
  function sortByImportance(a, b) {
    // First sort by importance (high to low)
    if (a.importance !== b.importance) {
      return b.importance - a.importance;
    }
    // Then alphabetically
    return a.label.localeCompare(b.label);
  }
</script>

<div class="connection-creator">
  <div class="creator-header">
    <h3>Create Connection</h3>
    <button class="toggle-button" on:click={toggleForm}>
      {#if showForm}
        Cancel
      {:else}
        {selectedSource ? `Connect ${selectedSource.label} to...` : 'Create New Connection'}
      {/if}
    </button>
  </div>
  
  {#if showForm}
    <div class="connection-form">
      <!-- Source Concept Selection -->
      <div class="form-group">
        <label for="source-concept">Source Concept</label>
        <select id="source-concept" bind:value={sourceId} disabled={!!selectedConcept}>
          <option value="">Select a concept...</option>
          {#each Object.entries(conceptsByType) as [type, typeConcepts]}
            <optgroup label={nodeTypes.find(t => t.id === type)?.label || type}>
              {#each typeConcepts.sort(sortByImportance) as concept}
                <option value={concept.id}>{concept.label}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
      </div>
      
      <!-- Target Concept Selection -->
      <div class="form-group">
        <label for="target-concept">Target Concept</label>
        <select id="target-concept" bind:value={targetId}>
          <option value="">Select a concept...</option>
          {#each Object.entries(conceptsByType) as [type, typeConcepts]}
            <optgroup label={nodeTypes.find(t => t.id === type)?.label || type}>
              {#each typeConcepts.filter(c => c.id !== sourceId).sort(sortByImportance) as concept}
                <option value={concept.id}>{concept.label}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
      </div>
      
      <!-- Connection Type Selection -->
      <div class="form-group">
        <label for="connection-type">Connection Type</label>
        <select id="connection-type" bind:value={connectionType}>
          {#each connectionTypes as type}
            <option value={type.id}>{type.label}</option>
          {/each}
        </select>
        {#if selectedConnectionType}
          <div class="connection-description">
            {selectedConnectionType.description}
          </div>
        {/if}
      </div>
      
      <!-- Connection Preview -->
      <div class="connection-preview">
        {#if selectedSource && selectedTarget}
          <div class="preview-content">
            <div class="preview-node source">
              <span class="node-type-indicator" 
                    style="background-color: {nodeTypes.find(t => t.id === selectedSource.type)?.color}">
              </span>
              <span>{selectedSource.label}</span>
            </div>
            <div class="preview-arrow">→</div>
            <div class="preview-node target">
              <span class="node-type-indicator" 
                    style="background-color: {nodeTypes.find(t => t.id === selectedTarget.type)?.color}">
              </span>
              <span>{selectedTarget.label}</span>
            </div>
          </div>
          
          <!-- Essential Knowledge Reference (if applicable) -->
          {#if relatedLO}
            <div class="ek-reference">
              <h4>Reference Learning Objective</h4>
              <div class="lo-content">
                <strong>{relatedLO.id}:</strong> {relatedLO.description}
              </div>
            </div>
          {/if}
          
          <div class="preview-statement">
            {#if suggestionPrompt}
              <p class="suggestion">{suggestionPrompt}</p>
            {/if}
          </div>
        {:else}
          <div class="preview-placeholder">
            Select source and target concepts to preview connection
          </div>
        {/if}
      </div>
      
      <!-- Connection Description -->
      <div class="form-group">
        <label for="connection-description">Relationship Description</label>
        <textarea 
          id="connection-description" 
          placeholder="Describe how these concepts are related to each other..."
          rows="3"
          bind:value={description}
        ></textarea>
      </div>
      
      <!-- Error Message (if any) -->
      {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="form-actions">
        <button class="cancel-button" on:click={toggleForm}>Cancel</button>
        <button class="create-button" on:click={createConnection}>Create Connection</button>
      </div>
    </div>
  {:else}
    <!-- Connection Tips -->
    <div class="connection-tips">
      <p>Creating connections between concepts helps build a deeper understanding of how they relate to each other.</p>
      
      <h4>Connection Types:</h4>
      <ul>
        <li><strong>Hierarchical:</strong> One concept is a type/part of another</li>
        <li><strong>Sequential:</strong> One concept happens before another</li>
        <li><strong>Causal:</strong> One concept causes or enables another</li>
        <li><strong>Functional:</strong> Concepts work together to accomplish something</li>
        <li><strong>Comparative:</strong> Concepts are similar but different in specific ways</li>
      </ul>
      
      <p class="tip"><strong>AP Exam Tip:</strong> Understanding relationships between concepts is essential for the AP CSP exam. Focus on creating meaningful connections that show how computing systems and networks work together.</p>
    </div>
  {/if}
</div>

<style>
  .connection-creator {
    margin-top: 1.5rem;
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
  }
  
  .creator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .creator-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .toggle-button {
    background-color: #1890ff;
    color: white;
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  .toggle-button:hover {
    background-color: #096dd9;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  select, textarea {
    width: 100%;
    padding: 0.375rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .connection-description {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
    font-style: italic;
  }
  
  .connection-preview {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f0f2f5;
    border-radius: 4px;
    border: 1px solid #e8e8e8;
  }
  
  .preview-content {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
  }
  
  .preview-node {
    padding: 0.5rem 0.75rem;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    font-size: 0.9rem;
  }
  
  .node-type-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.5rem;
    display: inline-block;
  }
  
  .preview-arrow {
    margin: 0 1rem;
    font-size: 1.5rem;
    color: #666;
  }
  
  .preview-statement {
    text-align: center;
    font-size: 0.9rem;
  }
  
  .suggestion {
    font-style: italic;
    color: #666;
  }
  
  .preview-placeholder {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
  }
  
  .ek-reference {
    background-color: #e6f7ff;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
  }
  
  .ek-reference h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #1890ff;
  }
  
  .lo-content {
    line-height: 1.4;
  }
  
  .error-message {
    background-color: #fff2f0;
    color: #f5222d;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    border: 1px solid #ffccc7;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .cancel-button, .create-button {
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    border: none;
  }
  
  .cancel-button {
    background-color: #f5f5f5;
    color: #595959;
    border: 1px solid #d9d9d9;
  }
  
  .create-button {
    background-color: #52c41a;
    color: white;
  }
  
  .connection-tips {
    font-size: 0.9rem;
  }
  
  .connection-tips h4 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }
  
  .connection-tips ul {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .connection-tips li {
    margin-bottom: 0.25rem;
  }
  
  .tip {
    background-color: #f6ffed;
    padding: 0.75rem;
    border-left: 3px solid #52c41a;
    border-radius: 0 4px 4px 0;
    margin-top: 0.5rem;
  }
</style>
