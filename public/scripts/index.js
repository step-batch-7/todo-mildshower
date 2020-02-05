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

const addTaskToTodo = function(todoListId, taskField) {
  if(event.key === 'Enter' && taskField.value !== ''){
    addTaskToTodoOnServer({todoListId, taskName: taskField.value}, ({taskId}) => {
      const newTaskHtmlStr = `
      <div class="taskItem" id="${taskId}">
      <div class="tickBox"></div>
      <p>${taskField.value}</p>
      <img onclick="deleteTaskItem('${taskId}','${todoListId}')" class="taskDelBtn" src="images/del.png">
      </div>`;
      const div = document.createElement('div');
      div.innerHTML = newTaskHtmlStr;
      const taskHtml = div.firstElementChild;
      taskHtml.onclick = toggleTaskState.bind(taskHtml, todoListId);
      const todoTasks = document.querySelector(`[id="${todoListId}"] .tasks`);
      todoTasks.append(taskHtml);
      taskHtml.scrollIntoView();
      taskField.value = '';
      increaseLeftTaskCount(todoListId);
    });
  }
};

const getRemainingTaskCount = tasks => tasks.filter(task => !task.done).length;

const generateTodoListHtml = function(todoList){
  const tasksHtml = todoList.tasks.map(task => `
  <div class="taskItem ${task.done ? 'checked' : ''}" id="${task.id}">
  <div class="tickBox"></div>
  <p>${task.name}</p>
  <img onclick="deleteTaskItem('${task.id}','${todoList.id}')" class="taskDelBtn" src="images/del.png">
  </div>`).join('\n');
  const remainingTaskCount = getRemainingTaskCount(todoList.tasks);
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="todoListBox" id="${todoList.id}">
      <div class="todoListHeader"> 
        <div class="titleBar">
          <h2>${todoList.title}</h2>
          <img onclick="deleteTodo('${todoList.id}')" src="images/del2.png" alt="delete">
        </div>
        <div class="infoStrap">
          <span class="taskCount">${remainingTaskCount}</span> left
        </div>
      </div>
      <div class="tasks">${tasksHtml}</div>
      <input type="text" onkeydown="addTaskToTodo('${todoList.id}', this)" placeholder="New Task.." class="newTaskInTodoBox">
    </div>`;
  const todoHtml = div.firstElementChild;
  const tasks = Array.from(todoHtml.children[1].children);
  tasks.forEach(task => {
    task.onclick = toggleTaskState.bind(task, todoList.id);
  });
  return todoHtml;
};

const addTodoListOnEnter = function() {
  if(event.key === 'Enter' && event.target.value !== '') {
    addTodoListOnServer(getNewTodoListInfo(), projectTodoList);
    restoreTodoAddPanel();
  }
};

const attachEventHandlers = function(){
  newTitle.onkeydown = addTodoListOnEnter;
  getAddBtn().onclick = toggleNewTitleVisibility;
};

const loadSavedRecords = function(){
  fetchSavedRecords('/records', function(todoLists){
    todoLists.reverse().forEach(todoList => projectTodoList(todoList));
  });
};

const main = function() {
  attachEventHandlers();
  loadSavedRecords();
};

window.onload = main;
