/* eslint-disable no-undef */
const getTaskFields = () => Array.from(document.querySelectorAll('.taskField'));

const getNewTasks = function() {
  const taskFields = getTaskFields();
  const tasks = taskFields.map(taskField => {
    const taskLine = document.createElement('p');
    taskLine.innerText = taskField.value;
    taskField.remove();
    return taskLine;
  });
  const tasksWrapper = document.createElement('div');
  tasksWrapper.className = 'tasks';
  tasks.forEach(task => tasksWrapper.append(task));
  return tasksWrapper;
};

const generateTodoBox = function() {
  const todoBox = document.createElement('div');
  todoBox.className = 'todoBox';
  const title = document.createElement('h3');
  title.innerText = todoTitle.value;
  todoTitle.value = '';
  todoBox.append(title);
  const tasksWrapper = getNewTasks();
  todoBox.append(tasksWrapper);
  return todoBox;
};

const getTaskField = function() {
  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.className = 'taskField';
  inputElement.placeholder = 'Task';
  inputElement.addEventListener('keydown', addTaskFieldOnEnter);
  return inputElement;
};

const addTaskFieldOnEnter = function(event) {
  if(event.keyCode === 13 && event.target.value !== '') {
    const newTodoBox = document.querySelector('.newTodo');
    newTodoBox.append(getTaskField());
    newTodoBox.lastChild.focus();
  }
};

const addToDo = function(event) {
  const toDoList = document.querySelector('.toDoList');
  toDoList.insertBefore(generateTodoBox(), toDoList.firstChild);
  const toggleIcon = document.querySelector('.add');
  closeAddBox(event.target.parentElement, toggleIcon);
};

const openAddBox = function(addBox, toggleIcon){
  addBox.classList.remove('collapsed');
  addBox.classList.add('expanded');
  toggleIcon.classList.remove('plus');
  toggleIcon.classList.add('cross');
};

const closeAddBox = function(addBox, toggleIcon){
  addBox.classList.remove('expanded');
  addBox.classList.add('collapsed');
  toggleIcon.classList.remove('cross');
  toggleIcon.classList.add('plus');

};

const toogleAddBoxVisibility = function(event) {
  const addBox = document.querySelector('.addBox');
  if(addBox.className.includes('collapsed')) {
    openAddBox(addBox, event.target);
  }else {
    closeAddBox(addBox, event.target);
  }
};

const attachEventHandlers = function(){
  const addBtn = document.querySelector('.addBtn');
  addBtn.addEventListener('click', addToDo);
  todoTitle.addEventListener('keydown', addTaskFieldOnEnter);
  const addIcon = document.querySelector('.add');
  addIcon.addEventListener('click', toogleAddBoxVisibility);
};

const main = function() {
  attachEventHandlers();
};

window.onload = main;
