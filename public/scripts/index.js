/* eslint-disable no-undef */
const getTodoListsContainer = () => document.querySelector('.toDoLists');
const getAddBtn = () => document.querySelector('.addIcon');
const getTodoBoxById = todoId => document.querySelector(`[id="${todoId}"]`);

const generateNewTodoList = () => ( {title: newTitle.value});

const removeEnteredValues = () => {
  newTitle.value = '';
};

const restoreAddBox = function(){
  removeEnteredValues();
  closeNewTitleField();
};

const getParentTodo = task => task.parentElement.parentElement;

const updateLeftTaskCount = function( delta, todoListId) {
  const countBoard = document.querySelector(`[id="${todoListId}"] .taskCount`);
  countBoard.innerText = +countBoard.innerText + delta;
};

const increaseLeftTaskCount = updateLeftTaskCount.bind(null, 1);
const decreaseLeftTaskCount = updateLeftTaskCount.bind(null, -1);

const toggleTaskStatus = function(){
  const parentTodoList = getParentTodo(this);
  toggleTaskStateOnServer({todoListId: parentTodoList.id, taskId: this.id});
  if(this.className.includes('checked')){
    this.classList.remove('checked');
    increaseLeftTaskCount(parentTodoList.id);
    return;
  }
  this.classList.add('checked');
  decreaseLeftTaskCount(parentTodoList.id);
};

const getRemainingTaskCount = tasks => tasks.filter(task => !task.done).length;

const deleteTaskItem = function(deleteBtn){
  event.stopPropagation();
  const taskItem = deleteBtn.parentElement;
  const [todoListId] = taskItem.id.split('_');
  deleteTaskOnServer({todoListId, taskId: taskItem.id});
  if(!taskItem.className.includes('checked')) {
    decreaseLeftTaskCount(getParentTodo(taskItem).id);
  }
  taskItem.remove();
};

const deleteTodo = function(todoListId){
  deleteTodoOnServer({todoListId});
  getTodoBoxById(todoListId).remove();
};

const addTaskToTodo = function(todoListId, taskField) {
  if(event.keyCode === 13 && taskField.value !== ''){
    addTaskToTodoOnServer({todoListId, taskName: taskField.value}, ({taskId}) => {
      const newTaskHtmlStr = `
    <div class="taskItem" id="${taskId}">
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
  const toDoListCollection = getTodoListsContainer();
  toDoListCollection.insertBefore(todoHtml, toDoListCollection.firstChild);
};

const addTodoListOnEnter = function() {
  if(event.key === 'Enter' && event.target.value !== '') {
    const newTodoList = generateNewTodoList();
    addTodoListOnServer(newTodoList, projectTodoList);
    restoreAddBox();
  }
  if(event.key === 'Escape') {
    closeNewTitleField();
  }
};

const openNewTitleField = function(){
  document.querySelector('.title').classList.add('full');
  const addBtn = getAddBtn();
  addBtn.className = addBtn.className.replace(/plus/g, 'cross');
  newTitle.focus();
};

const closeNewTitleField = function(){
  document.querySelector('.title').classList.remove('full');
  const addBtn = getAddBtn();
  addBtn.className = addBtn.className.replace(/cross/g, 'plus');
};

const toggleNewTitleVisibility = function() {
  if(getAddBtn().className.includes('plus')) {
    openNewTitleField();
    return;
  }
  closeNewTitleField();
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
