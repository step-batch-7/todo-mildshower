/* eslint-disable no-undef */
const addTodoListOnServer = postDataToServer.bind(null, '/addTodoList');

const restoreTodoAddPanel = function(){
  newTitle.value = '';
  addTodoPanel.checked = false;
};

const addTodoListOnEnter = function() {
  if(event.key === 'Enter' && event.target.value !== '') {
    const newTodoTitle = newTitle.value;
    addTodoListOnServer({title: newTodoTitle}, ({newTodoListId}) => {
      projectTodoList({title: newTodoTitle, id: newTodoListId, tasks: []});
    });
    restoreTodoAddPanel();
  }
};

const focusOnNewTitleField = function() {
  setTimeout(() => newTitle.focus(), 100);
};

const stopEventPropagation = () => event.stopPropagation();

const attachEventHandlers = function(){
  newTitle.onkeydown = addTodoListOnEnter;
  addIcon.onclick = focusOnNewTitleField;
  todoSearchIcon.onclick = resetTodoSearch;
  todoSearchBar.onkeyup = filterSearchedTodoLists;
  todoSearchBar.onclick = stopEventPropagation;
  taskSearchIcon.onclick = resetTaskSearch;
  taskSearchBar.onkeyup = filterSearchedTasks;
  taskSearchBar.onclick = stopEventPropagation;
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
