\
<script>
  import { onMount } from 'svelte';
  import ConstellationGraph from './components/Graph/ConstellationGraph.svelte';
  import ConceptDetail from './components/Details/ConceptDetail.svelte';
  import ProgressTracker from './components/Progress/ProgressTracker.svelte';
  import QuestionPanel from './components/Details/QuestionPanel.svelte';
  import ConnectionCreator from './components/Creation/ConnectionCreator.svelte';
  import { concepts, baseConnections, sampleQuestions, defaultProgress } from './lib/data/concepts';
  import { writable } from 'svelte/store';
  
  // Reactive stores
  const conceptsStore = writable(concepts);
  const connectionsStore = writable(baseConnections);
  const questionsStore = writable(sampleQuestions);
  
  // Set up progress store and load from localStorage if available
  let progressStore;
  onMount(() => {
    const savedProgress = localStorage.getItem('ap-csp-progress');
    progressStore = writable(savedProgress ? JSON.parse(savedProgress) : defaultProgress);
    
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
  let selectedQuestion = null;
  
  // Handle selecting a concept
  function handleConceptSelect(event) {
    selectedConcept = event.detail;
    selectedQuestion = null;
  }
  
  // Handle selecting a question
  function handleQuestionSelect(event) {
    selectedQuestion = event.detail;
    // Optionally select the related concepts
    if (selectedQuestion && selectedQuestion.conceptIds && selectedQuestion.conceptIds.length > 0) {
      const conceptId = selectedQuestion.conceptIds[0];
      selectedConcept = $conceptsStore.find(c => c.id === conceptId);
    }
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
  let filterByStatus = 'all';
  let searchTerm = '';
  
  // Computed filtered concepts
  $: filteredConcepts = $conceptsStore.filter(concept => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
                         concept.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         concept.description.toLowerCase().includes(searchTerm.toLowerCase());
                         
    // Filter by status
    const matchesStatus = filterByStatus === 'all' || 
                          (progressStore && $progressStore[concept.id] === filterByStatus);
                          
    return matchesSearch && matchesStatus;
  });
</script>

<main>
  <header>
    <h1>AP CSP Review: Concept Constellation</h1>
    <div class="filters">
      <input 
        type="text" 
        placeholder="Search concepts..." 
        bind:value={searchTerm}
      />
      <select bind:value={filterByStatus}>
        <option value="all">All Concepts</option>
        <option value="mastered">Mastered</option>
        <option value="in-progress">In Progress</option>
        <option value="not-started">Not Started</option>
      </select>
    </div>
  </header>
  
  <div class="constellation-container">
    <ConstellationGraph 
      concepts={filteredConcepts}
      connections={$connectionsStore}
      progress={$progressStore}
      on:select={handleConceptSelect}
    />
    
    <div class="sidebar">
      {#if selectedConcept}
        <ConceptDetail 
          concept={selectedConcept}
          progress={$progressStore[selectedConcept.id] || 'not-started'}
          on:progressUpdate={handleProgressUpdate}
        />
        
        <QuestionPanel
          questions={$questionsStore.filter(q => 
            q.conceptIds.includes(selectedConcept.id)
          )}
          on:select={handleQuestionSelect}
        />
      {:else if selectedQuestion}
        <div class="question-detail">
          <h2>Question Detail</h2>
          <p class="question">{selectedQuestion.question}</p>
          <div class="options">
            {#each selectedQuestion.options as option, i}
              <div class="option" class:correct={String.fromCharCode(65 + i) === selectedQuestion.correctAnswer}>
                {option}
              </div>
            {/each}
          </div>
          <div class="related-concepts">
            <h3>Related Concepts</h3>
            <ul>
              {#each selectedQuestion.conceptIds as conceptId}
                {#if $conceptsStore.find(c => c.id === conceptId)}
                  <li>{$conceptsStore.find(c => c.id === conceptId).label}</li>
                {/if}
              {/each}
            </ul>
          </div>
          <p class="justification"><strong>Why This Connection:</strong> {selectedQuestion.justification}</p>
        </div>
      {:else}
        <div class="instructions">
          <h2>Concept Constellation</h2>
          <p>Click on a concept in the graph to see details and track your understanding.</p>
          <p>Create connections between concepts to enhance your understanding of how they relate.</p>
          <p>Review AP exam questions mapped to specific concepts.</p>
        </div>
      {/if}
      
      <ConnectionCreator 
        concepts={$conceptsStore}
        on:create={handleNewConnection}
      />
    </div>
  </div>
  
  <footer>
    <div class="progress-summary">
      <h3>Your Progress</h3>
      <ProgressTracker 
        concepts={$conceptsStore}
        progress={$progressStore}
        on:update={handleProgressUpdate}
      />
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
  }
  
  header {
    padding: 1rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
  }
  
  .constellation-container {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  
  .sidebar {
    width: 350px;
    padding: 1rem;
    background-color: #f9f9f9;
    border-left: 1px solid #ddd;
    overflow-y: auto;
  }
  
  footer {
    padding: 1rem;
    background-color: #f5f5f5;
    border-top: 1px solid #ddd;
  }
  
  .question-detail {
    margin-bottom: 2rem;
  }
  
  .options {
    margin: 1rem 0;
  }
  
  .option {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .option.correct {
    background-color: #e6f7e6;
    border-color: #c3e6cb;
  }
  
  .instructions {
    padding: 1rem;
    background-color: #f0f8ff;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .related-concepts ul {
    padding-left: 1.5rem;
  }
  
  .justification {
    font-style: italic;
    margin-top: 1rem;
  }
</style>
