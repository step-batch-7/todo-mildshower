/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const deleteTaskItem = function(taskId, parentTodoId){
  const taskItem = getTaskById(taskId);
  deleteTaskOnServer({todoListId: parentTodoId, taskId});
  updateTaskCountOnDeletion(taskItem, parentTodoId);
  taskItem.remove();
};

const deleteTodo = function(todoListId){
  deleteTodoOnServer({todoListId});
  getTodoBoxById(todoListId).remove();
};

const modifyTodoTitle = function(todoTitle, todoListId){
  modifyTodoTitleOnServer({todoListId, title: todoTitle.innerText});
  todoTitle.innerText += '';
};

const modifyTaskName = function(task, todoListId, taskName){
  modifyTaskNameOnServer({todoListId, taskId: task.id, name: taskName.innerText});
  taskName.innerText += '';
};

const blurOnEnter = function(element){
  event.key === 'Enter' && element.blur();
};

const attachHandlersToTask = function(task, parentTodoId){
  task.firstElementChild.onclick = toggleTaskState.bind(task, parentTodoId);
  const deleteIcon = task.lastElementChild;
  deleteIcon.onclick = deleteTaskItem.bind(null, task.id, parentTodoId);
  const taskName = task.children[1];
  taskName.onblur = modifyTaskName.bind(null, task, parentTodoId, taskName);
  taskName.onkeydown = blurOnEnter.bind(null, taskName);
};

const generateTaskItemHtml = function( parentTodoId, task) {
  const taskHtml = document.createElement('div');
  taskHtml.innerHTML = `
  <div class="tickBox"></div>
  <p contentEditable="true"></p>
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
  title.onblur = modifyTodoTitle.bind(null, title, todo.id);
  title.onkeydown = blurOnEnter.bind(null, title);
};

const generateTodoListHtml = function(todoList){
  const tasksHtml = todoList.tasks.map(generateTaskItemHtml.bind(null, todoList.id));
  const todoHtml = document.createElement('div');
  todoHtml.innerHTML = `
      <div class="todoListHeader"> 
        <div class="titleBar">
          <h2 contentEditable="true">${todoList.title}</h2>
          <div class="infoStrap">
            <span class="taskCount">${getLeftTaskCount(todoList.tasks)}</span> left
          </div>
        </div>
        <img src="images/del2.png" alt="delete">
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
