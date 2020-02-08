const getAllTodoLists = () => Array.from(document.querySelectorAll('.todoListBox'));
const getAllTasks = () => Array.from(document.querySelectorAll('.taskItem'));
const getTodoTitle = todo => todo.querySelector('h2');

const filterSearchedTodoLists = function(){
  const allTodoLists = getAllTodoLists();
  allTodoLists.forEach(todo => {
    todo.classList.remove('hidden');
    const isMatchedTodo = getTodoTitle(todo).innerText.includes(todoSearchBar.value);
    !isMatchedTodo && todo.classList.add('hidden');
  });
};

const focusAndResetTodoSearchField = function() {
  todoSearchBar.value = '';
  setTimeout(() => todoSearchBar.focus(), 100);
};

const resetTodoSearch = function(){
  focusAndResetTodoSearchField();
  filterSearchedTodoLists();
};

const filterSearchedTasks = function(){
  const allTasks = getAllTasks();
  allTasks.forEach(task => {
    task.classList.remove('hidden');
    const isMatchedTask = getTaskName(task).innerText.includes(taskSearchBar.value);
    !isMatchedTask && task.classList.add('hidden');
  });
};

const focusAndResetTaskSearchField = function(){
  taskSearchBar.value = '';
  setTimeout(() => taskSearchBar.focus(), 100);
};

const resetTaskSearch = function(){
  focusAndResetTaskSearchField();
  filterSearchedTasks();
};
