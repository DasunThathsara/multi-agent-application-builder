# Project Title: To-Do List Web App

---

## Description

A simple, responsive, and feature‑rich **To‑Do List** web application built with vanilla JavaScript, HTML5, and CSS3. It allows users to manage tasks efficiently with capabilities such as adding, editing, deleting, marking as complete, filtering, drag‑and‑drop reordering, and keyboard shortcuts for rapid interaction.

---

## Screenshot

> **[Insert screenshot here]**
>
> ![App Screenshot](./assets/screenshot.png)

---

## Tech Stack

- **HTML5** – Semantic markup and layout.
- **CSS3** – Styling, Flexbox/Grid layout, and responsive design.
- **JavaScript (ES6+)** – Core application logic, DOM manipulation, and event handling.
- **LocalStorage** – Persists tasks between sessions (no backend required).

---

## Features

- **Add Tasks** – Quickly create new to‑do items.
- **Edit Tasks** – Inline editing of task titles.
- **Delete Tasks** – Remove unwanted items.
- **Mark as Complete** – Toggle completion status.
- **Filter Views** – Show All / Active / Completed tasks.
- **Drag‑and‑Drop Reordering** – Rearrange tasks via mouse or touch.
- **Keyboard Shortcuts** –
  - `Enter` – Add a new task.
  - `Esc` – Cancel editing.
  - `Ctrl + A` – Focus the input field.
  - Arrow keys for navigating the list when editing.
- **Persisted State** – All changes are saved to `localStorage`.

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```
2. **Open the application**
   - Locate `index.html` in the project root.
   - Open it directly in any modern web browser (Chrome, Firefox, Edge, Safari).
   - No additional server or build steps are required.

---

## Usage Guide

### Adding a Task
- Type the task description into the input field at the top.
- Press **Enter** or click the **Add** button.

### Editing a Task
- Double‑click a task's text or press **Enter** while the task is focused.
- Modify the text inline.
- Press **Enter** to save or **Esc** to cancel.

### Deleting a Task
- Click the **trash** icon (🗑️) on the right side of a task.

### Completing a Task
- Click the checkbox next to a task or press **Space** while the task is focused.
- Completed tasks are visually distinguished (strikethrough) and moved to the bottom of the list.

### Filtering Tasks
- Use the filter buttons **All**, **Active**, and **Completed** at the bottom of the list to toggle visibility.

### Drag‑and‑Drop Reordering
- Click and hold a task, then drag it to the desired position.
- Release the mouse button (or lift your finger on touch devices) to drop it.
- The new order is saved automatically.

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + A` | Focus the new‑task input field |
| `Enter` (on input) | Add a new task |
| `Enter` (on a task) | Begin editing |
| `Esc` (while editing) | Cancel edit |
| `Space` (on a task) | Toggle completion |
| Arrow ↑/↓ (while editing) | Move cursor line‑wise |

---

## File Structure Overview

```
project-root/
│
├── index.html            # Main HTML entry point – loads CSS & JS.
├── styles.css            # Global styles, layout, and responsive rules.
├── app.js                # Core JavaScript – task model, UI rendering, event handling.
├── storage.js            # Wrapper around localStorage for saving/loading tasks.
├── dragdrop.js           # Handles drag‑and‑drop logic and visual cues.
├── shortcuts.js          # Registers and processes keyboard shortcuts.
├── README.md             # Project documentation (this file).
└── assets/
    └── screenshot.png   # Placeholder for project screenshot.
```

- **index.html** – Sets up the DOM structure, links stylesheet and scripts.
- **styles.css** – Contains all visual styling, including theme colors and responsive breakpoints.
- **app.js** – Implements the task class, UI updates, and orchestrates interactions between modules.
- **storage.js** – Provides `saveTasks(tasks)` and `loadTasks()` utilities to abstract `localStorage` access.
- **dragdrop.js** – Exposes `enableDragAndDrop(listElement)` to make the task list sortable.
- **shortcuts.js** – Binds global and element‑specific keyboard shortcuts to actions defined in `app.js`.

---

## Future Enhancements

- **Dark Mode** – Toggle between light and dark themes.
- **Due Dates & Reminders** – Add optional deadlines and notification support.
- **Tagging & Categories** – Organise tasks with custom tags.
- **Sync Across Devices** – Integrate with a backend (e.g., Firebase) for cloud persistence.
- **Accessibility Improvements** – ARIA roles, better screen‑reader support, and high‑contrast mode.
- **Unit Tests** – Add Jest or Mocha tests for core logic.

---

## Contribution Guidelines

1. **Fork the repository** and create a new branch for your feature or bug fix.
2. Follow the existing code style (ES6 modules, `const`/`let`, camelCase naming).
3. Keep the UI responsive and ensure new features work on both desktop and mobile browsers.
4. Update this `README.md` if you add new features or change the file structure.
5. Submit a **Pull Request** with a clear description of your changes.
6. Ensure the application still works by opening `index.html` after your changes.

---

*Happy coding!*