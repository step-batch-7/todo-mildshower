/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const getTodoListsContainer = () => document.querySelector('.toDoLists');
const getAddBtn = () => document.querySelector('.addIcon');
const getTodoBoxById = todoId => document.querySelector(`[id="${todoId}"]`);
const getTaskById = taskId => document.querySelector(`[id="${taskId}"]`);
const getTaskCountField = todoId => {
  return document.querySelector(`[id="${todoId}"] .taskCount`);
};

const expandTitleField = function(){
  newTitle.classList.add('expanded');
  getAddBtn().classList.add('cross');
  newTitle.focus();
};

const collapseTitleField = function(){
  newTitle.classList.remove('expanded');
  getAddBtn().classList.remove('cross');
};

const toggleNewTitleVisibility = function() {
  const addBtnClasses = getAddBtn().className;
  addBtnClasses.includes('cross') && collapseTitleField();
  !addBtnClasses.includes('cross') && expandTitleField();
};

const removeEnteredValues = () => {
  newTitle.value = '';
};

const restoreTodoAddPanel = function(){
  removeEnteredValues();
  collapseTitleField();
};

const updateLeftTaskCount = function( delta, todoListId) {
  const countBoard = getTaskCountField(todoListId);
  countBoard.innerText = +countBoard.innerText + delta;
};

const increaseLeftTaskCount = updateLeftTaskCount.bind(null, 1);
const decreaseLeftTaskCount = updateLeftTaskCount.bind(null, -1);

const updateTaskCountOnDeletion = function(taskToDelete, parentTodoId){
  const isUndoneTask = !taskToDelete.className.includes('checked');
  isUndoneTask && decreaseLeftTaskCount(parentTodoId);
};

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

const projectTodoList = function(todoList) {
  const todoHtml = generateTodoListHtml(todoList);
  getTodoListsContainer().prepend(todoHtml);
};

const getNewTodoListInfo = () => ({title: newTitle.value});
