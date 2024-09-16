// Select DOM elements
const addNoteBtn = document.getElementById('add-note-btn');
const noteInput = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');
const toggleThemeBtn = document.getElementById('toggle-theme-btn');

let dragSrcEl = null;

// Load notes and theme from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  loadTheme();
});

// Function to load notes from localStorage
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.forEach(note => addNoteToDOM(note));
}

// Function to load theme from localStorage
function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    toggleThemeBtn.textContent = 'Light Theme';
  } else {
    toggleThemeBtn.textContent = 'Dark Theme';
  }
}

// Function to save notes to localStorage
function saveNotes() {
  const notes = [];
  document.querySelectorAll('.note-item').forEach(item => {
    const noteText = item.querySelector('.note-text').textContent;
    notes.push(noteText);
  });
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Function to add a note to the DOM
function addNoteToDOM(text) {
  const li = document.createElement('li');
  li.className = 'note-item';
  li.setAttribute('draggable', 'true');

  const span = document.createElement('span');
  span.className = 'note-text';
  span.textContent = text;

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = 'Edit';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';

  // Event listener to delete the note
  deleteBtn.addEventListener('click', () => {
    notesList.removeChild(li);
    saveNotes();
  });

  // Event listener to edit the note
  editBtn.addEventListener('click', () => {
    editNote(span, li);
  });

  // Add drag event listeners
  addDragAndDropHandlers(li);

  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  notesList.appendChild(li);
}

// Function to handle editing a note
function editNote(span, li) {
  const currentText = span.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'edit-input';

  // Replace the span with the input field
  li.replaceChild(input, span);
  input.focus();

  // Change the Edit button to Save
  const editBtn = li.querySelector('.edit-btn');
  editBtn.textContent = 'Save';

  // Remove previous event listeners by cloning the button
  const newEditBtn = editBtn.cloneNode(true);
  editBtn.parentNode.replaceChild(newEditBtn, editBtn);

  // Add new event listener for saving
  newEditBtn.addEventListener('click', () => {
    const updatedText = input.value.trim();
    if (updatedText !== "") {
      span.textContent = updatedText;
      li.replaceChild(span, input);
      newEditBtn.textContent = 'Edit';
      saveNotes();
    } else {
      alert('Note cannot be empty.');
      input.focus();
    }
  });
}

// Function to handle drag and drop events
function addDragAndDropHandlers(item) {
  item.addEventListener('dragstart', handleDragStart);
  item.addEventListener('dragover', handleDragOver);
  item.addEventListener('dragenter', handleDragEnter);
  item.addEventListener('dragleave', handleDragLeave);
  item.addEventListener('drop', handleDrop);
  item.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);

  this.classList.add('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  if (dragSrcEl !== this) {
    // Swap the innerHTML of the dragged and dropped elements
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');

    // Reattach event listeners to the swapped elements
    const draggedEditBtn = dragSrcEl.querySelector('.edit-btn');
    const draggedDeleteBtn = dragSrcEl.querySelector('.delete-btn');
    addEventListenersAfterDrop(dragSrcEl, draggedEditBtn, draggedDeleteBtn);

    const droppedEditBtn = this.querySelector('.edit-btn');
    const droppedDeleteBtn = this.querySelector('.delete-btn');
    addEventListenersAfterDrop(this, droppedEditBtn, droppedDeleteBtn);
  }

  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.note-item').forEach(item => {
    item.classList.remove('over');
  });
  saveNotes();
}

// Function to reattach event listeners after swapping
function addEventListenersAfterDrop(item, editBtn, deleteBtn) {
  // Reattach delete event
  deleteBtn.addEventListener('click', () => {
    notesList.removeChild(item);
    saveNotes();
  });

  // Reattach edit event
  editBtn.addEventListener('click', () => {
    const span = item.querySelector('.note-text');
    editNote(span, item);
  });

  // Reattach drag event listeners
  addDragAndDropHandlers(item);
}

// Event listener to add a new note
addNoteBtn.addEventListener('click', () => {
  const noteText = noteInput.value.trim();

  if (noteText !== "") {
    addNoteToDOM(noteText);
    saveNotes();
    noteInput.value = '';
  } else {
    alert('Please enter a note.');
  }
});

// Allow adding notes by pressing Enter key
noteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addNoteBtn.click();
  }
});

// Event listener to toggle between light and dark themes
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');

  if (document.body.classList.contains('dark-theme')) {
    toggleThemeBtn.textContent = 'Light Theme';
    localStorage.setItem('theme', 'dark');
  } else {
    toggleThemeBtn.textContent = 'Dark Theme';
    localStorage.setItem('theme', 'light');
  }
});
