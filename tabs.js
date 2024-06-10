let pages = document.querySelector("#pages");
let tabs = [];
let editingTaskIndex = null; // To track the task being edited

function renderTodoPages() {
    let getTodos = localStorage.getItem("todos");
    let todos = getTodos ? JSON.parse(getTodos) : [];
    pages.innerHTML = "";
    tabs = [];

    todos.forEach((todo, index) => {
        if (!todo.tasks) {
            todo.tasks = [];
        }

        let todoDiv = document.createElement("div");
        todoDiv.className = `todo${index + 1} container p-4 shadow-lg`;
        todoDiv.style.display = "none";
        todoDiv.onclick = function () {
            changeTabs(index + 1);
        };
        pages.appendChild(todoDiv);

        tabs.push(todoDiv);
        todoDiv.innerHTML = `
            <h1 class="text-center my-4 fw-bold">${todo.name}</h1>
            <div class="input-group mb-3">
                <input
                    type="text"
                    class="form-control"
                    placeholder="New Task"
                    id="newTodoItemName${index + 1}"
                />
                <button
                    class="input-group-text btn btn-outline-secondary"
                    id="add-btn${index + 1}"
                >
                    + Add
                </button>
            </div>
            <ul class="todo-body${index + 1} list-group list-group-flush"></ul>
            <table class="table text-center table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Completed</th>
                        <th>Uncompleted</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="completed${index + 1}"></td>
                        <td class="uncompleted${index + 1}"></td>
                    </tr>
                </tbody>
            </table>
            <div>
                <button
                    id="clear-btn${index + 1}"
                    class="btn btn-outline-danger text-danger mt-3 text-end fs-5 text-light border-1 fw-bold"
                >
                    Delete All
                </button>
                ${
                    todo.tasks.filter((todo) => todo.isCompleted).length == 0
                        ? ""
                        : `
                        <button
                            id="clear-completed-btn${index + 1}"
                            class="btn btn-outline-danger text-danger mt-3 text-end fs-5 text-light border-1 fw-bold"
                        >
                        Delete Completed
                        </button>
                    `
                }
            </div>
        `;

        renderIsCompletedTable(index, todo);

        const renderTodoTasks = () => {
            let todoBody = document.querySelector(`.todo-body${index + 1}`);
            todoBody.innerHTML = "";
            todo.tasks.forEach((task, taskIndex) => {
                let li = document.createElement("li");
                li.className =
                    "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `
                    <div class="d-flex justify-content-center align-items-center">
                        <i class='d-flex justify-content-center align-items-center me-2 ${
                            task.isCompleted
                                ? "fa-regular fa-circle-check"
                                : "fa-regular fa-circle"
                        }' onclick="setCompleted(event, ${index}, ${taskIndex})"></i>
                        <p class="${
                            task.isCompleted
                                ? "p-0 m-0 text-capitalize text-decoration-line-through"
                                : "p-0 m-0 text-capitalize"
                        }">${task.name}</p>
                    </div>
                    <div class="actions d-flex gap-2">
                        <button class="btn btn-outline-danger edit-task-btn"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn btn-outline-warning delete-task-btn"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                `;
                li.querySelector(".delete-task-btn").onclick = (event) => {
                    deleteTodoTask(event, todos[index].tasks, task.id, index);
                };
                li.querySelector(".edit-task-btn").onclick = (event) => {
                    editTodoTask(event, todos[index].tasks, taskIndex, index);
                };
                todoBody.appendChild(li);
            });
            renderIsCompletedTable(index, todo);
        };

        const handleAddOrEditTodo = (event) => {
            event.preventDefault();
            let newTodoItemName = document.querySelector(
                `#newTodoItemName${index + 1}`
            );
            if (newTodoItemName.value.trim() === "") return;
            if (editingTaskIndex !== null) {
                todo.tasks[editingTaskIndex].name = newTodoItemName.value;
                editingTaskIndex = null;
            } else {
                todo.tasks.push({
                    id: todo.tasks.length + 1,
                    name: newTodoItemName.value,
                    isCompleted: false,
                });
            }
            localStorage.setItem("todos", JSON.stringify(todos));
            newTodoItemName.value = "";
            renderTodoTasks();
        };

        let addTodoItemBtn = document.querySelector(`#add-btn${index + 1}`);
        addTodoItemBtn.addEventListener("click", handleAddOrEditTodo);

        let clearBtn = document.querySelector(`#clear-btn${index + 1}`);
        clearBtn.addEventListener("click", (event) => {
            deleteAllTasks(event, index);
        });

        if (document.querySelector(`#clear-completed-btn${index + 1}`)) {
            let clearCompletedBtn = document.querySelector(
                `#clear-completed-btn${index + 1}`
            );
            clearCompletedBtn.addEventListener("click", (event) => {
                deleteCompletedTasks(event, index);
            });
        }

        renderTodoTasks();
    });

    let listItems = document.querySelectorAll(".list-group-item");

    for (let i = 0; i < tabs.length; i++) {
        if (listItems[i]) {
            if (i === 0) {
                listItems[i].classList.add("active");
            } else {
                listItems[i].classList.remove("active");
            }
        }
    }
}

