/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));
const getTodoList = () => document.querySelector('.toDoList');
const getAddBox = () => document.querySelector('.addBox');
const getAddIcon = () => document.querySelector('.addIcon');
const getAddBtn = () => document.querySelector('.addBtn');

const sendXHRRequest = function(method, url, data, callBack) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.onload = function(){
    callBack && callBack(this);
  };
  request.send(data);
};

const getNewTasks = function() {
  const taskFields = getTaskFields();
  const allEntries = taskFields.map(taskField => taskField.value);
  return allEntries.filter(task => task !== '');
};

const generateNewTodoJson = function() {
  const title = todoTitle.value;
  const time = new Date().getTime();
  const tasks = getNewTasks();
  return JSON.stringify({title, time, tasks});
};

const removeEnteredValues = function(){
  todoTitle.value = '';
  const taskFields = getTaskFields();
  taskFields.forEach(taskField => taskField.remove());
};

const restoreAddBox = function(){
  removeEnteredValues();
  closeAddBox();
};

const projectTodo = function(todoHtml) {
  const toDoList = getTodoList();
  toDoList.innerHTML = todoHtml + toDoList.innerHTML;
};

const sendTodoToServer = function(todoJSON){
  sendXHRRequest('POST', '/saveTodo', todoJSON, res => {
    projectTodo(res.responseText);
  });
};

const addToDo = function() {
  const todoJSON = generateNewTodoJson();
  sendTodoToServer(todoJSON);
  restoreAddBox();
};

const addTaskFieldOnEnter = function(event) {
  if(event.key === 'Enter' && event.target.value !== '') {
    const newTodoBox = document.querySelector('.newTodo');
    newTodoBox.append(getTaskField());
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

const getTaskField = function() {
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
  todoTitle.focus();
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
  todoTitle.onkeypress = addTaskFieldOnEnter;
  todoTitle.onkeydown = navigateThroughFields;
  getAddBtn().onclick = addToDo;
  getAddIcon().onclick = toggleAddBoxVisibility;
};

const main = function() {
  attachEventHandlers();
};

window.onload = main;
