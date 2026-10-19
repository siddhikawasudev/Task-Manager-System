
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const taskFilter = document.getElementById("taskFilter");
const taskSearch = document.getElementById("taskSearch");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

// Load saved tasks from browser storage.
let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("taskflow_tasks")
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string"
        );
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

// Save tasks.
function saveTasks() {
    try {
        localStorage.setItem(
            "taskflow_tasks",
            JSON.stringify(tasks)
        );
    } catch (error) {
        alert("Could not save tasks in this browser.");
        console.error(error);
    }
}

// Update dashboard statistics.
function updateStats() {
    const completed = tasks.filter(
        task => task.completed
    ).length;

    if (totalTasks) totalTasks.textContent = tasks.length;
    if (completedTasks) completedTasks.textContent = completed;
    if (pendingTasks) pendingTasks.textContent = tasks.length - completed;
}

// Get today's date in local YYYY-MM-DD format.
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Render tasks based on search and filter.
function renderTasks() {
    if (!taskList || !taskFilter || !taskSearch) return;

    taskList.replaceChildren();

    const filter = taskFilter.value;
    const searchText = taskSearch.value.trim().toLowerCase();

    const visibleTasks = tasks.filter(task => {
        const matchesSearch = task.title
            .toLowerCase()
            .includes(searchText);

        const matchesFilter =
            (filter === "All" || filter === "all") ||
            ((filter === "Completed" || filter === "completed") && task.completed) ||
            ((filter === "Pending" || filter === "pending") && !task.completed);

        return matchesSearch && matchesFilter;
    });

    if (emptyMessage) {
        emptyMessage.hidden = visibleTasks.length > 0;

        if (tasks.length === 0) {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        } else {
            emptyMessage.textContent =
                "No tasks match your search or filter.";
        }
    }

    visibleTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        // Completion checkbox.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.completed);
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        // Task details.
        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        if (task.completed) {
            title.classList.add("completed");
        }

        const priority = document.createElement("span");
        priority.className =
            "priority " + (task.priority || "Medium").toLowerCase();
        priority.textContent = (task.priority || "Medium") + " priority";

        details.append(title, priority);

        // Due date and overdue warning.
        if (task.dueDate) {
            const dueDate = document.createElement("span");
            dueDate.className = "due-date";

            const today = getTodayString();

            if (!task.completed && task.dueDate < today) {
                dueDate.classList.add("overdue");
                dueDate.textContent = "Overdue: " + task.dueDate;
            } else {
                dueDate.textContent = "Due: " + task.dueDate;
            }

            details.appendChild(dueDate);
        }

        // Edit button.
        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", "Edit " + task.title);

        editButton.addEventListener("click", () => {
    editTask(task);
});

        // Delete button.
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(`Delete "${task.title}"?`);

            if (!confirmed) return;

            tasks = tasks.filter(
                currentTask => currentTask.id !== task.id
            );

            saveTasks();
            renderTasks();
        });

        item.append(checkbox, details, editButton, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}

// Edit title, priority, and due date.

function editTask(task) {
    console.log("Edit task started:", task);

    const newTitle = window.prompt(
        "Edit task title:",
        task.title
    );

    console.log("Title prompt result:", newTitle);

    if (newTitle === null) return;

    const cleanedTitle = newTitle.trim();

    if (!cleanedTitle) {
        window.alert("Task title cannot be empty.");
        return;
    }

    const newPriority = window.prompt(
        "Enter priority: High, Medium, or Low",
        task.priority || "Medium"
    );

    if (newPriority === null) return;

    const priorityOptions = {
        high: "High",
        medium: "Medium",
        low: "Low"
    };

    const cleanedPriority = newPriority.trim().toLowerCase();

    if (!priorityOptions[cleanedPriority]) {
        window.alert("Please enter High, Medium, or Low.");
        return;
    }

    const newDueDate = window.prompt(
        "Enter due date as YYYY-MM-DD, or leave blank for no due date:",
        task.dueDate || ""
    );

    if (newDueDate === null) return;

    const cleanedDate = newDueDate.trim();

    if (cleanedDate && !/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
        window.alert(
            "Please enter the date in YYYY-MM-DD format, or leave it blank."
        );
        return;
    }

    task.title = cleanedTitle;
    task.priority = priorityOptions[cleanedPriority];
    task.dueDate = cleanedDate;

    saveTasks();
    renderTasks();

    console.log("Task updated successfully.");
}


// Add a new task.
if (taskForm) {
    taskForm.addEventListener("submit", event => {
        event.preventDefault();

        const title = taskInput.value.trim();

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const task = {
            id: Date.now().toString() +
                Math.random().toString(16).slice(2),
            title: title,
            priority: taskPriority ? taskPriority.value : "Medium",
            dueDate: taskDueDate ? taskDueDate.value : "",
            completed: false
        };

        tasks.push(task);
        saveTasks();

        taskInput.value = "";

        if (taskPriority) taskPriority.value = "Medium";
        if (taskDueDate) taskDueDate.value = "";
        if (taskSearch) taskSearch.value = "";
        if (taskFilter) {
            taskFilter.value =
                [...taskFilter.options].some(option => option.value === "All")
                    ? "All"
                    : "all";
        }

        renderTasks();
        taskInput.focus();
    });
}

// Search and filter.
if (taskSearch) {
    taskSearch.addEventListener("input", renderTasks);
}

if (taskFilter) {
    taskFilter.addEventListener("change", renderTasks);
}

// Show the logged-in user's name.
const currentUserData = localStorage.getItem("taskflow_current_user");

if (currentUserData) {
    try {
        const currentUser = JSON.parse(currentUserData);
        const userName = document.getElementById("userName");

        if (userName && currentUser.name) {
            userName.textContent = currentUser.name;
        }
    } catch (error) {
        console.error("Could not read user information.");
    }
}

// Log out and return to the login page.
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("taskflow_current_user");
        window.location.replace("login.html");
    });
}

// Initial display.
renderTasks();

// Apply saved theme across TaskFlow pages.
(function applySavedTheme() {
    const savedTheme = localStorage.getItem("taskflow_theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
})();