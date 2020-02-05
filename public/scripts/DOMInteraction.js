/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const getTodoListsContainer = () => document.querySelector('.toDoLists');
const getAddBtn = () => document.querySelector('.addIcon');
const getTodoBoxById = todoId => document.querySelector(`[id="${todoId}"]`);
const getTaskById = taskId => document.querySelector(`[id="${taskId}"]`);
const getTodoDelBtn = todo => todo.querySelector('.todoListHeader img');
const getTasksContainer = todoId => {
  return document.querySelector(`[id="${todoId}"] .tasks`);
};
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
  const isExpanded = getAddBtn().classList.contains('cross');
  isExpanded && collapseTitleField();
  !isExpanded && expandTitleField();
};

const removeEnteredValues = () => {
  newTitle.value = '';
};

const updateLeftTaskCount = function( delta, todoListId) {
  const countBoard = getTaskCountField(todoListId);
  countBoard.innerText = +countBoard.innerText + delta;
};

const increaseLeftTaskCount = updateLeftTaskCount.bind(null, 1);
const decreaseLeftTaskCount = updateLeftTaskCount.bind(null, -1);

const updateTaskCountOnDeletion = function(taskToDelete, parentTodoId){
  const isUndoneTask = !taskToDelete.classList.contains('checked');
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
  const isDone = this.classList.contains('checked');
  isDone && markTaskAsUndone(this, parentTodoListId);
  !isDone && markTaskAsDone(this, parentTodoListId);
};

const getNewTodoListInfo = () => ({title: newTitle.value});

const clearNewTaskField = taskField => {
  taskField.value = '';
};
