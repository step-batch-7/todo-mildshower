/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));
const getTodoLists = () => document.querySelector('.toDoLists');
const getAddIcon = () => document.querySelector('.addIcon');
const getTodoBoxById = todoId => document.querySelector(`[id="${todoId}"]`);

const sendXHRPostRequest = function(url, data, resType, callBack) {
  const request = new XMLHttpRequest();
  request.open('POST', url);
  resType && (request.responseType = resType);
  request.onload = function(){
    callBack && callBack(this.response);
  };
  request.send(data);
};

const sendXHRGetRequest = function(url, resType, callBack) {
  const request = new XMLHttpRequest();
  request.open('GET', url);
  resType && (request.responseType = resType);
  request.onload = function(){
    callBack && callBack(this.response);
  };
  request.send();
};

const generateNewTodoList = () => ( {title: newTitle.value});

const removeEnteredValues = () => {
  newTitle.value = '';
};

const restoreAddBox = function(){
  removeEnteredValues();
  closeNewTitleField();
};

const getParentTodo = task => task.parentElement.parentElement;

const toggleTaskStatusOnServer = function(todoListId, taskId){
  sendXHRPostRequest('/toggleTask', JSON.stringify({todoListId, taskId}));
};

const updateLeftTaskCount = function( delta, todoListId) {
  const countBoard = document.querySelector(`[id="${todoListId}"] .taskCount`);
  countBoard.innerText = +countBoard.innerText + delta;
};

const increaseLeftTaskCount = updateLeftTaskCount.bind(null, 1);
const decreaseLeftTaskCount = updateLeftTaskCount.bind(null, -1);

const toggleTaskStatus = function(){
  const parentTodoList = getParentTodo(this);
  toggleTaskStatusOnServer(parentTodoList.id, this.id);
  if(this.className.includes('checked')){
    this.classList.remove('checked');
    increaseLeftTaskCount(parentTodoList.id);
    return;
  }
  this.classList.add('checked');
  decreaseLeftTaskCount(parentTodoList.id);
};

const getRemainingTaskCount = tasks => tasks.filter(task => !task.done).length;

const deleteTaskOnServer = function(taskItem){
  const [todoListId] = taskItem.id.split('_');
  const taskDeletionInfo = JSON.stringify({todoListId, taskId: taskItem.id});
  sendXHRPostRequest('/deleteTask', taskDeletionInfo);
};

const deleteTaskItem = function(deleteBtn){
  event.stopPropagation();
  const taskItem = deleteBtn.parentElement;
  deleteTaskOnServer(taskItem);
  if(!taskItem.className.includes('checked')) {
    decreaseLeftTaskCount(getParentTodo(taskItem).id);
  }
  taskItem.remove();
};

const deleteTodoOnServer = function(todoListId){
  sendXHRPostRequest('/deleteTodo', JSON.stringify({todoListId}));
};

const deleteTodo = function(todoListId){
  deleteTodoOnServer(todoListId);
  getTodoBoxById(todoListId).remove();
};

const addTaskToTodoOnServer = function(todoListId, taskName, callBack){
  const newTaskInfo = JSON.stringify({todoListId, taskName});
  sendXHRPostRequest('/addTask', newTaskInfo, 'json', ({taskId}) => {
    callBack(taskId);
  });
};

const addTaskToTodo = function(todoListId, taskField) {
  if(event.keyCode === 13 && taskField.value !== ''){
    addTaskToTodoOnServer(todoListId, taskField.value, (newTaskId) => {
      const newTaskHtmlStr = `
    <div class="taskItem" id="${newTaskId}">
      <div class="tickBox"></div>
      <p>${taskField.value}</p>
      <img onclick="deleteTaskItem(this)" class="taskDelBtn" src="images/del.png">
    </div>`;
      const div = document.createElement('div');
      div.innerHTML = newTaskHtmlStr;
      const taskHtml = div.firstElementChild;
      taskHtml.onclick = toggleTaskStatus;
      const todoTasks = document.querySelector(`[id="${todoListId}"] .tasks`);
      todoTasks.append(taskHtml);
      taskHtml.scrollIntoView();
      taskField.value = '';
      increaseLeftTaskCount(todoListId);
    });
  }
};

const generateTodoListHtml = function(todoList){
  const tasksHtml = todoList.tasks.map(task => `
    <div class="taskItem ${task.done ? 'checked' : ''}" id="${task.id}">
      <div class="tickBox"></div>
      <p>${task.name}</p>
      <img onclick="deleteTaskItem(this)" class="taskDelBtn" src="images/del.png">
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
    task.onclick = toggleTaskStatus;
  });
  return todoHtml;
};

const projectTodoList = function(todoList) {
  const todoHtml = generateTodoListHtml(todoList);
  const toDoLists = getTodoLists();
  toDoLists.insertBefore(todoHtml, toDoLists.firstChild);
};

const sendTodoListToServer = function(todoList){
  sendXHRPostRequest('/addTodoList', JSON.stringify(todoList), 'json', res => {
    projectTodoList(res);
  });
};

const addTodoListOnEnter = function() {
  if(event.key === 'Enter' && event.target.value !== '') {
    const newTodoList = generateNewTodoList();
    sendTodoListToServer(newTodoList);
    restoreAddBox();
  }
  if(event.key === 'Escape') {
    closeNewTitleField();
  }
};

const openNewTitleField = function(){
  document.querySelector('.title').classList.add('full');
  const addIcon = getAddIcon();
  addIcon.className = addIcon.className.replace(/plus/g, 'cross');
  newTitle.focus();
};

const closeNewTitleField = function(){
  document.querySelector('.title').classList.remove('full');
  const addIcon = getAddIcon();
  addIcon.className = addIcon.className.replace(/cross/g, 'plus');
};

const toggleNewTitleVisibility = function() {
  if(getAddIcon().className.includes('plus')) {
    openNewTitleField();
    return;
  }
  closeNewTitleField();
};

const attachEventHandlers = function(){
  newTitle.onkeydown = addTodoListOnEnter;
  getAddIcon().onclick = toggleNewTitleVisibility;
};

const fetchAndShowSavedItems = function(){
  sendXHRGetRequest('/records', 'json', function(todoLists){
    todoLists.reverse().forEach(todoList => projectTodoList(todoList));
  });
};

const main = function() {
  attachEventHandlers();
  fetchAndShowSavedItems();
};

window.onload = main;
