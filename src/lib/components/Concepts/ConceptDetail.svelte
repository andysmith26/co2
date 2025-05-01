
<script>
  import { createEventDispatcher } from 'svelte';
  import { nodeTypes } from '../../lib/data/enhanced-concepts';
  
  // Props
  export let concept;
  export let progress = 'not-started';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle progress update
  function updateProgress(status) {
    dispatch('progressUpdate', {
      conceptId: concept.id,
      status
    });
  }
  
  // Progress status options
  const statusOptions = [
    { value: 'mastered', label: 'Mastered', color: '#28a745', icon: '✓' },
    { value: 'in-progress', label: 'In Progress', color: '#ffc107', icon: '...' },
    { value: 'not-started', label: 'Not Started', color: '#dc3545', icon: '!' }
  ];
  
  // Get current status object
  $: currentStatus = statusOptions.find(s => s.value === progress) || statusOptions[2];
  
  // Get node type information
  $: nodeType = nodeTypes.find(t => t.id === concept.type) || 
                { label: 'Concept', color: '#cccccc' };
  
  // Local state for notes
  let notes = '';
  
  // Load saved notes if available
  import { onMount } from 'svelte';
  onMount(() => {
    const savedNotes = localStorage.getItem(`notes-${concept.id}`);
    if (savedNotes) {
      notes = savedNotes;
    }
  });
  
  // Save notes
  function saveNotes() {
    localStorage.setItem(`notes-${concept.id}`, notes);
  }
  
  // Generate AP exam tips based on concept type and importance
  function getExamTips() {
    const tips = [];
    
    if (concept.type === 'learning-objective') {
      tips.push("This is a Learning Objective from the AP CSP framework - focus on understanding all related Essential Knowledge statements.");
    }
    
    if (concept.type === 'vocabulary' && concept.importance >= 4) {
      tips.push("This is a high-importance vocabulary term that frequently appears on the AP exam.");
    }
    
    if (concept.type === 'protocol' && concept.importance >= 4) {
      tips.push("Understanding this protocol's purpose and how it relates to the Internet/WWW is important for the exam.");
    }
    
    // Add specific tips based on concept id or content
    if (concept.id === 'packet-switching' || concept.label.includes('Packet')) {
      tips.push("Packet switching is a fundamental concept for the AP exam - understand how it relates to fault tolerance and reliability.");
    }
    
    if (concept.id === 'internet' || concept.id === 'world-wide-web') {
      tips.push("The distinction between the Internet and World Wide Web is frequently tested on the AP exam.");
    }
    
    if (concept.label.includes('DNS') || concept.id === 'domain-name') {
      tips.push("The DNS translation process from domain names to IP addresses is an important exam concept.");
    }
    
    if (concept.id === 'fault-tolerance' || concept.id === 'redundancy') {
      tips.push("Understand how the Internet's design allows it to function despite failures in individual components.");
    }
    
    // Add generic tip if none are available
    if (tips.length === 0) {
      tips.push("Connect this concept to other key concepts in the framework to deepen your understanding.");
    }
    
    return tips;
  }
  
  // Exam tips for this concept
  $: examTips = getExamTips();
</script>

<div class="concept-detail">
  <div class="concept-header" style="--concept-color: {nodeType.color}">
    <div class="concept-type">{nodeType.label}</div>
    <div class="concept-importance">
      {#if concept.importance}
        <div class="importance-meter">
          {#each Array(5) as _, i}
            <span class="importance-dot" class:filled={i < concept.importance}></span>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
  <h2>{concept.label}</h2>
  <div class="concept-id">{concept.id}</div>
  
  <div class="concept-description">
    <p>{concept.description}</p>
  </div>
  
  <div class="concept-progress">
    <h3>My Understanding</h3>
    <div class="status-buttons">
      {#each statusOptions as status}
        <button 
          class="status-button" 
          class:active={progress === status.value}
          style="--status-color: {status.color}"
          on:click={() => updateProgress(status.value)}
        >
          <span class="status-icon">{status.icon}</span>
          {status.label}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="concept-notes">
    <h3>My Notes</h3>
    <textarea 
      placeholder="Add your notes about this concept here..."
      rows="4"
      bind:value={notes}
      on:blur={saveNotes}
    ></textarea>
  </div>
  
  <div class="concept-tips">
    <h3>AP Exam Tips</h3>
    <ul>
      {#each examTips as tip}
        <li>{tip}</li>
      {/each}
    </ul>
  </div>
  
  {#if concept.type === 'protocol'}
    <div class="concept-extra protocol-info">
      <h3>Protocol Information</h3>
      <p>Protocols are sets of rules that specify how data is transmitted between devices.</p>
      {#if concept.id === 'http'}
        <p>HTTP is used to transfer hypertext documents on the World Wide Web.</p>
      {:else if concept.id === 'https'}
        <p>HTTPS adds encryption for secure communication.</p>
      {:else if concept.id === 'tcp-ip'}
        <p>TCP/IP is the foundation of Internet communication, handling packet delivery and routing.</p>
      {:else if concept.id === 'dns-protocol'}
        <p>DNS translates human-readable domain names to numerical IP addresses.</p>
      {/if}
    </div>
  {:else if concept.type === 'infrastructure'}
    <div class="concept-extra infrastructure-info">
      <h3>Infrastructure Component</h3>
      <p>Network infrastructure components are physical or virtual elements that enable network communication.</p>
    </div>
  {/if}
</div>

<style>
  .concept-detail {
    padding: 1rem;
    border-radius: 6px;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 1.5rem;
  }
  
  .concept-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid var(--concept-color);
  }
  
  .concept-type {
    background-color: var(--concept-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
  
  .importance-meter {
    display: flex;
    gap: 2px;
  }
  
  .importance-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #f0f0f0;
    border: 1px solid #d9d9d9;
  }
  
  .importance-dot.filled {
    background-color: var(--concept-color);
    border-color: var(--concept-color);
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 0.25rem;
    font-size: 1.4rem;
    color: #333;
  }
  
  .concept-id {
    color: #999;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    font-family: monospace;
  }
  
  .concept-description {
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .concept-description p {
    margin: 0;
    color: #333;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #444;
  }
  
  .concept-progress {
    margin-bottom: 1.5rem;
  }
  
  .status-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .status-button {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--status-color);
    background-color: transparent;
    color: var(--status-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9rem;
  }
  
  .status-icon {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }
  
  .status-button.active {
    background-color: var(--status-color);
    color: white;
  }
  
  .concept-notes {
    margin-bottom: 1.5rem;
  }
  
  textarea {
    width: 100%;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0.5rem;
    font-family: inherit;
    resize: vertical;
    font-size: 0.9rem;
  }
  
  .concept-tips {
    background-color: #f9f9f9;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .concept-tips h3 {
    margin-bottom: 0.5rem;
  }
  
  .concept-tips ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .concept-tips li {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .concept-tips li:last-child {
    margin-bottom: 0;
  }
  
  .concept-extra {
    padding: 0.75rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .protocol-info {
    background-color: #e6f7ff;
    border-left: 3px solid #1890ff;
  }
  
  .infrastructure-info {
    background-color: #fff7e6;
    border-left: 3px solid #fa8c16;
  }
  
  .concept-extra h3 {
    margin-bottom: 0.5rem;
  }
  
  .concept-extra p {
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }
  
  .concept-extra p:last-child {
    margin-bottom: 0;
  }
</style>
