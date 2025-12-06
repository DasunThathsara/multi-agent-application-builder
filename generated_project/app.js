// app.js - Core Todo functionality for ColorfulTodo
// ---------------------------------------------------
// This module defines the Todo class, application state, persistence helpers,
// rendering logic, and UI event handling. It is designed to work with the
// static DOM defined in index.html and the styling in styles.css.

// Expose a namespace on the global `window` object for later extensions
// (e.g., drag‑and‑drop, keyboard shortcuts).
;(function () {
    // ---------- Todo Model ----------
    /**
     * Represents a single todo item.
     * @param {number|string} id - Unique identifier.
     * @param {string} text - The todo description.
     * @param {boolean} [completed=false] - Completion status.
     */
    function Todo(id, text, completed = false) {
        this.id = id;
        this.text = text;
        this.completed = completed;
    }

    // Convert the instance to a plain object for JSON.stringify.
    Todo.prototype.toJSON = function () {
        return {
            id: this.id,
            text: this.text,
            completed: this.completed,
        };
    };

    // ---------- Application State ----------
    const state = {
        todos: [], // Array of Todo instances
        filter: 'all', // 'all' | 'active' | 'completed'
    };

    // ---------- Persistence ----------
    const STORAGE_KEY = 'colorfulTodo';

    /** Load todos from localStorage and populate state.todos */
    function loadTodos() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            state.todos = [];
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            // Ensure we always have Todo instances (not plain objects)
            state.todos = parsed.map(item => new Todo(item.id, item.text, item.completed));
        } catch (e) {
            console.error('Failed to parse stored todos:', e);
            state.todos = [];
        }
    }

    /** Save the current todos to localStorage */
    function saveTodos() {
        const data = state.todos.map(todo => todo.toJSON());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // ---------- Rendering ----------
    const todoListEl = document.getElementById('todo-list');

    /**
     * Escape HTML special characters to prevent injection
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Create a DOM <li> element representing a todo.
     * @param {Todo} todo
     * @returns {HTMLLIElement}
     */
    function renderTodoItem(todo) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = todo.id;
        li.setAttribute('role', 'listitem');
        // Enable drag‑and‑drop and keyboard focus
        li.setAttribute('draggable', 'true');
        li.setAttribute('tabindex', '0');

        const checkedAttr = todo.completed ? 'checked' : '';
        li.innerHTML = `
            <input type="checkbox" class="toggle" aria-label="Mark as completed" ${checkedAttr} />
            <span class="todo-text" ${todo.completed ? 'aria-checked="true"' : ''}>${escapeHtml(todo.text)}</span>
            <button class="edit-btn" aria-label="Edit todo">✏️</button>
            <button class="delete-btn" aria-label="Delete todo">🗑️</button>
        `;
        return li;
    }

    /** Render the todo list according to the current filter */
    function renderTodoList() {
        // Clear existing items
        todoListEl.innerHTML = '';
        const filtered = state.todos.filter(todo => {
            if (state.filter === 'all') return true;
            if (state.filter === 'active') return !todo.completed;
            if (state.filter === 'completed') return todo.completed;
            return true;
        });
        filtered.forEach(todo => {
            const itemEl = renderTodoItem(todo);
            todoListEl.appendChild(itemEl);
        });
        // After rendering, (re)attach drag‑and‑drop handlers
        initDragAndDrop();
        // (re)attach selection handlers
        initSelectionHandlers();
    }

    // ---------- Drag & Drop ----------
    /**
     * Initialise drag‑and‑drop listeners on each .todo-item.
     * This function is called after every render to ensure listeners are attached
     * to the fresh DOM nodes.
     */
    function initDragAndDrop() {
        const items = todoListEl.querySelectorAll('.todo-item');
        // Replace each item with a clone to remove any previously attached listeners.
        items.forEach(item => {
            const newItem = item.cloneNode(true);
            item.replaceWith(newItem);
        });
        const freshItems = todoListEl.querySelectorAll('.todo-item');
        freshItems.forEach(item => {
            item.addEventListener('dragstart', onDragStart);
            item.addEventListener('dragover', onDragOver);
            item.addEventListener('dragleave', onDragLeave);
            item.addEventListener('drop', onDrop);
            item.addEventListener('dragend', onDragEnd);
        });
    }

    let draggingEl = null;

    function onDragStart(e) {
        draggingEl = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggingEl.dataset.id);
        draggingEl.classList.add('dragging');
    }

    function onDragOver(e) {
        e.preventDefault(); // Necessary to allow a drop
        const target = e.currentTarget;
        if (target === draggingEl) return;
        target.classList.add('drag-over');
    }

    function onDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function onDrop(e) {
        e.preventDefault();
        const target = e.currentTarget;
        target.classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        const draggedIdx = state.todos.findIndex(t => String(t.id) === draggedId);
        const targetIdx = state.todos.findIndex(t => String(t.id) === target.dataset.id);
        if (draggedIdx === -1 || targetIdx === -1 || draggedIdx === targetIdx) return;
        const [moved] = state.todos.splice(draggedIdx, 1);
        // Insert at the target's index. Adjust if the item was removed from a lower index.
        const insertIdx = draggedIdx < targetIdx ? targetIdx - 1 : targetIdx;
        state.todos.splice(insertIdx, 0, moved);
        saveTodos();
        renderTodoList();
    }

    function onDragEnd(e) {
        if (draggingEl) draggingEl.classList.remove('dragging');
        // Clean any leftover placeholder classes
        const items = todoListEl.querySelectorAll('.todo-item');
        items.forEach(i => i.classList.remove('drag-over'));
        draggingEl = null;
    }

    // ---------- Selection Handling (Keyboard Shortcuts) ----------
    // Currently selected todo id (null if none selected)
    let selectedTodoId = null;

    /** Apply visual selection state */
    function updateSelectionUI() {
        const items = todoListEl.querySelectorAll('.todo-item');
        items.forEach(item => {
            if (item.dataset.id === selectedTodoId) {
                item.classList.add('selected');
                // Ensure the element is focusable for screen readers
                item.focus();
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /** Set the selected todo by id */
    function setSelectedTodo(id) {
        selectedTodoId = id;
        updateSelectionUI();
    }

    /** Initialise click/focus listeners that update the selected todo */
    function initSelectionHandlers() {
        const items = todoListEl.querySelectorAll('.todo-item');
        items.forEach(item => {
            // Click selects the item
            item.addEventListener('click', () => {
                setSelectedTodo(item.dataset.id);
            });
            // Keyboard focus (tab navigation) also selects
            item.addEventListener('focus', () => {
                setSelectedTodo(item.dataset.id);
            });
        });
    }

    // ---------- Core Shortcut Actions ----------
    /** Toggle completion state of a todo */
    function toggleComplete(id) {
        const todo = state.todos.find(t => String(t.id) === id);
        if (!todo) return;
        todo.completed = !todo.completed;
        saveTodos();
        renderTodoList();
    }

    /** Delete a todo */
    function deleteTodo(id) {
        const before = state.todos.length;
        state.todos = state.todos.filter(t => String(t.id) !== id);
        if (state.todos.length === before) return; // nothing removed
        // If the deleted todo was selected, clear selection
        if (selectedTodoId === id) selectedTodoId = null;
        saveTodos();
        renderTodoList();
    }

    /** Move a todo up or down */
    function moveTodo(id, direction) {
        const idx = state.todos.findIndex(t => String(t.id) === id);
        if (idx === -1) return;
        let newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= state.todos.length) return; // out of bounds
        // Swap positions
        const temp = state.todos[newIdx];
        state.todos[newIdx] = state.todos[idx];
        state.todos[idx] = temp;
        saveTodos();
        renderTodoList();
    }

    // Key mapping for shortcuts
    const keyMap = {
        // Ctrl+Enter => toggle completion of selected todo
        'Ctrl+Enter': () => {
            if (selectedTodoId) toggleComplete(selectedTodoId);
        },
        // Delete => delete selected todo
        'Delete': () => {
            if (selectedTodoId) deleteTodo(selectedTodoId);
        },
        // Ctrl+ArrowUp => move selected todo up
        'Ctrl+ArrowUp': () => {
            if (selectedTodoId) moveTodo(selectedTodoId, 'up');
        },
        // Ctrl+ArrowDown => move selected todo down
        'Ctrl+ArrowDown': () => {
            if (selectedTodoId) moveTodo(selectedTodoId, 'down');
        },
    };

    // Global keydown listener to trigger shortcuts
    document.addEventListener('keydown', (e) => {
        // Build a string representation like 'Ctrl+Enter' or just 'Delete'
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        parts.push(e.key);
        const combo = parts.join('+');
        const action = keyMap[combo];
        if (action) {
            e.preventDefault(); // Prevent default browser actions (e.g., navigation)
            action();
        }
    });

    // ---------- UI Event Handlers ----------
    const newTodoInput = document.getElementById('new-todo');
    const addBtn = document.getElementById('add-btn');
    const filterButtons = document.querySelectorAll('.filter');

    // Add a new todo (used by both button click and Enter key)
    function addTodoFromInput() {
        const text = newTodoInput.value.trim();
        if (!text) return;
        const todo = new Todo(Date.now(), text, false);
        state.todos.push(todo);
        saveTodos();
        renderTodoList();
        newTodoInput.value = '';
    }

    addBtn.addEventListener('click', addTodoFromInput);
    newTodoInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTodoFromInput();
        }
    });

    // Delegated handling for toggle, edit, delete within the list
    todoListEl.addEventListener('click', function (e) {
        const target = e.target;
        const li = target.closest('li.todo-item');
        if (!li) return; // click outside a todo item
        const id = li.dataset.id;
        const todo = state.todos.find(t => String(t.id) === id);
        if (!todo) return;

        // Toggle completion
        if (target.classList.contains('toggle')) {
            todo.completed = target.checked;
            saveTodos();
            renderTodoList();
            return;
        }

        // Delete todo
        if (target.classList.contains('delete-btn')) {
            state.todos = state.todos.filter(t => String(t.id) !== id);
            saveTodos();
            renderTodoList();
            return;
        }

        // Edit todo
        if (target.classList.contains('edit-btn')) {
            const newText = prompt('Edit todo:', todo.text);
            if (newText !== null) {
                const trimmed = newText.trim();
                if (trimmed) {
                    todo.text = trimmed;
                    saveTodos();
                    renderTodoList();
                }
            }
            return;
        }
    });

    // Filter buttons handling
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = btn.dataset.filter;
            if (filter) {
                state.filter = filter;
                // Update active UI state (optional visual cue)
                filterButtons.forEach(b => b.classList.toggle('active', b === btn));
                renderTodoList();
            }
        });
    });

    // ---------- Initialization ----------
    loadTodos();
    renderTodoList();

    // Expose public API via window.app for later extensions.
    window.app = {
        Todo,
        state,
        loadTodos,
        saveTodos,
        renderTodoList,
        renderTodoItem,
        // Expose shortcut helpers for potential external use
        toggleComplete,
        deleteTodo,
        moveTodo,
        // expose selection getter for debugging
        getSelectedTodoId: () => selectedTodoId,
    };
})();
