/* eslint-disable no-undef */
const filterSearchedTodoLists = function(){
  const allTodoLists = getAllTodoLists();
  allTodoLists.forEach(todo => {
    todo.classList.remove('hidden');
    const isMatchedTodo = getTodoTitle(todo).innerText.includes(todoSearchBar.value);
    !isMatchedTodo && todo.classList.add('hidden');
  });
};

const projectTodoList = function(todoList) {
  const todoHtml = generateTodoListHtml(todoList);
  getTodoListsContainer().prepend(todoHtml);
  todoHtml.lastElementChild.focus();
};

const restoreTodoAddPanel = function(){
  removeEnteredValues();
  collapseNewTitle();
};

const addTodoListOnEnter = function() {
  if(event.key === 'Enter' && event.target.value !== '') {
    const newTodo = getNewTodoListInfo();
    addTodoListOnServer(newTodo, ({newTodoListId}) => {
      projectTodoList({title: newTodo.title, id: newTodoListId, tasks: []});
    });
    restoreTodoAddPanel();
  }
};

const attachEventHandlers = function(){
  newTitle.onkeydown = addTodoListOnEnter;
  addIcon.onclick = focusOnNewTitleField;
  todoSearchIcon.onclick = focusOnTodoSearchField;
  todoSearchBar.onkeyup = filterSearchedTodoLists;
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
