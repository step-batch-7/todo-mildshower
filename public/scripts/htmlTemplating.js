/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const deleteTaskItem = function(taskId, parentTodoId){
  event.stopPropagation();
  const taskItem = getTaskById(taskId);
  deleteTaskOnServer({todoListId: parentTodoId, taskId});
  updateTaskCountOnDeletion(taskItem, parentTodoId);
  taskItem.remove();
};

const deleteTodo = function(todoListId){
  deleteTodoOnServer({todoListId});
  getTodoBoxById(todoListId).remove();
};

const modifyTodoTitle = function(title, todoListId){
  modifyTodoTitleOnServer({todoListId, newTitle: title.innerText});
  // console.log(title.innerText, todoListId);
};

const attachHandlersToTask = function(task, parentTodoId){
  task.onclick = toggleTaskState.bind(task, parentTodoId);
  const deleteIcon = task.lastElementChild;
  deleteIcon.onclick = deleteTaskItem.bind(null, task.id, parentTodoId);
};

const generateTaskItemHtml = function( parentTodoId, task) {
  const taskHtml = document.createElement('div');
  taskHtml.innerHTML = `
  <div class="tickBox"></div>
  <p></p>
  <img class="taskDelBtn" src="images/del.png">`;
  taskHtml.children[1].innerText = task.name;
  taskHtml.className = `taskItem ${task.done ? 'checked' : ''}`;
  taskHtml.id = task.id;
  attachHandlersToTask(taskHtml, parentTodoId);
  return taskHtml;
};

const addTaskToTodo = function(todoListId, taskField) {
  if(event.key === 'Enter' && taskField.value !== ''){
    addTaskToTodoOnServer({todoListId, taskName: taskField.value}, ({taskId}) => {
      const taskHtml = generateTaskItemHtml(todoListId, {name: taskField.value, done: false, id: taskId});
      getTasksContainer(todoListId).append(taskHtml);
      taskHtml.scrollIntoView();
      clearNewTaskField(taskField);
      increaseLeftTaskCount(todoListId);
    });
  }
};

const getLeftTaskCount = tasks => tasks.filter(task => !task.done).length;

const attachHandlersToTodo = function(todo) {
  getTodoDelBtn(todo).onclick = deleteTodo.bind(null, todo.id);
  const newTaskField = todo.lastElementChild;
  newTaskField.onkeydown = addTaskToTodo.bind(null, todo.id, newTaskField);
  const title = getTodoTitle(todo);
  title.oninput = modifyTodoTitle.bind(null, title, todo.id);
};

const generateTodoListHtml = function(todoList){
  const tasksHtml = todoList.tasks.map(generateTaskItemHtml.bind(null, todoList.id));
  const todoHtml = document.createElement('div');
  todoHtml.innerHTML = `
      <div class="todoListHeader"> 
        <div class="titleBar">
          <h2 contentEditable="true">${todoList.title}</h2>
          <img src="images/del2.png" alt="delete">
        </div>
        <div class="infoStrap">
          <span class="taskCount">${getLeftTaskCount(todoList.tasks)}</span> left
        </div>
      </div>
      <div class="tasks"></div>
      <input type="text" placeholder="New Task.." class="newTaskInTodoBox">`;
  todoHtml.className = 'todoListBox';
  todoHtml.id = todoList.id;
  attachHandlersToTodo(todoHtml);
  const tasks = todoHtml.children[1];
  tasksHtml.forEach(taskHtml => tasks.append(taskHtml));
  return todoHtml;
};
