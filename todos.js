let canvasBody = document.querySelector(".list-group");

function renderTodos() {
    let getTodos = localStorage.getItem("todos");
    let todos = getTodos ? JSON.parse(getTodos) : [];
    canvasBody.innerHTML = "";

    todos.map((todo, index) => {
        let li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.innerHTML = `
            <div onclick="changeTabs(${
                index + 1
            })" class="list-item-wrapper d-flex justify-content-between">
                <p class="p-0 m-0 fs-4 text-start">${todo.id}. ${todo.name}</p>
                <div class="actions">
                    <button class="btn btn-danger delete-btn" onclick="deleteTodo(${index})"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </div>
        `;
        canvasBody.appendChild(li);
    });
}

function handleAddTodo(event) {
    let inputValue = document.querySelector("#newTodoName");
    event.preventDefault();
    if (inputValue.value == "") {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
        });
    } else {
        let getTodos = localStorage.getItem("todos");
        let todos = getTodos ? JSON.parse(getTodos) : [];
        function findId() {
            if (todos.length == 0) {
                return 1;
            } else return todos[todos.length - 1].id + 1;
        }
        const newTodo = {
            id: findId(),
            name: inputValue.value,
            tasks: [],
        };
        todos.push(newTodo);
        localStorage.setItem("todos", JSON.stringify(todos));
        inputValue.value = "";
        renderTodos();
        renderTodoPages();
        showAlert("New todo list created", "success");
    }
}

function deleteTodo(index) {
    let getTodos = localStorage.getItem("todos");
    let todos = getTodos ? JSON.parse(getTodos) : [];
    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
    renderTodoPages();
    showAlert("Todo list deleted successfully", "success");
}

renderTodos();
