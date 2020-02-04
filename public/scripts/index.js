/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));
const getTodoLists = () => document.querySelector('.toDoLists');
const getAddBox = () => document.querySelector('.addBox');
const getAddIcon = () => document.querySelector('.addIcon');
const getAddBtn = () => document.querySelector('.addBtn');
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

const getNewTasks = function() {
  const taskFields = getTaskFields();
  const allEntries = taskFields.map(taskField => taskField.value);
  return allEntries.filter(task => task !== '');
};

const generateNewTodoList = function() {
  return {title: todoListTitle.value, taskNames: getNewTasks()};
};

const removeEnteredValues = function(){
  todoListTitle.value = '';
  const taskFields = getTaskFields();
  taskFields.forEach(taskField => taskField.remove());
};

const restoreAddBox = function(){
  removeEnteredValues();
  closeAddBox();
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
  const [todoListId, taskId] = taskItem.id.split('_');
  sendXHRPostRequest('/deleteTask', JSON.stringify({todoListId, taskId}));
};

const deleteTaskItem = function(deleteBtn){
  event.stopPropagation();
  const taskItem = deleteBtn.parentElement;
  deleteTaskOnServer(taskItem);
  decreaseLeftTaskCount(getParentTodo(taskItem).id);
  taskItem.remove();
};

const deleteOnServer = function(todoListId){
  sendXHRPostRequest('/deleteTodo', JSON.stringify({todoListId}));
};

const deleteTodo = function(todoListId){
  deleteOnServer(todoListId);
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

const addTodoList = function() {
  const newTodoList = generateNewTodoList();
  sendTodoListToServer(newTodoList);
  restoreAddBox();
};

const addTaskFieldOnEnter = function(event) {
  if(event.key === 'Enter' && event.target.value !== '') {
    const newTodoBox = document.querySelector('.newTodo');
    newTodoBox.append(getNewTaskField());
    newTodoBox.lastChild.focus();
  }
};

const removeOnBackspace = function(event) {
  if(event.key === 'Backspace' && event.target.value === '') {
    event.target.previousElementSibling.focus();
    event.target.remove();
  }
};

const navigateDown = function(element){ 
  const nextElement = element.nextElementSibling;
  nextElement && nextElement.focus();
};

const navigateUp = function(element){ 
  const previousElement = element.previousElementSibling;
  previousElement && previousElement.focus();
};

const navigateThroughFields = function(event) {
  const navigators = {
    ArrowUp: navigateUp,
    ArrowDown: navigateDown
  };
  const navigator = navigators[event.key];
  navigator && navigator(event.target);
};

const getNewTaskField = function() {
  const taskField = document.createElement('input');
  taskField.type = 'text';
  taskField.className = 'taskField';
  taskField.placeholder = 'Task';
  taskField.onkeypress = addTaskFieldOnEnter;
  taskField.onkeydown = navigateThroughFields;
  taskField.onkeyup = removeOnBackspace;
  return taskField;
};

const openAddBox = function(){
  const addBox = getAddBox();
  const addIcon = getAddIcon();
  addBox.className = addBox.className.replace(/collapsed/g, 'expanded');
  addIcon.className = addIcon.className.replace(/plus/g, 'cross');
  todoListTitle.focus();
};

const closeAddBox = function(){
  const addBox = getAddBox();
  const addIcon = getAddIcon();
  addBox.className = addBox.className.replace(/expanded/g, 'collapsed');
  addIcon.className = addIcon.className.replace(/cross/g, 'plus');
};

const toggleAddBoxVisibility = function() {
  if(getAddBox().className.includes('collapsed')) {
    openAddBox();
    return;
  }
  closeAddBox();
};

const attachEventHandlers = function(){
  todoListTitle.onkeypress = addTaskFieldOnEnter;
  todoListTitle.onkeydown = navigateThroughFields;
  getAddBtn().onclick = addTodoList;
  getAddIcon().onclick = toggleAddBoxVisibility;
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
