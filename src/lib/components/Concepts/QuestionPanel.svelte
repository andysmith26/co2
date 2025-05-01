
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let questions = [];
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle question selection
  function selectQuestion(question) {
    dispatch('select', question);
  }
  
  // Local state
  let showAddForm = false;
  let newQuestion = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 'A',
    conceptIds: [],
    justification: ''
  };
  
  // Reset form
  function resetForm() {
    newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      conceptIds: [],
      justification: ''
    };
  }
  
  // Toggle add form
  function toggleAddForm() {
    showAddForm = !showAddForm;
    if (!showAddForm) {
      resetForm();
    }
  }
  
  // Get correct answer letter
  function getOptionLetter(index) {
    return String.fromCharCode(65 + index); // A, B, C, D
  }
</script>

<div class="question-panel">
  <div class="panel-header">
    <h3>AP Exam Questions</h3>
    <button class="add-button" on:click={toggleAddForm}>
      {showAddForm ? 'Cancel' : 'Add Question'}
    </button>
  </div>
  
  {#if questions.length === 0 && !showAddForm}
    <div class="no-questions">
      <p>No questions mapped to this concept yet.</p>
      <p>Click "Add Question" to create a practice question for this concept.</p>
    </div>
  {:else}
    <div class="question-list">
      {#each questions as question (question.id)}
        <div class="question-item" on:click={() => selectQuestion(question)}>
          <div class="question-preview">
            {question.question.length > 100 
              ? question.question.substring(0, 100) + '...' 
              : question.question}
          </div>
          <div class="question-meta">
            <span class="correct-answer">Answer: {question.correctAnswer}</span>
            <span class="question-concepts">{question.conceptIds.length} concept{question.conceptIds.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  {#if showAddForm}
    <div class="question-form">
      <h4>Create New Practice Question</h4>
      
      <div class="form-group">
        <label for="question-text">Question</label>
        <textarea 
          id="question-text" 
          rows="3" 
          placeholder="Enter your question here..."
          bind:value={newQuestion.question}
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Answer Choices</label>
        {#each newQuestion.options as option, index}
          <div class="option-input">
            <div class="option-letter">{getOptionLetter(index)}</div>
            <input 
              type="text" 
              placeholder={`Option ${getOptionLetter(index)}`}
              bind:value={newQuestion.options[index]}
            />
            <input 
              type="radio" 
              name="correct-answer" 
              value={getOptionLetter(index)} 
              bind:group={newQuestion.correctAnswer}
            />
          </div>
        {/each}
      </div>
      
      <div class="form-group">
        <label for="question-justification">Justification</label>
        <textarea 
          id="question-justification" 
          rows="2" 
          placeholder="Explain why this question connects to the selected concept(s)..."
          bind:value={newQuestion.justification}
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button class="cancel-button" on:click={toggleAddForm}>Cancel</button>
        <button class="save-button">Save Question</button>
      </div>
    </div>
  {/if}
  
  <div class="question-tips">
    <h4>Creating Effective AP Questions</h4>
    <ul>
      <li>Focus on application of concepts, not just recall</li>
      <li>Use scenarios that require analyzing a situation</li>
      <li>Make sure all distractors (wrong answers) are plausible</li>
      <li>Connect questions to multiple related concepts when possible</li>
      <li>Match the style and complexity of actual AP questions</li>
    </ul>
  </div>
</div>

<style>
  .question-panel {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .add-button {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  .no-questions {
    text-align: center;
    padding: 1rem;
    color: #6c757d;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .question-list {
    margin-bottom: 1.5rem;
  }
  
  .question-item {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .question-item:hover {
    background-color: #f8f9fa;
  }
  
  .question-preview {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .question-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .question-form {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .question-form h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
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
  
  textarea, input[type="text"] {
    width: 100%;
    padding: 0.375rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .option-input {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .option-letter {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e9ecef;
    border-radius: 50%;
    margin-right: 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  input[type="radio"] {
    margin-left: 0.5rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .cancel-button, .save-button {
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    border: none;
  }
  
  .cancel-button {
    background-color: #6c757d;
    color: white;
  }
  
  .save-button {
    background-color: #28a745;
    color: white;
  }
  
  .question-tips {
    background-color: #e9ecef;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .question-tips h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .question-tips ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .question-tips li {
    margin-bottom: 0.25rem;
  }
</style>
