/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));
const getTodoLists = () => document.querySelector('.toDoLists');
const getAddBox = () => document.querySelector('.addBox');
const getAddIcon = () => document.querySelector('.addIcon');
const getAddBtn = () => document.querySelector('.addBtn');

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
  const parentTodoList = getParentTodo(event.target);
  toggleTaskStatusOnServer(parentTodoList.id, event.target.id);
  if(event.target.className.includes('checked')){
    event.target.classList.remove('checked');
    increaseLeftTaskCount(parentTodoList.id);
    return;
  }
  event.target.classList.add('checked');
  decreaseLeftTaskCount(parentTodoList.id);
};

const getRemainingTaskCount = tasks => tasks.filter(task => !task.done).length;

const generateTodoListHtml = function(todoList){
  const tasksHtml = todoList.tasks.map(task => `
    <div class="taskItem ${task.done ? 'checked' : ''}" id="${task.id}">
      <div class="tickBox"></div>
      <p>${task.name}</p>
    </div>`).join('\n');
  const remainingTaskCount = getRemainingTaskCount(todoList.tasks);
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="todoListBox" id="${todoList.id}">
      <div class="todoListHeader"><h3>${todoList.title}</h3>
        <div class="infoStrap">
          <span class="taskCount">${remainingTaskCount}</span> left
        </div>
      </div>
      <div class="tasks">${tasksHtml}</div>
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
