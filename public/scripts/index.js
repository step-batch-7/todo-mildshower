/* eslint-disable no-undef */
const projectTodoList = function(todoList) {
  const todoHtml = generateTodoListHtml(todoList);
  getTodoListsContainer().prepend(todoHtml);
};

const restoreTodoAddPanel = function(){
  removeEnteredValues();
  collapseTitleField();
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
