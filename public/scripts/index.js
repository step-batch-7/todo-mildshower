/* eslint-disable no-undef */
const getTodoListsContainer = () => document.querySelector('.toDoLists');
const getAddBtn = () => document.querySelector('.addIcon');
const getTodoBoxById = todoId => document.querySelector(`[id="${todoId}"]`);
const getTaskById = taskId => document.querySelector(`[id="${taskId}"]`);
const getTaskCountField = todoId => {
  return document.querySelector(`[id="${todoId}"] .taskCount`);
};

const getNewTodoListInfo = () => ({title: newTitle.value});

const removeEnteredValues = () => {
  newTitle.value = '';
};

const openNewTitleField = function(){
  newTitle.classList.add('expanded');
  getAddBtn().classList.add('cross');
  newTitle.focus();
};

const closeNewTitleField = function(){
  newTitle.classList.remove('expanded');
  getAddBtn().classList.remove('cross');
};

const toggleNewTitleVisibility = function() {
  const addBtnClasses = getAddBtn().className;
  addBtnClasses.includes('cross') && closeNewTitleField();
  !addBtnClasses.includes('cross') && openNewTitleField();
};

const restoreTodoAddPanel = function(){
  removeEnteredValues();
  closeNewTitleField();
};

const updateLeftTaskCount = function( delta, todoListId) {
  const countBoard = getTaskCountField(todoListId);
  countBoard.innerText = +countBoard.innerText + delta;
};

const increaseLeftTaskCount = updateLeftTaskCount.bind(null, 1);
const decreaseLeftTaskCount = updateLeftTaskCount.bind(null, -1);

const markTaskAsDone = function(task, parentTodoId) {
  task.classList.add('checked');
  decreaseLeftTaskCount(parentTodoId);
};

const markTaskAsUndone = function(task, parentTodoId) {
  task.classList.remove('checked');
  increaseLeftTaskCount(parentTodoId);
};

const toggleTaskState = function(parentTodoListId){
  toggleTaskStateOnServer({todoListId: parentTodoListId, taskId: this.id});
  const isDone = this.className.includes('checked');
  isDone && markTaskAsUndone(this, parentTodoListId);
  !isDone && markTaskAsDone(this, parentTodoListId);
};

const updateTaskCountOnDeletion = function(taskToDelete, parentTodoId){
  const isUndoneTask = !taskToDelete.className.includes('checked');
  isUndoneTask && decreaseLeftTaskCount(parentTodoId);
};

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

const projectTodoList = function(todoList) {
  const todoHtml = generateTodoListHtml(todoList);
  getTodoListsContainer().prepend(todoHtml);
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
