/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));
const getTodoList = () => document.querySelector('.toDoList');
const getAddBox = () => document.querySelector('.addBox');
const getAddIcon = () => document.querySelector('.addIcon');
const getAddBtn = () => document.querySelector('.addBtn');

const getNewTasks = function() {
  const taskFields = getTaskFields();
  const allEntries = taskFields.map(taskField => taskField.value);
  return allEntries.filter(task => task !== '');
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

const addToDo = function() {
  const toDoList = getTodoList();
  const todo = new Todo(todoTitle.value, getNewTasks());
  toDoList.innerHTML = todo.toHtml() + toDoList.innerHTML;
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

const getTaskField = function() {
  const taskField = document.createElement('input');
  taskField.type = 'text';
  taskField.className = 'taskField';
  taskField.placeholder = 'Task';
  taskField.onkeypress = addTaskFieldOnEnter;
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
  todoTitle.onkeydown = addTaskFieldOnEnter;
  getAddBtn().onclick = addToDo;
  getAddIcon().onclick = toggleAddBoxVisibility;
};

const main = function() {
  attachEventHandlers();
};

window.onload = main;
