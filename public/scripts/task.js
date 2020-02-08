/* eslint-disable no-undef */
const toggleTaskStateOnServer = postDataToServer.bind(null, '/toggleTaskState');
const modifyTaskNameOnServer = postDataToServer.bind(null, '/modifyTaskName');
const deleteTaskOnServer = postDataToServer.bind(null, '/deleteTask');

const getTaskName = task => task.querySelector('p');

const getTaskCountField = todoId => {
  return document.querySelector(`[id="${todoId}"] .taskCount`);
};

const blurOnEnter = function(element){
  event.key === 'Enter' && element.blur();
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

const deleteTask = function(parentTodoId){
  deleteTaskOnServer({todoListId: parentTodoId, taskId: this.id});
  updateTaskCountOnDeletion(this, parentTodoId);
  this.remove();
};

const modifyTaskName = function(task, todoListId, taskName){
  const [taskId, name] = [task.id, taskName.innerText];
  modifyTaskNameOnServer({todoListId, taskId, name});
  taskName.innerText += '';
};

const attachHandlersToTask = function(task, parentTodoId){
  task.firstElementChild.onclick = toggleTaskState.bind(task, parentTodoId);
  task.lastElementChild.onclick = deleteTask.bind(task, parentTodoId);
  const taskName = getTaskName(task);
  taskName.onblur = modifyTaskName.bind(null, task, parentTodoId, taskName);
  taskName.onkeydown = blurOnEnter.bind(null, taskName);
};

const generateTaskHtml = function( parentTodoId, task) {
  const taskHtml = document.createElement('div');
  taskHtml.innerHTML = `
  <div class="tickBox"></div>
  <p contentEditable="true"></p>
  <img class="taskDelBtn" src="images/del.png">`;
  getTaskName(taskHtml).innerText = task.name;
  taskHtml.className = `taskItem ${task.done ? 'checked' : ''}`;
  taskHtml.id = task.id;
  attachHandlersToTask(taskHtml, parentTodoId);
  return taskHtml;
};