const editTodoTask = (event, todoList, taskIndex, todoIndex) => {
    event.preventDefault();
    const taskToEdit = todoList[taskIndex];
    if (taskToEdit) {
        const newTodoItemInput = document.querySelector(
            `#newTodoItemName${todoIndex + 1}`
        );
        const addButton = document.querySelector(`#add-btn${todoIndex + 1}`);

        newTodoItemInput.value = taskToEdit.name;

        editingTaskIndex = taskIndex;

        addButton.textContent = "Save";
        addButton.classList.remove("btn-outline-secondary");
        addButton.classList.add("btn-success");
        showAlert("Task edited", "warning");
    }
};

function deleteTodoTask(event, todoList, id, todoIndex) {
    event.preventDefault();
    const taskToDelete = todoList.find((task) => task.id === id);
    if (taskToDelete) {
        todoList.splice(todoList.indexOf(taskToDelete), 1);
        let todos = JSON.parse(localStorage.getItem("todos"));
        todos[todoIndex].tasks = todoList;
        localStorage.setItem("todos", JSON.stringify(todos));
        renderTodoPages();
        let savedTab = localStorage.getItem("tab");
        if (savedTab) {
            displayTab(parseInt(savedTab, 10));
        } else {
            displayTab(1);
        }
        showAlert("Task deleted", "warning");
    }
}

function setCompleted(event, todoIndex, taskIndex) {
    event.preventDefault();
    let todos = JSON.parse(localStorage.getItem("todos"));
    const taskToComplete = todos[todoIndex].tasks[taskIndex];
    if (taskToComplete) {
        taskToComplete.isCompleted = !taskToComplete.isCompleted;
        localStorage.setItem("todos", JSON.stringify(todos));
        renderTodoPages();
        let savedTab = localStorage.getItem("tab");
        if (savedTab) {
            displayTab(parseInt(savedTab, 10));
        } else {
            displayTab(1);
        }
    }
}

function renderIsCompletedTable(index, todo) {
    let completedTasks = document.querySelector(`.completed${index + 1}`);
    let uncompletedTasks = document.querySelector(`.uncompleted${index + 1}`);
    completedTasks.innerHTML = todo.tasks.filter(
        (task) => task.isCompleted
    ).length;
    uncompletedTasks.innerHTML = todo.tasks.filter(
        (task) => !task.isCompleted
    ).length;
}

function changeTabs(num) {
    localStorage.setItem("tab", num);
    displayTab(num);
}

function displayTab(num) {
    let listItems = document.querySelectorAll(".list-group-item");

    tabs.forEach((tab, index) => {
        tab.style.display = index === num - 1 ? "block" : "none";
    });
    for (let i = 0; i < listItems.length; i++) {
        if (listItems[i]) {
            if (i === num - 1) {
                listItems[i].classList.add("active");
            } else {
                listItems[i].classList.remove("active");
            }
        }
    }
}

function deleteAllTasks(event, todoIndex) {
    event.preventDefault();
    let todos = JSON.parse(localStorage.getItem("todos"));
    todos[todoIndex].tasks = [];
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodoPages();
    let savedTab = localStorage.getItem("tab");
    if (savedTab) {
        displayTab(parseInt(savedTab, 10));
    } else {
        displayTab(1);
    }
    showAlert("All tasks deleted successfully", "success");
}

function deleteCompletedTasks(event, todoIndex) {
    event.preventDefault();
    let todos = JSON.parse(localStorage.getItem("todos"));
    todos[todoIndex].tasks = todos[todoIndex].tasks.filter(
        (task) => !task.isCompleted
    );
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodoPages();
    let savedTab = localStorage.getItem("tab");
    if (savedTab) {
        displayTab(parseInt(savedTab, 10));
    } else {
        displayTab(1);
    }
    showAlert("All completed tasks deleted successfully", "success");
}

document.addEventListener("DOMContentLoaded", () => {
    let savedTab = localStorage.getItem("tab");
    renderTodoPages();
    if (savedTab) {
        displayTab(parseInt(savedTab, 10));
    } else {
        displayTab(1);
    }
});

function showAlert(message, type = "success") {
    const alertContainer = document.getElementById("alert-container");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);

    setTimeout(() => {
        if (alert) {
            alert.classList.remove("show");
            alert.addEventListener("transitionend", () => alert.remove());
        }
    }, 5000);
}
