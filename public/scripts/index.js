/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));
const getTaskItems = () => Array.from(document.querySelectorAll('.taskItem'));
const getTodoList = () => document.querySelector('.toDoList');
const getAddBox = () => document.querySelector('.addBox');
const getAddIcon = () => document.querySelector('.addIcon');
const getAddBtn = () => document.querySelector('.addBtn');

const sendXHRPostRequest = function(url, data, resType, callBack) {
  const request = new XMLHttpRequest();
  request.open('POST', url);
  request.responseType = resType;
  request.onload = function(){
    callBack && callBack(this.response);
  };
  request.send(data);
};

const getNewTasks = function() {
  const taskFields = getTaskFields();
  const allEntries = taskFields.map(taskField => taskField.value);
  return allEntries.filter(task => task !== '');
};

const generateNewTodo = function() {
  return {title: todoTitle.value, taskNames: getNewTasks()};
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

const generateTodoHtml = function(todo){
  const tasksHtml = todo.tasks.map(task => `
    <div class="taskItem" id="${task.id}">
      <div class="tickBox ${todo.done ? 'checked' : ''}" id="${task.id}"></div>
      <p>${task.name}</p>
    </div>`).join('\n');
  return `
    <div class="todoBox" id="${todo.id}">
      <div class="todoHeader">
        <h3>${todo.title}</h3>
        <div class="infoStrap">
          <span class="taskCount">${todo.tasks.length} left<span>
        </div>
      </div>
      <div class="tasks">
        ${tasksHtml}
      </div>
    </div>`;
};

const projectTodo = function(todo) {
  const todoHtml = generateTodoHtml(todo);
  const toDoList = getTodoList();
  toDoList.innerHTML = todoHtml + toDoList.innerHTML;
};

const sendTodoToServer = function(todo){
  sendXHRPostRequest('/saveTodo', JSON.stringify(todo), 'json', res => {
    projectTodo(res);
  });
};

const addToDo = function() {
  const newTodo = generateNewTodo();
  sendTodoToServer(newTodo);
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
