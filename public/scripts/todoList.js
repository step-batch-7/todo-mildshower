/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const getTasksContainer = todo => todo.querySelector('.tasks');
const getTodoDelBtn = todo => todo.querySelector('.todoListHeader img');
const getTodoBoxById = todoId => document.querySelector(`[id="${todoId}"]`);
const getTodoListsContainer = () => document.querySelector('.toDoLists');

const modifyTodoTitleOnServer = postDataToServer.bind(null, '/modifyTodoTitle');
const deleteTodoOnServer = postDataToServer.bind(null, '/deleteTodo');
const addTaskToTodoOnServer = postDataToServer.bind(null, '/addTask');

const clearNewTaskField = taskField => {
  taskField.value = '';
};

const deleteTodo = function(todoListId){
  deleteTodoOnServer({todoListId});
  getTodoBoxById(todoListId).remove();
};

const modifyTodoTitle = function(todoTitle, todoListId){
  modifyTodoTitleOnServer({todoListId, title: todoTitle.innerText});
  todoTitle.innerText += '';
};

const addTaskToTodo = function(todo, taskField) {
  if(event.key === 'Enter' && taskField.value !== ''){
    const taskAdditionInfo = {todoListId: todo.id, taskName: taskField.value};
    addTaskToTodoOnServer(taskAdditionInfo, ({id}) => {
      const task = {name: taskField.value, done: false, id};
      const taskHtml = generateTaskHtml(todo.id, task);
      getTasksContainer(todo).append(taskHtml);
      taskHtml.scrollIntoView();
      clearNewTaskField(taskField);
      increaseLeftTaskCount(todo.id);
    });
  }
};

const getLeftTaskCount = tasks => tasks.filter(task => !task.done).length;

const attachHandlersToTodo = function(todo) {
  getTodoDelBtn(todo).onclick = deleteTodo.bind(null, todo.id);
  const newTaskField = todo.lastElementChild;
  newTaskField.onkeydown = addTaskToTodo.bind(null, todo, newTaskField);
  const title = getTodoTitle(todo);
  title.onblur = modifyTodoTitle.bind(null, title, todo.id);
  title.onkeydown = blurOnEnter.bind(null, title);
};

const generateTodoHtml = function(todoList){
  const todoHtml = document.createElement('div');
  todoHtml.innerHTML = `
  <div class="todoListHeader"> 
    <div class="titleBar">
      <h2 contentEditable="true">${todoList.title}</h2>
      <div class="infoStrap">
        <span class="taskCount">${getLeftTaskCount(todoList.tasks)}</span> left
      </div>
    </div>
    <img src="images/del2.png" alt="delete">
  </div>
  <div class="tasks"></div>
  <input type="text" placeholder="New Task.." class="newTaskInTodoBox">`;
  todoHtml.className = 'todoListBox';
  todoHtml.id = todoList.id;
  attachHandlersToTodo(todoHtml);
  const tasks = todoList.tasks.map(generateTaskHtml.bind(null, todoList.id));
  const tasksContainer = getTasksContainer(todoHtml);
  tasks.forEach(task => tasksContainer.append(task));
  return todoHtml;
};

const projectTodoList = function(todoList) {
  const todoHtml = generateTodoHtml(todoList);
  getTodoListsContainer().prepend(todoHtml);
  todoHtml.lastElementChild.focus();
};
